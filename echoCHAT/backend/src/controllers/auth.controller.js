import User from '../models/User.model.js'
import jwt from 'jsonwebtoken'

export const signup = async (req, res) => {
    const { email, password, fullname } = req.body;
    try {
        if (!email || !password || !fullname) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({message:'Email already exists'})
        }

        const index = Math.floor(Math.random() * 67) + 1
        const randomAvatar = `https://i.pravatar.cc/300?img=${index}`
        const user = await User.create({
            fullname,
            email,
            password,
            profilePic:randomAvatar
        })

        const token = jwt.sign(
            {userId: user._id },
            process.env.JWT_SECRET_KEY,
            {expiresIn:'7d'}
        )
        res.cookies('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure:process.env.NODE_ENV === 'production'
        })

        res.status(201).json({
            success: true,
            user,
            message:'User is successfully registered'
        })
    } catch (error) {
        console.log(
            'signup error: ', error.message)
        return res.status(500).json({
            message: 'Error while registering the user',
            success:false
        })
    }
}

export const login = async (req, res) => {


}

export const logout = async (req, res) => {


}
