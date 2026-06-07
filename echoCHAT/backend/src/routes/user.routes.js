import express from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js'
import { getRecommendedUsers, getMyFriends, sendFriendRequest, acceptFriendRequest } from '../controllers/user.controller.js'

const router = express.Router()

router.use(verifyJwt)

router.get('/', getRecommendedUsers)
router.get('/friends' ,getMyFriends)
router.get('/friend-request/:id' ,sendFriendRequest)
router.get('/friend-request/:id/accept' ,acceptFriendRequest)



export default router