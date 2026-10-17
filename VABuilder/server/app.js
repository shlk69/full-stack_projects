import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generalLimiter, authLimiter, apiLimiter } from './middleware/rateLimiter.js';
import errorMiddleware from './middleware/error.middleware.js';
import authRoutes from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import assistantRouter from './routes/assistant.route.js';
import billingRouter from './routes/billing.routes.js';
const app = express();
const production = process.env.NODE_ENV === 'production';
if (production) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({
 crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
 crossOriginResourcePolicy: { policy: 'cross-origin' },
 contentSecurityPolicy: { directives: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", 'https://checkout.razorpay.com', 'https://apis.google.com'],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:'],
  connectSrc: ["'self'", 'https://*.googleapis.com', 'https://*.firebaseio.com', 'https://*.razorpay.com'],
  frameSrc: ['https://*.firebaseapp.com', 'https://*.razorpay.com', 'https://accounts.google.com'],
  objectSrc: ["'none'"],
  upgradeInsecureRequests: production ? [] : null,
 } },
}));
app.use(compression());
const allowedOrigins = [
 ...(process.env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean),
 process.env.RENDER_EXTERNAL_URL,
 ...(!production ? ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'] : []),
].filter(Boolean);
const privateCors = cors({ origin: allowedOrigins, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'], maxAge: 3600 });
const publicCors = cors({ origin: '*', methods: ['GET', 'POST'] });
app.use(express.json({ limit: '128kb' }));
app.use(express.urlencoded({ limit: '128kb', extended: false }));
app.use(cookieParser());
app.get('/health', (req, res) => {
 const ready = mongoose.connection.readyState === 1;
 res.status(ready ? 200 : 503).json({ status: ready ? 'OK' : 'unavailable' });
});
app.use('/api', generalLimiter);
app.use('/api/auth', privateCors, authLimiter, authRoutes);
app.use('/api/user', privateCors, apiLimiter, (req,res,next) => { res.set('Cache-Control', 'no-store'); next(); }, userRouter);
app.use('/api/billing', privateCors, apiLimiter, (req,res,next) => { res.set('Cache-Control', 'no-store'); next(); }, billingRouter);
app.use('/api/assistant', publicCors, assistantRouter);
app.use('/api', (req,res) => res.status(404).json({ success: false, message: 'Route not found' }));
if (production) {
 const dist = fileURLToPath(new URL('../client/dist/', import.meta.url));
 app.use('/assets', express.static(path.join(dist, 'assets'), { maxAge: '1y', immutable: true }));
 app.use(express.static(dist, { maxAge: 0 }));
 app.get('/{*page}', (req,res,next) => {
  if (path.extname(req.path) || req.path.split('/').some(segment => segment.startsWith('.'))) return next();
  res.set('Cache-Control', 'no-cache'); res.sendFile(path.join(dist, 'index.html'));
 });
} else app.get('/', (req,res) => res.json({ message: 'VABuilder API is running', version: '1.0.0' }));
app.use((req,res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorMiddleware);
export default app;
