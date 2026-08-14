const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(409).json({ success: false, message: 'User already exists', code: 'CONFLICT' });
        }

        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);

        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, secure: process.env.NODE_ENV === 'production' });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'UNAUTHORIZED' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'UNAUTHORIZED' });
        }

        const token = generateToken(user._id);
        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, secure: process.env.NODE_ENV === 'production' });

        res.json({
            success: true,
            message: 'Login successful',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.json({ success: true, message: 'Logged out successfully', data: {} });
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', code: 'NOT_FOUND' });
        }
        res.json({
            success: true,
            message: 'User retrieved successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};
