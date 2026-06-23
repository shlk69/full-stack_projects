import { Billing } from "../models/billing.model.js"
import { razorpay } from "../config/razorpay.js"
import crypto from 'crypto'
import { User } from '../models/user.model.js'
import { catchAsync } from '../utils/catchAsync.js'
import { successResponse, errorResponse } from '../utils/ApiResponse.js'
import logger from '../utils/logger.js'

export const createOrder = catchAsync(async (req, res) => {
    const { plan } = req.body
    const userId = req.userId
    let amount = 0

    if (plan === "pro") {
        amount = 299
    } else {
        return errorResponse(res, 'Invalid plan selected', null, 400)
    }

    const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    })

    await Billing.create({
        userId,
        amount,
        plan,
        orderId: order.id
    })

    logger.info(`Order created: ${order.id} for user: ${userId}`)
    return successResponse(res, { order }, 'Order created successfully', 200)
})

export const verifyBilling = catchAsync(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const userId = req.userId

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return errorResponse(res, 'Missing payment verification details', null, 400)
    }

    const sign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex")

    if (sign !== razorpay_signature) {
        logger.warn(`Payment verification failed for order: ${razorpay_order_id}`)
        return errorResponse(res, 'Payment verification failed', null, 400)
    }

    await Billing.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { paymentId: razorpay_payment_id, status: 'paid' }
    )

    const user = await User.findByIdAndUpdate(
        userId,
        {
            plan: "pro",
            proExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
        { new: true }
    )

    logger.info(`Payment verified and pro plan activated for user: ${userId}`)
    return successResponse(res, { user }, 'Payment verified successfully', 200)
})
