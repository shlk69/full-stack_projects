import jwt from 'jsonwebtoken'

export const auth = async (req, res, next) => {
    try {
        // 1. Check if token exists
        const token = req.cookies?.token
        if (!token) {
            return res.status(401).json({ message: 'Authentication required. Please login first.' })
        }

        // 2. Verify token (thows error if expired or tampered)
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

        if (!decodedToken || !decodedToken.userId) {
            return res.status(401).json({ message: 'Invalid token structure. Authorization denied.' })
        }

        // 3. Attach user ID to the request object
        req.userId = decodedToken.userId
        next()

    } catch (error) {
        // 4. Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Your session has expired. Please login again.' })
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token. Authorization denied.' })
        }

        // 5. Handle unexpected server errors
        console.error('Authentication Middleware Error:', error)
        return res.status(500).json({ message: 'Internal server error during authentication.' })
    }
}

