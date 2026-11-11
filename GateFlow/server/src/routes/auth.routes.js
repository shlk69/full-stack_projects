import express from 'express'
import { loginValidationRules, registerValidationRules, validate } from '../middleware/user.validation.js'
<<<<<<< HEAD
import { getMe, loginUser, logout, resgisterUser } from '../controllers/auth.controller.js'
import { authenticateUser } from '../middleware/auth.middleware.js'
=======
import { loginUser, resgisterUser } from '../controllers/auth.controller.js'
>>>>>>> ca9958a22d28f283c0ffe259d9231e0884da60c4

const authRouter = express.Router()



authRouter.post('/register', registerValidationRules, validate, resgisterUser)
authRouter.post('/login', loginValidationRules, validate, loginUser)
<<<<<<< HEAD
authRouter.post('/login', authenticateUser, logout)
authRouter.get('/me', authenticateUser, getMe)

=======
>>>>>>> ca9958a22d28f283c0ffe259d9231e0884da60c4


export default authRouter