import mongoose from "mongoose"
import logger from "../utils/logger.js"

const connection = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            retryWrites: true,
            w: "majority",
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        })
        logger.info('✅ MongoDB connected successfully')
        logger.info(`📍 Database: ${conn.connection.name}`)
        return conn
    } catch (error) {
        logger.error(`❌ MongoDB connection failed: ${error.message}`)
        process.exit(1)
    }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB disconnected')
})

mongoose.connection.on('error', (err) => {
    logger.error(`❌ MongoDB error: ${err.message}`)
})

export { connection }