import express from 'express'
import { auth } from '../middleware/auth.js'
import { getMyOrders, placeOrder,updateOrderStatus } from '../controllers/order.controllers.js'
const orderRouter = express.Router()

orderRouter.post("/place-order", auth, placeOrder)
orderRouter.get("/my-orders", auth, getMyOrders)
orderRouter.post("/update-status/:orderId/:shopId", auth, updateOrderStatus)

export default orderRouter
