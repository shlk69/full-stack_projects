import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { redisClient } from '../services/redis.service.js';

export const authenticatedUser = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized User' });
        }

        // 2. Check Redis blocklist
        const isBlackListed = await redisClient.get(token);
        if (isBlackListed) {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            return res.status(401).json({ error: 'User already logged out' });
        }

        // 3. Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach user payload to the request object
        req.user = decoded;

        return next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Unauthorized User. Invalid or expired token.' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
