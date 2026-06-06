import express from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js'
import {getRecommendedUsers,getMyFriends} from '../controllers/user.controller.js'

const router = express.Router()

router.use(verifyJwt)

router.get('/', getRecommendedUsers)
router.get('/friends' ,getMyFriends)



export default router