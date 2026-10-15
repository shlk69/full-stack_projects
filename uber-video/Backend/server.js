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
    await connectToDb();
    initializeSocket(server);
    server.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('Server started'));
}
start().catch(error => { console.error('Startup failed:', error.name); process.exit(1); });
const stop = () => {
    server.close(async () => { await mongoose.disconnect(); process.exit(0); });
    setTimeout(() => process.exit(0), 10000).unref();
};
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
