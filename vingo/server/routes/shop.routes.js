import express from 'express'
import { auth } from '../middleware/auth.js'
import { createEditShop } from '../controllers/shop.controllers.js'

const shopRouter = express.Router()


shopRouter.post('/create-edit',auth,createEditShop)