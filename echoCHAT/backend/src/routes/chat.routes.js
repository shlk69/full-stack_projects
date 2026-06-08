import express from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js'
import { getStreamToken } from '../controllers/chat.controller.js'

const router = express.Router()

router.get('/token',verifyJwt,getStreamToken)

export default router