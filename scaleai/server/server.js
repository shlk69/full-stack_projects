import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import { errorHandler } from './src/middleware/errorHandlerMiddleware.js';

import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import sourceRoutes from './src/routes/sourceRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import postRoutes from './src/routes/postRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/sources', sourceRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/posts', postRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
