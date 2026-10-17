import mongoose from "mongoose"
import logger from "../utils/logger.js"

const connection = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            retryWrites: true,
            w: "majority",
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        })


        return conn
    } catch (error) {
        logger.error('MongoDB connection failed')
        throw error
    }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB disconnected')
})

mongoose.connection.on('error', () => {
    logger.error('MongoDB connection error')
})

export { connection }