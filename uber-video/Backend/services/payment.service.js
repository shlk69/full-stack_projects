const axios = require('axios');
const crypto = require('crypto');
const rideModel = require('../models/ride.model');
const locks = new Map();
const amountFor = ride => Math.round(ride.fare * 100);
const gateway = async (method, path, data) => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new Error('Payment configuration unavailable');
    const response = await axios({ method, url: 'https://api.razorpay.com/v1/' + path, data,
        auth: { username: process.env.RAZORPAY_KEY_ID, password: process.env.RAZORPAY_KEY_SECRET }, timeout: 15000 });
    return response.data;
};
function validSignature(orderId, paymentId, signature) {
    if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(orderId + '|' + paymentId).digest();
    return crypto.timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
async function markPaid(ride, payment) {
    if (payment.order_id !== ride.orderId || payment.amount !== amountFor(ride) || payment.currency !== 'INR' || payment.status !== 'captured') throw new Error('Payment has not been captured for this ride');
    return rideModel.findOneAndUpdate({ _id: ride._id, user: ride.user, orderId: ride.orderId, status: 'completed' },
        { paymentStatus: 'paid', paymentID: payment.id, paidAt: new Date() }, { new: true });
}
async function reconcile(ride) {
    if (!ride.orderId || ride.paymentStatus === 'paid') return ride;
    const payments = await gateway('GET', 'orders/' + encodeURIComponent(ride.orderId) + '/payments');
    const captured = payments.items?.find(p => p.status === 'captured' && p.amount === amountFor(ride) && p.currency === 'INR');
    return captured ? markPaid(ride, captured) : ride;
}
async function createOrder(ride) {
    const id = String(ride._id);
    if (locks.has(id)) return locks.get(id);
    const work = (async () => {
        const current = await rideModel.findById(ride._id);
        if (current.paymentStatus === 'paid') return { paid: true };
        if (!current.orderId) {
            const amount = amountFor(current);
            if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error('Invalid ride fare');
            const order = await gateway('POST', 'orders', { amount, currency: 'INR', receipt: id, notes: { rideId: id } });
            current.orderId = order.id; await current.save();
        }
        const checked = await reconcile(current);
        return checked.paymentStatus === 'paid' ? { paid: true } : { id: current.orderId, amount: amountFor(current), currency: 'INR', key: process.env.RAZORPAY_KEY_ID };
    })();
    locks.set(id, work);
    try { return await work; } finally { locks.delete(id); }
}
async function verify(ride, data) {
    if (!ride.orderId || data.razorpay_order_id !== ride.orderId || !validSignature(ride.orderId, data.razorpay_payment_id, data.razorpay_signature)) throw new Error('Invalid payment signature');
    if (ride.paymentStatus === 'paid') return ride;
    let payment = await gateway('GET', 'payments/' + encodeURIComponent(data.razorpay_payment_id));
    if (payment.order_id !== ride.orderId || payment.amount !== amountFor(ride) || payment.currency !== 'INR') throw new Error('Payment does not match ride');
    if (payment.status === 'authorized') payment = await gateway('POST', 'payments/' + encodeURIComponent(payment.id) + '/capture', { amount: amountFor(ride), currency: 'INR' });
    return markPaid(ride, payment);
}
module.exports = { createOrder, verify, reconcile, validSignature, amountFor };
