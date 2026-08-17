import express from 'express'
import { auth } from '../middleware/auth.js'
import { getCurrentUser } from '../controllers/user.controller.js'

const userRouter = express.Router()


userRouter.get('/current', auth, getCurrentUser)

export default userRouter