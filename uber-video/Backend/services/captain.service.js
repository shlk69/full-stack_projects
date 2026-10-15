const captainModel = require('../models/captain.model');
const rideModel = require('../models/ride.model');


module.exports.createCaptain = async ({
    firstname, lastname, email, password, color, plate, capacity, vehicleType
}) => {
    if (!firstname || !email || !password || !color || !plate || !capacity || !vehicleType) {
        throw new Error('All fields are required');
    }
    const captain = captainModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        }
    })

    return captain;
}

module.exports.getDashboardStats = async (captain) => {
    const [rideStats] = await rideModel.aggregate([
        {
            $match: {
                captain: captain._id,
                status: 'completed',
            },
        },
        {
            $group: {
                _id: null,
                successfulRides: { $sum: 1 },
                totalEarned: { $sum: '$fare' },
            },
        },
    ]);

    const onlineSeconds = Number(captain.totalOnlineSeconds || 0) +
        (captain.status === 'active' && captain.onlineSince
            ? Math.max(0, Math.floor((Date.now() - captain.onlineSince.getTime()) / 1000))
            : 0);

    return {
        successfulRides: rideStats?.successfulRides || 0,
        totalEarned: rideStats?.totalEarned || 0,
        onlineSeconds,
        isOnline: captain.status === 'active' && Boolean(captain.onlineSince),
        vehicleType: captain.vehicle.vehicleType,
    };
};

const closeOnlineSession = async (captain, socketId) => {
    const onlineSince = captain.onlineSince;
    const filter = {
        _id: captain._id,
        onlineSince: onlineSince || null,
    };
    if (socketId) filter.socketId = socketId;

    const update = {
        $set: {
            status: 'inactive',
            onlineSince: null,
            socketId: null,
        },
    };

    if (onlineSince) {
        update.$inc = {
            totalOnlineSeconds: Math.max(
                0,
                Math.floor((Date.now() - onlineSince.getTime()) / 1000),
            ),
        };
    }

    await captainModel.updateOne(filter, update);
};

module.exports.markCaptainOnline = async (captainId, socketId, location) => {
    const captain = await captainModel.findById(captainId);
    if (!captain) {
        throw new Error('Captain not found');
    }

    captain.socketId = socketId;
    captain.status = 'active';
    if (!captain.onlineSince) {
        captain.onlineSince = new Date();
    }
    if (location) {
        captain.location = location;
    }
    await captain.save();
};

module.exports.markCaptainOfflineBySocket = async (socketId) => {
    const captain = await captainModel.findOne({ socketId });
    if (captain) {
        await closeOnlineSession(captain, socketId);
    }
};

module.exports.markCaptainOffline = async (captainId, socketId) => {
    const captain = await captainModel.findById(captainId);
    if (captain) {
        await closeOnlineSession(captain, socketId);
    }
};