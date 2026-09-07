import express from 'express'
import { auth } from '../middleware/auth.js'
import { acceptOrder, getDeliveryBoyAssignment, getMyOrders, placeOrder,updateOrderStatus } from '../controllers/order.controllers.js'
const orderRouter = express.Router()

orderRouter.post("/place-order", auth, placeOrder)
orderRouter.get("/my-orders", auth, getMyOrders)
orderRouter.get("/get-assignments", auth, getDeliveryBoyAssignment)
orderRouter.get("/get-assignments", auth, getDeliveryBoyAssignment)
orderRouter.post("/update-status/:orderId/:shopId", auth, updateOrderStatus)
orderRouter.get("/accept-order/:assignmentId", auth, acceptOrder)

export default orderRouter
