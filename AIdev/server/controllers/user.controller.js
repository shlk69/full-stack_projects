import { User } from "../models/user.model.js";
import { registerUser } from "../services/user.service.js";
import { validationResult } from 'express-validator';
import { redisClient } from "../services/redis.service.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 
};

export const createUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await registerUser(req.body);
        const token = await user.generateJwt();

        res.cookie('token', token, cookieOptions);
        return res.status(201).json({ user, token, message: 'User registered successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const loginUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ errors: 'Invalid credentials' });
        }
        const isMatching = await user.isValidPassword(password);
        if (!isMatching) {
            return res.status(401).json({ errors: 'Invalid credentials' });
        }

        const token = await user.generateJwt();
        res.cookie('token', token, cookieOptions);

        return res.status(200).json({ user, token, message: 'User logged in successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const profileController = async (req, res) => {
    return res.status(200).json({
        user: req.user
    });
};

export const logoutUserController = async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(400).json({ error: 'No active session found' });
        }

        // Add to Redis Blocklist
        await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};
