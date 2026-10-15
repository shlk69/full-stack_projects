const logger = require('./logger');
const dotenv = require('dotenv');
dotenv.config({ quiet: true });
const express = require('express');
const cors = require('cors');
const app = express();
const { rateLimit } = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes')



const { corsOptions } = require("./config");

app.use(cors(corsOptions));
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    if (process.env.NODE_ENV === 'production') res.set('Strict-Transport-Security', 'max-age=31536000');
    if (/^\/(api\/)?(users|captains|rides|trips|admin)(\/|$)/.test(req.path)) res.set('Cache-Control', 'no-store');
    next();
});
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'production') {
    const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { message: 'Too many authentication attempts. Please try again later.' } });
    app.use(/^\/(api\/)?(users|captains)\/(login|register)$/, authLimit);
}



app.get('/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'database-unavailable' }));

app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);




app.use('/api/users', userRoutes);
app.use('/api/captains', captainRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/rides', rideRoutes);
app.use('/trips', require('./routes/trip.routes'));
app.use('/api/trips', require('./routes/trip.routes'));
if (process.env.NODE_ENV !== 'production') app.use('/admin', require('./routes/admin.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));
if (process.env.NODE_ENV === 'production') {
    const dist = path.resolve(__dirname, '../Frontend/dist');
    app.use(express.static(dist, { index: false }));
    app.get('/{*path}', (req, res) => res.sendFile(path.join(dist, 'index.html')));
} else app.get('/', (req, res) => res.send('Uber API running'));
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    logger.error('request_failed', err);
    const status = err.type === 'entity.too.large' ? 413 : err instanceof SyntaxError && err.status === 400 ? 400 : 500;
    res.status(status).json({ message: status === 413 ? 'Request too large' : status === 400 ? 'Invalid request body' : 'Internal server error' });
});
module.exports = app;

