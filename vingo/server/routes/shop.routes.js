import express from 'express'
import { auth } from '../middleware/auth.js'
import { createEditShop, getMyShop, getShopByCity } from '../controllers/shop.controllers.js'
import { upload } from '../middleware/multer.js'

const shopRouter = express.Router()


shopRouter.post('/create-edit', auth, upload.single('image'), createEditShop)
shopRouter.get('/get-my-shop', auth, getMyShop)
shopRouter.get('/get-by-city/:city', auth, getShopByCity)

export default shopRouter