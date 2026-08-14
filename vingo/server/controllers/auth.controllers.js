import User from "../models/user.model.js"
import { genToken } from "../utils/token.js"
import { sendOtpMail } from "../utils/mail.js"

export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ message: 'Email or phone already exists' })
        }

        const user = await User.create({
            fullName,
            email,
            password,
            role,
            mobile
        })

        const token = await genToken(user._id)

        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })


        return res.status(201).json({
                status: "success",
                user
            });
    } catch (error) {
        console.log('sign-up error', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}


export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = await genToken(user._id);

        res.cookie("token", token, {
            secure: false, 
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true
        });

        
        user.password = undefined;

        return res.status(200).json({
            status: "success",
            user
        });

    } catch (error) {
        console.log('sign-in error', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


export const signOut = async (req,res) => {
    try {
        res.clearCookie('token')
        return res.status(200).json({message:'Logged out successfully'})
    } catch (error) {
        console.log('sign-out error', error.message);
        return res.status(500).json({message:'Internal server error'})
    }
}


export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({message:'User not found'})
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()

        user.resetOtp = otp
        user.otpExpires = Date.now() + 5 * 60 * 1000
        await user.save()
        await sendOtpMail(email,otp)
        res.status(200).json({message:'Verification code sent successfully!'})
    } catch (error) {
        console.log('Error while sending the otp ', error.message)
        return res.status(500).json({
            message:'Internal server error'
        })
    }
}


