const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
function load(file, mocks) {
    const context = { require: n => mocks[n] || require(n), module: { exports: {} }, exports: {}, process: { env: { RAZORPAY_KEY_SECRET: 'test-secret', RAZORPAY_KEY_ID: 'test-id' } }, Buffer, console };
    context.exports = context.module.exports;
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
    return context.module.exports;
}
const sign = (order, payment) => crypto.createHmac('sha256', 'test-secret').update(order + '|' + payment).digest('hex');
function service({ status = 'captured', amount = 12500 } = {}) {
    const ride = { _id: 'ride', user: 'rider', fare: 125, status: 'completed', orderId: 'order', paymentStatus: 'pending' };
    const calls = [];
    const model = { findById: async () => ride, findOneAndUpdate: async (query, updates) => { Object.assign(ride, updates); return ride; } };
    const axios = async config => { calls.push(config); return { data: config.url.endsWith('/payments') ? { items: [{ id: 'payment', order_id: 'order', amount, currency: 'INR', status }] } : { id: 'payment', order_id: 'order', amount, currency: 'INR', status: config.url.endsWith('/capture') ? 'captured' : status } }; };
    return { api: load('services/payment.service.js', { axios, '../models/ride.model': model }), ride, calls };
}
test('valid signature and captured matching payment mark ride paid', async () => {
    const { api, ride } = service();
    await api.verify(ride, { razorpay_order_id: 'order', razorpay_payment_id: 'payment', razorpay_signature: sign('order', 'payment') });
    assert.equal(ride.paymentStatus, 'paid'); assert.equal(ride.paymentID, 'payment');
});
test('forged signature and another order never reach gateway', async () => {
    const { api, ride, calls } = service();
    await assert.rejects(api.verify(ride, { razorpay_order_id: 'order', razorpay_payment_id: 'payment', razorpay_signature: '0'.repeat(64) }));
    await assert.rejects(api.verify(ride, { razorpay_order_id: 'other', razorpay_payment_id: 'payment', razorpay_signature: sign('other', 'payment') }));
    assert.equal(calls.length, 0); assert.equal(ride.paymentStatus, 'pending');
});
test('fare mismatch cannot mark paid', async () => {
    const { api, ride } = service({ amount: 1 });
    await assert.rejects(api.verify(ride, { razorpay_order_id: 'order', razorpay_payment_id: 'payment', razorpay_signature: sign('order', 'payment') }));
    assert.equal(ride.paymentStatus, 'pending');
});
test('authorized payment is captured server side', async () => {
    const { api, ride, calls } = service({ status: 'authorized' });
    await api.verify(ride, { razorpay_order_id: 'order', razorpay_payment_id: 'payment', razorpay_signature: sign('order', 'payment') });
    assert.equal(ride.paymentStatus, 'paid'); assert.equal(calls[1].method, 'POST'); assert.equal(calls[1].data.amount, 12500);
});
test('refresh recovers captured payment after missed callback', async () => {
    const { api, ride } = service(); await api.reconcile(ride); assert.equal(ride.paymentStatus, 'paid');
});
test('repeat verification does not charge again', async () => {
    const { api, ride, calls } = service(); ride.paymentStatus = 'paid';
    await api.verify(ride, { razorpay_order_id: 'order', razorpay_payment_id: 'payment', razorpay_signature: sign('order', 'payment') }); assert.equal(calls.length, 0);
});
function controller(ride, update = null) {
    let writes = 0;
    const model = { findOne: async query => query.user === 'rider' ? ride : null, findOneAndUpdate: async query => { writes++; assert.equal(query.user, 'rider'); assert.equal(query.paymentStatus, 'paid'); assert.equal(query['review.createdAt'].$exists, false); return update; } };
    const api = load('controllers/checkout.controller.js', { mongoose: { isValidObjectId: () => true }, '../models/ride.model': model, '../services/payment.service': {} });
    const res = { code: 200, status(n) { this.code=n;return this; }, json(body) { this.body=body;return this; } };
    return { api, res, writes: () => writes };
}
test('outsider and unpaid rider cannot review', async () => {
    const { api, res, writes } = controller({ _id: 'ride', paymentStatus: 'pending' });
    await api.review({ user: { _id: 'outsider' }, params: { rideId: 'ride' }, body: { rating: 5 } }, res); assert.equal(res.code,404);
    await api.review({ user: { _id: 'rider' }, params: { rideId: 'ride' }, body: { rating: 5 } }, res); assert.equal(res.code,409); assert.equal(writes(),0);
});
test('invalid rating rejected and duplicate review conflicts', async () => {
    const { api, res } = controller({ _id: 'ride', paymentStatus: 'paid' });
    await api.review({ user: { _id: 'rider' }, params: { rideId: 'ride' }, body: { rating: 6 } }, res); assert.equal(res.code,400);
    await api.review({ user: { _id: 'rider' }, params: { rideId: 'ride' }, body: { rating: 5 } }, res); assert.equal(res.code,409);
});
test('paid rider can save one review', async () => {
    const { api, res } = controller({ _id: 'ride', paymentStatus: 'paid' }, { review: { rating: 5, comment: 'Great ride' } });
    await api.review({ user: { _id: 'rider' }, params: { rideId: 'ride' }, body: { rating: 5, comment: 'Great ride' } }, res); assert.equal(res.code,201); assert.equal(res.body.review.rating,5);
});
