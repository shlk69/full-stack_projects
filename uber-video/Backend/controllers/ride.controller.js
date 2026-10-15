const logger = require('../logger');
const publicMessage = error => ['Ride id is required','Ride not found','Ride unavailable or already accepted','Ride id and OTP are required','Ride is assigned to another captain','Ride not accepted','Invalid OTP','Ride was cancelled or already started','Ride not ongoing','Ride is no longer ongoing'].includes(error.message) ? error.message : 'Unable to process ride request. Please retry.';
const rideServices = require('../services/ride.service')
const { validationResult } = require('express-validator')
const mapServices = require('../services/maps.service');
const { sendMessageToSocketId, sendMessageToCaptains } = require('../socket');
const rideModel = require('../models/ride.model')


module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        const pickupCoordinates = await mapServices.getAddressCoordinate(pickup);
        const ride = await rideServices.createRide({
            user: req.user._id,
            pickup,
            destination,
            vehicleType,
        });
        let captainsToNotify = await mapServices.getCaptainsInTheArea(
            pickupCoordinates.latitude,
            pickupCoordinates.longitude,
            5,
        );
        if (captainsToNotify.length === 0) {
            captainsToNotify = await mapServices.getOnlineCaptains();
            if (captainsToNotify.length > 0) {
            }
        }
        const rideWithUser = await rideModel
            .findById(ride._id)
            .populate('user')
            .select('-otp');

        const rideData = rideWithUser.toObject();
        const deliveries = await Promise.all(captainsToNotify.map((captain) => {
            const pickupDistanceKm = mapServices.getDistanceInKm(
                {
                    latitude: captain.location?.ltd,
                    longitude: captain.location?.lng,
                },
                pickupCoordinates,
            );

            return sendMessageToCaptains(
                [captain],
                {
                    event: 'new-ride',
                    data: { ...rideData, pickupDistanceKm },
                },
            );
        }));
        const notifiedCaptains = deliveries.reduce((total, count) => total + count, 0);

        if (notifiedCaptains === 0 && req.user.socketId) {
            sendMessageToSocketId(req.user.socketId, {
                event: 'ride-request-unavailable',
                data: {
                    rideId: ride._id,
                    targetedCaptains: captainsToNotify.length,
                },
            });
        }

        if (notifiedCaptains === 0) {
        }

        return res.status(201).json({
            ride: rideWithUser,
            targetedCaptains: captainsToNotify.length,
            notifiedCaptains,
        });
    } catch (err) {
        logger.error('ride_dispatch_failed', err);
        return res.status(500).json({ message: publicMessage(err) });
    }

};


module.exports.getFare = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()})
    }

    try {
        const { pickup, destination } = req.query
        const fare = await rideServices(pickup, destination)
        return res.status(200).json({fare})
    } catch (error) {
        logger.error('fare_lookup_failed', error);
        return res.status(500).json({message:'Internal server error'})
    }
}

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideServices.confirmRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        })

        const captainRide = ride.toObject();
        delete captainRide.otp;
        return res.status(200).json(captainRide);
    } catch (err) {

        logger.error('ride_confirmation_failed', err);
        return res.status(500).json({ message: publicMessage(err) });
    }
}

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideServices.startRide({ rideId, otp, captain: req.captain });



        ride.otp = undefined;
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: publicMessage(err) });
    }
}

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideServices.endRide({ rideId, captain: req.captain });

        ride.otp = undefined;
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        })



        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: publicMessage(err) });
    }
}