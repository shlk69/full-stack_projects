const logger = require('./logger');
const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');
const connectToDb = require('./db/db');
const { initializeSocket } = require('./socket');
const server = http.createServer(app);
async function start() {
    for (const key of ['JWT_SECRET', 'MAPBOX_ACCESS_TOKEN', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']) {
        if (!process.env[key]) throw new Error(key + ' is required');
    }
    if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must have at least 32 characters');
    await connectToDb();
    initializeSocket(server);
    server.listen(process.env.PORT || 3000, '0.0.0.0', () => logger.info('server_started'));
}
start().catch(error => { logger.error('startup_failed', error); process.exit(1); });
const stop = () => {
    server.close(async () => { await mongoose.disconnect(); process.exit(0); });
    setTimeout(() => process.exit(0), 10000).unref();
};
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
