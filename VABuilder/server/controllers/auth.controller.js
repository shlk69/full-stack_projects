import { genToken } from '../config/token.js'
import { User } from '../models/user.model.js'

export const googleAuth = async(req, res) => {
    try {
        let { name, email } = req.body
        if (!name || !email) {
            return res.status(400).json({
                message:'Name and email are required'
            })
        }
        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({
                name,email
            })
        }
        const token = await genToken(user._id)
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge:7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json({
            message: 'User created successfully',
            user
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message:`Google auth error :${error.message}`
        })
    }
}


export const logout = async (req, res) => {
    try {
        await res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        })
        return res.status(200).json({
            message: 'Logged out successfully',
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message:`Logout failed `
        })   
    }
}