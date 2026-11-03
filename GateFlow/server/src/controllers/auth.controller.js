import { User } from "../models/user.model.js"
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken, hashToken } from "../utils/token.js"
import crypto from 'crypto'
import mongoose from "mongoose"
import { RefreshSession } from "../models/refresh-session.model.js"



export const resgisterUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const existUser = await User.findOne({ email })
        if (existUser) {
            return res.status(409).json({ message: 'User already exists' })
        }
        const hashedPass = await bcrypt.hash(password, 10)
        const user = await User.create({
            name, email, passwordHash: hashedPass,
        })
        return res.status(201).json({
            message: 'User created successfully',
            user
        })
    } catch (error) {
        console.log('Error while creating user', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email }).select('+passwordHas')
        if (!user || !(await user.comparePassword(password))) {
            throw createError('Invalid email or password', 401);
        }

        if (user.status === 'disables') {
            return res.status(403).json('Your account is disabled')
        }


        const sessionId = new mongoose.Types.ObjectId()
        const familyId = crypto.randomUUID()


        const refreshToken = generateRefreshToken(user._id, sessionId)
        const accessToken = generateAccessToken(user)
        const hashedRefreshToken = hashToken(refreshToken)

        await RefreshSession.create({
            _id: sessionId, 
            userId: user._id,
            tokenHash: hashedRefreshToken,
            familyId: familyId,
            status: "active",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        });
        user.lastLoginAt = new Date()
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, secure: true
        })
        return res.status(200).json({ message: 'Login successful', accessToken, user})

    } catch (error) {

    }
}

