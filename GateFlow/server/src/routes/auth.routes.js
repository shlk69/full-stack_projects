import express from 'express'
import { registerValidationRules, validate } from '../middleware/user.validation.js'
import { register } from '../controllers/auth.controller.js'

const authRouter = express.Router()



authRouter.post('/register', registerValidationRules, validate, register)


export default authRouter