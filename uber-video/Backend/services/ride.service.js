const rideModel = require('../models/ride.model')
const mapService = require('./maps.service')
const crypto = require('crypto');



async function getFare(pickup, destination) {
    if (!pickup || !destination) {
        throw new Error("Pickup and destination are required");
    }

    const [pickupCoordinates, destinationCoordinates] = await Promise.all([
        mapService.getAddressCoordinate(pickup),
        mapService.getAddressCoordinate(destination),
    ]);
    const distanceTime = await mapService.getDistanceTime(
        pickupCoordinates,
        destinationCoordinates
    );

    const { distanceKm, durationMinutes } = distanceTime;

    const baseFare = {
        auto: 30,
        car: 50,
        moto: 20,
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        moto: 8,
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        moto: 1.5,
    };
    const fareMultiplier = 0.7;

    const fare = {
        auto: Math.round(
            (baseFare.auto +
            distanceKm * perKmRate.auto +
            durationMinutes * perMinuteRate.auto) * fareMultiplier
        ),

        car: Math.round(
            (baseFare.car +
            distanceKm * perKmRate.car +
            durationMinutes * perMinuteRate.car) * fareMultiplier
        ),

        moto: Math.round(
            (baseFare.moto +
            distanceKm * perKmRate.moto +
            durationMinutes * perMinuteRate.moto) * fareMultiplier
        ),
    };

    return {
        ...fare,
        distanceKm,
        durationMinutes,
    };
}

module.exports = getFare

function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}

module.exports.createRide = async ({
    user, pickup, destination, vehicleType
}) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(pickup, destination);



    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        otp: getOtp(6),
        fare: fare[vehicleType],
        distance: Math.round(fare.distanceKm * 1000),
        duration: fare.durationMinutes * 60,
    })

    return ride;
}
module.exports.confirmRide = async ({
    rideId, captain
}) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const accepted = await rideModel.findOneAndUpdate({ _id: rideId, status: 'pending' }, { status: 'accepted', captain: captain._id }, { new: true });
    if (!accepted) throw new Error('Ride unavailable or already accepted');

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    return ride;

}

module.exports.startRide = async ({ rideId, otp, captain }) => {
    if (!rideId || !otp) {
        throw new Error('Ride id and OTP are required');
    }

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (String(ride.captain?._id) !== String(captain._id)) throw new Error('Ride is assigned to another captain');
    if (ride.status !== 'accepted') {
        throw new Error('Ride not accepted');
    }

    if (ride.otp !== otp) {
        throw new Error('Invalid OTP');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'ongoing'
    })

    return ride;
}

module.exports.endRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'ongoing') {
        throw new Error('Ride not ongoing');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'completed'
    })

    ride.status = 'completed';
    return ride;
}