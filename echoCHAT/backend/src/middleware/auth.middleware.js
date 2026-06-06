import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'

export const verifyJwt = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            return res.status(401).json({message:'Unauthorized : No token provided'})
        }

        const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY)
        if (!decoded) {
            return res.status(401).json({message:'Unauthorized : Invalid token'})
        }

        const user = await User.findById(decoded.userId).select('-select')
        if (!user) {
            return res.status(404).json("Unauthorized : User not found")
        }

        req.user = user
        next()
    } catch (error) {
        console.log('Error in auth middleware :', error.message)
        return res.status(500).json({message:'Internal server error'})
    }
}