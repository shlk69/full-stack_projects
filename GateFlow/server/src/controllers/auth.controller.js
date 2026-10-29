import { User } from "../models/user.model.js";
import { registerUser } from "../services/auth.service.js";

export async function register(req,res) {
    try {
        const { name, email, password } = req.body
        const existingUser = await User.findOne({ email })
        return res.status(409).json({message:'User already exists'})
        const user = await registerUser({ name, email, password })
        return res.status(201).json({
            message: 'User registered successfully',
            user
        })
    } catch (error) {
        return res.status(500).json({message:'Internal server error'})
    }
}