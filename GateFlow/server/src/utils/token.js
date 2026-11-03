import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export function generateAccessToken(user) {
    return jwt.sign(
        {
            type: "access",
        },
        process.env.JWT_ACCESS_SECRET,
        {
            subject: user._id.toString(),
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
        }
    );
}

export function generateRefreshToken(userId, sessionId) {
    return jwt.sign(
        {
            type: "refresh",
        },
        process.env.JWT_REFRESH_SECRET,
        {
            subject: userId.toString(),
            jwtid: sessionId,
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
        }
    );
}

export function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

export function hashToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}