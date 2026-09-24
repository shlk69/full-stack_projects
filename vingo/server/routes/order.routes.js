import express from 'express'
import { auth } from '../middleware/auth.js'
import { acceptOrder, getCurrentOrder, getDeliveryBoyAssignment, getMyOrders, getOrderById, getTodayDeliveries, placeOrder, sendDeliveryOtp, updateOrderStatus, verifyDeliveryOtp, verifyPayment } from '../controllers/order.controllers.js'
const orderRouter = express.Router()

orderRouter.post("/place-order", auth, placeOrder)
orderRouter.post("/send-delivery-otp", auth, sendDeliveryOtp)
orderRouter.post("/verify-delivery-otp", auth, verifyDeliveryOtp)
orderRouter.post("/verify-payment", auth, verifyPayment)
orderRouter.get("/my-orders", auth, getMyOrders)
orderRouter.get("/get-assignments", auth, getDeliveryBoyAssignment)
orderRouter.get("/get-assignments", auth, getDeliveryBoyAssignment)
orderRouter.get("/get-current-order", auth, getCurrentOrder)
orderRouter.get("/get-today-deliveries", auth, getTodayDeliveries)


orderRouter.post("/update-status/:orderId/:shopId", auth, updateOrderStatus)
orderRouter.get("/accept-order/:assignmentId", auth, acceptOrder)
orderRouter.get("/get-order-by-id/:orderId", auth, getOrderById)

export default orderRouter
