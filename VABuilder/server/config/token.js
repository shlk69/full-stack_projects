import jwt from 'jsonwebtoken'
import logger from '../utils/logger.js'

export const genToken = async (userId) => {
    try {
        const token = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )
        return token
    } catch (error) {
        logger.error(`Token generation error: ${error.message}`)
        throw error
    }
}
