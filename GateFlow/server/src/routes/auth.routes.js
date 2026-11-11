import express from 'express'
import { loginValidationRules, registerValidationRules, validate } from '../middleware/user.validation.js'
import { getMe, loginUser, logout, resgisterUser } from '../controllers/auth.controller.js'
import { authenticateUser } from '../middleware/auth.middleware.js'

const authRouter = express.Router()



authRouter.post('/register', registerValidationRules, validate, resgisterUser)
authRouter.post('/login', loginValidationRules, validate, loginUser)
authRouter.post('/login', authenticateUser, logout)
authRouter.get('/me', authenticateUser, getMe)



export default authRouter