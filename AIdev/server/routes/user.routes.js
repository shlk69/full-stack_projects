import { Router } from 'express'
import { createUserController, loginUserController } from '../controllers/user.controller.js'
import { authValidation } from '../validator/index.js'

const router = Router()

router.post('/register', authValidation, createUserController)
router.post('/login', authValidation, loginUserController)

export default router