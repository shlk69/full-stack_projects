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

    let order;
    try {
        order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR', receipt: 'receipt_' + Date.now() });
    } catch (error) {
        if (error.statusCode === 401) return errorResponse(res, 'Payment service authentication failed. The server Razorpay key ID and secret must be a valid matching pair.', null, 502);
        return errorResponse(res, 'Payment service is unavailable. Please retry shortly.', null, 502);
    }

    await Billing.create({
        userId,
        amount,
        plan,
        orderId: order.id
    })

    logger.info(`Order created: ${order.id} for user: ${userId}`)
    return successResponse(res, { order, keyId: process.env.RAZORPAY_KEY_ID }, 'Order created successfully', 200)
})

export const verifyBilling = catchAsync(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const userId = req.userId

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return errorResponse(res, 'Missing payment verification details', null, 400)
    }

    const billing = await Billing.findOne({ orderId: razorpay_order_id, userId });
    if (!billing) return errorResponse(res, 'Payment order not found', null, 404);
    const sign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex")

    if (!/^[a-f0-9]{64}$/i.test(razorpay_signature) || !crypto.timingSafeEqual(Buffer.from(sign, 'hex'), Buffer.from(razorpay_signature, 'hex'))) {
        logger.warn(`Payment verification failed for order: ${razorpay_order_id}`)
        return errorResponse(res, 'Payment verification failed', null, 400)
    }

    if (billing.status === 'paid') {
        const existingUser = await User.findById(userId).select('-geminiApiKey');
        return successResponse(res, { user: existingUser }, 'Payment already verified', 200);
    }
    let payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.order_id !== billing.orderId || payment.amount !== billing.amount * 100 || payment.currency !== 'INR') return errorResponse(res, 'Payment does not match order', null, 400);
    if (payment.status === 'authorized') payment = await razorpay.payments.capture(payment.id, billing.amount * 100, 'INR');
    if (payment.status !== 'captured') return errorResponse(res, 'Payment is not captured', null, 409);
    await Billing.findOneAndUpdate(
        { orderId: razorpay_order_id, userId },
        { paymentId: razorpay_payment_id, status: 'paid' }
    )

    const user = await User.findByIdAndUpdate(
        userId,
        {
            plan: "pro",
            proExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
        { returnDocument: "after" }
    )

    user.geminiApiKey = undefined;
    logger.info(`Payment verified and pro plan activated for user: ${userId}`)
    return successResponse(res, { user }, 'Payment verified successfully', 200)
})
