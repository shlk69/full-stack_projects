import express from 'express'
import { auth } from '../middleware/auth.js'
import { getCurrentUser, updateUserLocation } from '../controllers/user.controller.js'

const userRouter = express.Router()


userRouter.get('/current', auth, getCurrentUser)
userRouter.get('/update-location', auth, updateUserLocation)

export default userRouter