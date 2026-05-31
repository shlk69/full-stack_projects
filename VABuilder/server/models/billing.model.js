import mongoose from 'mongoose'

const billingSchema = new mongoose.Schema({
    userId: {
        type:
            mongoose.Schema.Types.ObjectId,

        ref: "User",
    },

    amount: Number,

    plan: String,

    paymentId: String,

    orderId: String,
    status: {
        type: String,

        enum: [
            "created",
            "paid",
            "failed",
        ],

        default: "created",
    },


}, {
    timestamps: true
})

export const Billing = mongoose.model('billing',billingSchema)