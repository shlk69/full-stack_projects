import { genToken } from '../config/token.js'
import { User } from '../models/user.model.js'
import { catchAsync } from '../utils/catchAsync.js'
import { successResponse, errorResponse } from '../utils/ApiResponse.js'
import logger from '../utils/logger.js'

export const googleAuth = catchAsync(async (req, res) => {
    const { name, email } = req.body

    if (!name || !email) {
        return errorResponse(res, 'Name and email are required', null, 400)
    }

    let user = await User.findOne({ email })
    if (!user) {
        user = await User.create({
            name,
            email,
            plan: "free"
        })
        logger.info(`New user created: ${email}`)
    }

    const token = await genToken(user._id)

    const isProduction = process.env.NODE_ENV === 'production'
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return successResponse(res, {
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            plan: user.plan
        }
    }, 'User authenticated successfully', 200)
})

export const logout = catchAsync(async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production'
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/'
    })

    return successResponse(res, null, 'Logged out successfully', 200)
})