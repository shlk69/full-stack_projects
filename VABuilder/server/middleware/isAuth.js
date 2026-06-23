import jwt from 'jsonwebtoken'
import logger from '../utils/logger.js'

export const isAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.token

        if (!token && req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token || token === 'undefined' || token === 'null') {
            logger.warn('Unauthorized access attempt: No token provided')
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            })
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = verifyToken.userId || verifyToken.id
        next()
    } catch (error) {
        logger.error(`Authentication error: ${error.message}`)
        const statusCode = error.name === 'TokenExpiredError' ? 401 : 401
        const message = error.name === 'TokenExpiredError'
            ? 'Token has expired'
            : 'Invalid or malformed token'

        return res.status(statusCode).json({
            success: false,
            message
        })
    }
}