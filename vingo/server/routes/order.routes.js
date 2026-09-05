import express from 'express'
import { auth } from '../middleware/auth.js'
import { getMyOrders, placeOrder } from '../controllers/order.controllers.js'
const orderRouter = express.Router()

orderRouter.post("/place-order", auth, placeOrder)
orderRouter.get("/my-orders", auth, getMyOrders)

export default orderRouter
