const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
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
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.get('/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'database-unavailable' }));

app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);




app.use('/api/users', userRoutes);
app.use('/api/captains', captainRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));
if (process.env.NODE_ENV === 'production') {
    const dist = path.resolve(__dirname, '../Frontend/dist');
    app.use(express.static(dist, { index: false }));
    app.get('/{*path}', (req, res) => res.sendFile(path.join(dist, 'index.html')));
} else app.get('/', (req, res) => res.send('Uber API running'));
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    console.error('Request failed:', err.name);
    res.status(500).json({ message: 'Internal server error' });
});
module.exports = app;

