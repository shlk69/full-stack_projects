import express from 'express'
import { auth } from '../middleware/auth.js'
import { createEditShop } from '../controllers/shop.controllers.js'
import { upload } from '../middleware/multer.js'

const shopRouter = express.Router()


shopRouter.post('/create-edit',auth,upload.single('image'),createEditShop)