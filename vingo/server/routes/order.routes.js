import express from 'express'
import { auth } from '../middleware/auth.js'
<<<<<<< HEAD
import { acceptOrder, getCurrentOrder, getDeliveryBoyAssignment, getMyOrders, getOrderById, placeOrder,sendDeliveryOtp,updateOrderStatus, verifyDeliveryOtp } from '../controllers/order.controllers.js'
=======
import { acceptOrder, getCurrentOrder, getDeliveryBoyAssignment, getMyOrders, getOrderById, placeOrder,updateOrderStatus } from '../controllers/order.controllers.js'
>>>>>>> 03eebffdf828a65a854804b40583ef00e9d0e2ae
const orderRouter = express.Router()

orderRouter.post("/place-order", auth, placeOrder)
orderRouter.post("/send-delivery-otp", auth, sendDeliveryOtp)
orderRouter.post("/verify-delivery-otp", auth, verifyDeliveryOtp)
orderRouter.get("/my-orders", auth, getMyOrders)
orderRouter.get("/get-assignments", auth, getDeliveryBoyAssignment)
orderRouter.get("/get-assignments", auth, getDeliveryBoyAssignment)
orderRouter.get("/get-current-order", auth, getCurrentOrder)


orderRouter.post("/update-status/:orderId/:shopId", auth, updateOrderStatus)
orderRouter.get("/accept-order/:assignmentId", auth, acceptOrder)
orderRouter.get("/get-order-by-id/:orderId", auth, getOrderById)

export default orderRouter
