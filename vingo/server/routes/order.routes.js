import express from 'express'
import { auth } from '../middleware/auth.js'
import { placeOrder } from '../controllers/order.controllers.js'
const orderRouter = express.Router()

orderRouter.post("/place-order", auth, placeOrder)

export default orderRouter
