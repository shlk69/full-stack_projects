import dotenv from 'dotenv'
dotenv.config({
    path: './.env'
})

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { generalLimiter, authLimiter, apiLimiter } from './middleware/rateLimiter.js'
import { requestLogger } from './middleware/requestLogger.js'
import errorMiddleware from './middleware/error.middleware.js'
import authRoutes from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import assistantRouter from './routes/assistant.route.js'
import billingRouter from './routes/billing.routes.js'
import logger from './utils/logger.js'


const app = express()

// Security Middleware
app.use(helmet({
    crossOriginOpenerPolicy: false,
}))
app.use(compression())
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(value => value.trim())
    : ['http://localhost:5173', 'http://localhost:3000']

const privateCors = cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
})

const publicCors = cors({
    origin: '*',
    methods: ['GET', 'POST'],
})

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())

// Request Logging
app.use(requestLogger)

// Rate Limiting
app.use(generalLimiter)

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.get('/', (req, res) => {
    res.json({
        message: 'VABuilder API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    })
})

// Protected Routes with Auth Rate Limiter
app.use('/api/auth', authLimiter, privateCors, authRoutes)
app.use('/api/user', apiLimiter, privateCors, userRouter)
app.use('/api/billing', apiLimiter, privateCors, billingRouter)

// Public Routes
app.use('/api/assistant', publicCors, assistantRouter)

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    })
})

// Error Handling Middleware
app.use(errorMiddleware)


export default app;
