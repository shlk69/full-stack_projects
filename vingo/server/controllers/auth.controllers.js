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
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

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


export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await User.findOne({ email })

        if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "invalid/expired otp" })
        }

        user.isOtpVerified = true
        user.resetOtp = undefined
        user.otpExpires = undefined
        await user.save()

        return res.status(200).json({ message: "otp verified successfully" })
    } catch (error) {
        console.error("OTP Verification Error:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body
        const user = await User.findOne({ email })

        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "otp verification required" })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.isOtpVerified = false
        await user.save()

        return res.status(200).json({ message: "password reset successfully" })
    } catch (error) {
        console.error("Reset Password Error:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobile,role } = req.body
        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({
                fullName, email, mobile, role
            })
        }

        const token = await genToken(user._id)
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })

        return res.status(200).json({message:'User created successfully',user})
    } catch (error) {
        console.log('Error while google auth ',error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
