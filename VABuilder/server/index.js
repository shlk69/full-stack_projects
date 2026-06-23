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
import { connection } from './config/connectDB.js'
import validateEnv from './config/validateEnv.js'
import { generalLimiter, authLimiter, apiLimiter } from './middleware/rateLimiter.js'
import { requestLogger } from './middleware/requestLogger.js'
import errorMiddleware from './middleware/error.middleware.js'
import authRoutes from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import assistantRouter from './routes/assistant.route.js'
import billingRouter from './routes/billing.routes.js'
import logger from './utils/logger.js'

// Validate environment variables
validateEnv()

const app = express()
const isProduction = process.env.NODE_ENV === 'production'

// Security Middleware
app.use(helmet())
app.use(compression())
app.use(morgan('combined'))

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
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

const PORT = process.env.PORT || 8000

const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port: ${PORT}`)
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    connection()
})

// Graceful Shutdown
process.on('SIGTERM', () => {
    logger.warn('SIGTERM signal received: closing HTTP server')
    server.close(() => {
        logger.info('HTTP server closed')
        process.exit(0)
    })
})

process.on('SIGINT', () => {
    logger.warn('SIGINT signal received: closing HTTP server')
    server.close(() => {
        logger.info('HTTP server closed')
        process.exit(0)
    })
})

// Unhandled Promise Rejection Handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
})
