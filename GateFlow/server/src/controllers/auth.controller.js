import { User } from "../models/user.model.js"
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken, hashToken, verifyRefreshToken } from "../utils/token.js"
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
        const user = await User.findOne({ email }).select("+passwordHash")
        const isPassMatch = user.comparePassword(password)
        if (!user || !isPassMatch) {
            return res.status(401).json({message:'Invalid email or password'})
        }

        if (user.status === 'disabled') {
            return res.status(403).json({message:'Your accounr is disabled'})
        }

        const familyId = crypto.randomUUID()
        const sessionId = crypto.randomUUID()
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user._id, sessionId)
        const hashedRefresh = hashToken(refreshToken)

        await RefreshSession.create({
            sessionId,
            userId: user._id,
            tokenHash: hashedRefresh,
            familyId,
            status:'active'
        })
        user.lastLoginAt = new Date()
        await user.save()
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,    
            secure: true,       
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        return res.status(200).json({ message: 'Login successful', accessToken, user})
    } catch (error) {
        console.log('Error while logging in user', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export async function refresh(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Unauthorized , please login again",
            });
        }

        const decoded = verifyRefreshToken(refreshToken);

        const tokenHash = hashToken(refreshToken);

        const session = await RefreshSession.findOne({
            tokenHash,
            status: "active",
            expiresAt: { $gt: new Date() },
        });

        if (!session) {
            return res.status(401).json({
                message: "Invalid refresh session",
            });
        }

        const user = await User.findById(decoded.sub);

        if (!user || user.status !== "active") {
            return res.status(401).json({
                message: "User not found or disabled",
            });
        }

        const newSessionId = randomUUID();

        const newRefreshToken = generateRefreshToken(
            user._id,
            newSessionId
        );

        const newAccessToken = generateAccessToken(user);

        const newTokenHash = hashToken(newRefreshToken);

        const updatedSession = await RefreshSession.findOneAndUpdate(
            {
                _id: session._id,
                status: "active",
                expiresAt: { $gt: new Date() },
            },
            {
                $set: {
                    status: "rotated",
                    rotatedAt: new Date(),
                    replacedByTokenHash: newTokenHash,
                },
            },
            { new: true }
        );

        if (!updatedSession) {
            return res.status(401).json({
                message: "Refresh token already used",
            });
        }

        const decodedNewToken = verifyRefreshToken(newRefreshToken);

        await RefreshSession.create({
            userId: user._id,
            tokenHash: newTokenHash,
            familyId: session.familyId,
            status: "active",
            expiresAt: new Date(decodedNewToken.exp * 1000),
        });

        res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            message: "Token refreshed successfully",
        });

    } catch (error) {
        console.log('Error while refreshing the token ', error.message)
        return res.status(500).json({message:'Internal server error'})
    }
}


export async function logout(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            const tokenHash = hashToken(refreshToken);

            await RefreshSession.findOneAndUpdate(
                {
                    tokenHash,
                    status: "active",
                },
                {
                    $set: {
                        status: "revoked",
                        revokedAt: new Date(),
                    },
                }
            );
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/auth",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });

    } catch (error) {
        next(error); console.log('Error while logging out ', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}


export function getMe(req, res) {
    return res.status(200).json({
        success: true,
        user: req.user,
    });
}