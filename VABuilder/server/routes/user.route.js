import express from 'express'
import { getCurrentUser, saveAssistant } from '../controllers/user.controller.js'
import {isAuth} from '../middleware/isAuth.js'
const userRouter = express.Router()


userRouter.get('/current-user', isAuth, getCurrentUser)
userRouter.post('/save-assistant', isAuth , saveAssistant)

export default userRouter