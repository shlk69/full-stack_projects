const socketIo = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const rideModel = require('./models/ride.model');
const blacklist = require('./models/blacklistToken.model');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const captainService = require('./services/captain.service');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: require('./config').corsOptions
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);


        socket.on('join', async (data, acknowledge) => {
            if (!data || !['user', 'captain'].includes(data.userType) ||
                !mongoose.isValidObjectId(data.userId)) {
                console.warn('Ignoring socket join with invalid user data.');
                if (typeof acknowledge === 'function') {
                    acknowledge({ success: false, message: 'Invalid socket user data' });
                }
                return;
            }

            const { userId, userType, location } = data;

            try {
                const identity = jwt.verify(data.token, process.env.JWT_SECRET);
                if (String(identity._id) !== String(userId) || await blacklist.exists({ token: data.token })) throw new Error('Unauthorized socket');
                const model = userType === 'user' ? userModel : captainModel;
                if (!await model.exists({ _id: userId })) throw new Error('Identity not found');
                socket.data.identity = { userId, userType };
                if (userType === 'user') {
                    await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
                } else {
                    if (location && (
                        !Number.isFinite(location.ltd) ||
                        !Number.isFinite(location.lng) ||
                        Math.abs(location.ltd) > 90 ||
                        Math.abs(location.lng) > 180
                    )) {
                        if (typeof acknowledge === 'function') {
                            acknowledge({ success: false, message: 'Invalid captain location' });
                        }
                        return;
                    }
                    await socket.join(`captain:${userId}`);
                    await captainService.markCaptainOnline(userId, socket.id, location);
                }
                if (typeof acknowledge === 'function') {
                    acknowledge({ success: true });
                }
            } catch (error) {
                console.error('Failed to register socket connection:', error);
                socket.emit('join-error', { message: 'Unable to register socket connection' });
                if (typeof acknowledge === 'function') {
                    acknowledge({ success: false, message: 'Unable to register socket connection' });
                }
            }
        });


        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data || {};

            if (socket.data.identity?.userType !== 'captain' || socket.data.identity.userId !== userId || !mongoose.isValidObjectId(userId) ||
                !Number.isFinite(location?.ltd) ||
                !Number.isFinite(location?.lng) ||
                Math.abs(location.ltd) > 90 ||
                Math.abs(location.lng) > 180) {
                return socket.emit('error', { message: 'Invalid location data' });
            }

            try { await captainModel.findByIdAndUpdate(userId, {
                location: {
                    ltd: location.ltd,
                    lng: location.lng
                }
            }); } catch { socket.emit('location-error', { message: 'Unable to update location' }); }
        });

        socket.on('track-ride', async (data, ack = () => {}) => {
            try {
                const { rideId, role, token } = data || {};
                if (!mongoose.isValidObjectId(rideId) || !['user', 'captain'].includes(role)) throw new Error();
                const identity = jwt.verify(token, process.env.JWT_SECRET);
                if (await blacklist.exists({ token })) throw new Error();
                const ride = await rideModel.findById(rideId);
                if (!ride || !['accepted', 'ongoing'].includes(ride.status) || String(ride[role]) !== String(identity._id)) throw new Error();
                await socket.join('tracking:' + rideId);
                socket.data.tracking = { rideId, role, identity: identity._id, token };
                const captain = await captainModel.findById(ride.captain);
                const loc = captain?.location;
                ack({ success: true, location: Number.isFinite(loc?.lng) && Number.isFinite(loc?.ltd) ? [loc.lng, loc.ltd] : null });
            } catch { ack({ success: false, message: 'Unable to authorize ride tracking.' }); }
        });
        socket.on('leave-tracking', ({ rideId } = {}) => {
            socket.leave('tracking:' + rideId);
            if (socket.data.tracking?.rideId === rideId) delete socket.data.tracking;
        });
        socket.on('share-ride-location', async (data, ack = () => {}) => {
            try {
                const auth = socket.data.tracking;
                const { rideId, location } = data || {};
                if (!auth || auth.role !== 'captain' || auth.rideId !== rideId || !Array.isArray(location) || location.length !== 2 || !location.every(Number.isFinite) || Math.abs(location[0]) > 180 || Math.abs(location[1]) > 90) throw new Error();
                jwt.verify(auth.token, process.env.JWT_SECRET);
                if (await blacklist.exists({ token: auth.token })) throw new Error();
                const ride = await rideModel.findOne({ _id: rideId, captain: auth.identity, status: { $in: ['accepted', 'ongoing'] } });
                if (!ride) throw new Error();
                await captainModel.findByIdAndUpdate(auth.identity, { location: { lng: location[0], ltd: location[1] } });
                socket.to('tracking:' + rideId).emit('ride-location', { rideId, location });
                ack({ success: true });
            } catch { ack({ success: false, message: 'Unable to share ride location.' }); }
        });

        socket.on('disconnect', async () => {
            console.log(`Client disconnected: ${socket.id}`);
            try {
                await captainService.markCaptainOfflineBySocket(socket.id);
            } catch (error) {
                console.error('Failed to update captain online time:', error);
            }
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {



    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
}

const sendMessageToCaptains = async (captains, messageObject) => {
    if (!io) {
        console.error('Cannot send captain notifications: Socket.io is not initialized.');
        return 0;
    }

    const deliveryResults = await Promise.all(captains.map((captain) =>
        new Promise((resolve) => {
            const destinations = io
                .to(`captain:${captain._id}`)
                .to(captain.socketId);
            destinations
                .timeout(3000)
                .emit(messageObject.event, messageObject.data, (error, responses) => {
                    if (error || !responses?.length) {
                        console.warn(`Captain notification was not acknowledged: ${captain._id}`);
                        resolve(false);
                        return;
                    }
                    resolve(true);
                });
        }),
    ));

    return deliveryResults.filter(Boolean).length;
};

module.exports = {
    initializeSocket,
    sendMessageToSocketId,
    sendMessageToCaptains,
};