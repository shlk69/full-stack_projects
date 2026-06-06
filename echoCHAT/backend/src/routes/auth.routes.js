import express from 'express'
import { login, logout, signup } from '../controllers/auth.controller.js'
import {verifyJwt} from '../middleware/auth.middleware.js'

const router = express.Router()


router.post('/signup',signup)
router.post('/login',login)
router.post('/logout',logout)
// router.post('/logout',verifyJwt, onboard)


export default router