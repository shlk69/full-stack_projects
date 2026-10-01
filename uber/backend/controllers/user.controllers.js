const blacklistTokenModel = require('../models/blacklistToken.model')
const userModel = require('../models/user.model')
const userService = require('../services/user.service')
const { validationResult } = require('express-validator')

module.exports.registerUser = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { fullname, email, password } = req.body;
    const isAlreadyExists = await captainModel.findOne({ email })
    if (isAlreadyExists) {
        return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword
    });

    const token = user.generateAuthToken();
    res.status(201).json({ token, user })
}

module.exports.loginUser = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body
    const user = await userModel.findOne({ email }).select('+password')
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = user.generateAuthToken();
    res.cookie('token', token)
    res.status(201).json({ token, user })
}


module.exports.getUserProfile = async (req, res) => {
    try {
        // req.user is already populated by your authUser middleware
        return res.status(200).json(req.user);
    } catch (error) {
        return res.status(500).json({ message: 'Server error retrieving profile' });
    }
}

module.exports.logoutUser = async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }

        // 2. Blacklist the token string
        await blacklistTokenModel.create({ token });

        // 3. Clear the cookie after reading the token
        res.clearCookie('token');

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error during logout' });
    }
}
