import express from 'express'
import { loginValidationRules, registerValidationRules, validate } from '../middleware/user.validation.js'
import { loginUser, resgisterUser } from '../controllers/auth.controller.js'

const authRouter = express.Router()



authRouter.post('/register', registerValidationRules, validate, resgisterUser)
authRouter.post('/login', loginValidationRules, validate, loginUser)


export default authRouter