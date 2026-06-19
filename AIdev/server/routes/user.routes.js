import { Router } from 'express'
import { createUserController, loginUserController, profileController } from '../controllers/user.controller.js'
import { authValidation } from '../validator/index.js'
import { authenticatedUser } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/register', authValidation, createUserController)
router.post('/login', authValidation, loginUserController)
router.post('/profile', authenticatedUser, profileController)

export default router