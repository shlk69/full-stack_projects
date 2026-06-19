import { Router } from 'express'
import { createUserController, loginUserController, logoutUserController, profileController } from '../controllers/user.controller.js'
import { authValidation } from '../validator/index.js'
import { authenticatedUser } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/register', authValidation, createUserController)
router.post('/login', authValidation, loginUserController)
router.get('/profile', authenticatedUser, profileController)
router.get('/logout', authenticatedUser, logoutUserController)

export default router