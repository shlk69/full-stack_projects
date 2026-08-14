const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const ProjectMember = require('../models/ProjectMember');

let io;

const initSockets = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true
        }
    });

    // Authentication middleware for sockets
    io.use((socket, next) => {
        try {
            // Get token from cookie (if passed in browser natively) or auth header / auth object
            const cookie = socket.request.headers.cookie;
            let token = null;
            if (cookie) {
                const tokenCookie = cookie.split(';').find(c => c.trim().startsWith('token='));
                if (tokenCookie) {
                    token = tokenCookie.split('=')[1];
                }
            }

            if (!token && socket.handshake.auth.token) {
                token = socket.handshake.auth.token;
            }

            if (!token) return next(new Error('Authentication Error'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // { userId }
            next();
        } catch (err) {
            next(new Error('Authentication Error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id} (User: ${socket.user.userId})`);

        socket.on('project:join', async (projectId) => {
            // Verify user has access to project
            try {
                const membership = await ProjectMember.findOne({ project: projectId, user: socket.user.userId });
                if (membership) {
                    socket.join(`project:${projectId}`);
                    console.log(`User ${socket.user.userId} joined project:${projectId}`);
                }
            } catch (err) {
                console.error('Error joining project room', err);
            }
        });

        socket.on('project:leave', (projectId) => {
            socket.leave(`project:${projectId}`);
            console.log(`User ${socket.user.userId} left project:${projectId}`);
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initSockets, getIo };
