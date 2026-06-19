import { User } from "../models/user.model.js";
import {registerUser} from "../services/user.service.js";
import {validationResult} from 'express-validator'

export const createUserController = async (req,res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()})
    }

    try {
        const user = await registerUser(req.body)
        const token = await user.generateJwt()
        res.status(201).json({user,token,message:'User registered successfully'})
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

export const loginUserController = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({errors:'Invalid credentials'})
        }
        const isMatching = await user.isValidPassword(password)
        if (!isMatching) {
            return res.status(401).json({ errors: 'Invalid credentials' })
        }

        const token = await user.generateJwt()
        return res.status(200).json({user,token,message:'User logged in successfully'})

    } catch (error) {
        return res.status(500).json({message:'Internal server error'})
    }
}

export const profileController = async(req, res) => {
    console.log(req.user)
    res.send(req.user.email)
    return res.status(200).json({
        user:req.user
    })
}