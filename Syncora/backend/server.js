require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running'
    });
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB successfully.'))
    .catch((err) => console.error('MongoDB connection error:', err));

const { initSockets } = require('./sockets/socket');
const http = require('http');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', require('./routes/comment.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

initSockets(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
