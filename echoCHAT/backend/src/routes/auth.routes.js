import express from 'express'
import { login, logout, signup ,onboard} from '../controllers/auth.controller.js'
import {verifyJwt} from '../middleware/auth.middleware.js'

const router = express.Router()



//Public routes
router.post('/signup',signup)
router.post('/login',login)
router.post('/logout', logout)

// Protected routes

router.post('/onboard',verifyJwt, onboard)
router.get('/me', verifyJwt, (req, res) => {
    res.status(200).json({'Logged in':req.user.fullname,success:true})
})


export default router