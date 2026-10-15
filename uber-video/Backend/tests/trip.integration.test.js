const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const enabled = process.env.RUN_TRIP_INTEGRATION === '1';
if (!enabled) test('trip integration tests require RUN_TRIP_INTEGRATION=1 and a reachable MongoDB server', { skip: true }, () => {});
else {
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Captain = require('../models/captain.model');
const Ride = require('../models/ride.model');
const Message = require('../models/message.model');
let server, base, rider, outsider, captain, admin, tokens;
const dbName = 'codex_trip_test_' + Date.now();
before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_EMAILS = 'admin@example.com';
    await mongoose.connect(process.env.DB_CONNECT, { dbName, serverSelectionTimeoutMS: 5000 });
    const password = await User.hashPassword('Testing123!');
    rider = await User.create({ fullname: { firstname: 'Rider' }, email: 'rider@example.com', password });
    outsider = await User.create({ fullname: { firstname: 'Other' }, email: 'other@example.com', password });
    admin = await User.create({ fullname: { firstname: 'Admin' }, email: 'admin@example.com', password });
    captain = await Captain.create({ fullname: { firstname: 'Captain' }, email: 'captain@example.com', password, vehicle: { color: 'Black', plate: 'TEST123', capacity: 4, vehicleType: 'car' } });
    tokens = { rider: rider.generateAuthToken(), outsider: outsider.generateAuthToken(), admin: admin.generateAuthToken(), captain: captain.generateAuthToken() };
    await Message.init();
    const app = require('../app');
    server = await new Promise(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
    base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
    if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    if (mongoose.connection.name === dbName) await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
});
const createRide = values => Ride.create({ user: rider._id, captain: captain._id, pickup: 'Pickup', destination: 'Destination', fare: 125, otp: '123456', status: 'accepted', ...values });
const request = (path, role = 'rider', method = 'GET', body) => fetch(base + path, { method, headers: { Authorization: 'Bearer ' + tokens[role], 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
test('participants can cancel before start; cancellation is persisted; start is blocked', async () => {
    const ride = await createRide();
    let response = await request('/trips/user/' + ride._id + '/cancel', 'outsider', 'POST', { reason: 'Changed plans' });
    assert.equal(response.status, 409);
    response = await request('/trips/user/' + ride._id + '/cancel', 'rider', 'POST', { reason: 'Changed plans' });
    assert.equal(response.status, 200);
    assert.equal((await Ride.findById(ride._id)).status, 'cancelled');
    response = await request('/rides/start-ride?rideId=' + ride._id + '&otp=123456', 'captain');
    assert.notEqual(response.status, 200);
    assert.equal((await Ride.findById(ride._id)).status, 'cancelled');
});
test('ongoing rides cannot be cancelled', async () => {
    const ride = await createRide({ status: 'ongoing' });
    const response = await request('/trips/captain/' + ride._id + '/cancel', 'captain', 'POST', { reason: 'Changed plans' });
    assert.equal(response.status, 409);
});
test('start/cancel race has exactly one winner', async () => {
    const ride = await createRide();
    const responses = await Promise.all([
        request('/trips/user/' + ride._id + '/cancel', 'rider', 'POST', { reason: 'Changed plans' }),
        request('/rides/start-ride?rideId=' + ride._id + '&otp=123456', 'captain')
    ]);
    assert.equal(responses.filter(r => r.status === 200).length, 1);
    assert.ok(['cancelled','ongoing'].includes((await Ride.findById(ride._id)).status));
});
test('chat is private, persistent, deduplicated and read by both participants', async () => {
    const ride = await createRide(); const path = '/trips/user/' + ride._id + '/messages';
    assert.equal((await request(path, 'outsider')).status, 404);
    const body = { text: 'I am at the pickup gate', clientId: 'test-message-001' };
    assert.equal((await request(path, 'rider', 'POST', body)).status, 201);
    assert.equal((await request(path, 'rider', 'POST', body)).status, 200);
    const response = await request('/trips/captain/' + ride._id + '/messages', 'captain');
    const data = await response.json(); assert.equal(data.messages.length, 1); assert.equal(data.messages[0].text, body.text);
    await Ride.updateOne({ _id: ride._id }, { status: 'completed' });
    assert.equal((await request(path, 'rider', 'POST', { text: 'Too late', clientId: 'test-message-002' })).status, 409);
});
test('chat validates message size and throttles excessive sends', async () => {
    const ride = await createRide(); const path = '/trips/user/' + ride._id + '/messages';
    assert.equal((await request(path, 'rider', 'POST', { text: 'a'.repeat(1001), clientId: 'long-message-001' })).status, 400);
    for(let i = 0; i < 10; i++) await Message.create({ ride: ride._id, sender: outsider._id, role: 'user', text: 'test', clientId: 'rate-' + i });
    const outsiderRide = await createRide({ user: outsider._id });
    const response = await request('/trips/user/' + outsiderRide._id + '/messages', 'outsider', 'POST', { text: 'More', clientId: 'rate-extra' });
    assert.equal(response.status, 429);
});
test('receipt needs ownership and captured payment; user content is escaped', async () => {
    const ride = await createRide({ status: 'completed', paymentStatus: 'paid', pickup: '<script>alert(1)</script>', paymentID: 'pay_test', paidAt: new Date() });
    const path = '/trips/user/' + ride._id + '/receipt';
    assert.equal((await request(path, 'outsider')).status, 404);
    const response = await request(path); assert.equal(response.status, 200);
    const html = await response.text(); assert.ok(html.includes('&lt;script&gt;')); assert.ok(!html.includes('<script>')); assert.ok(html.includes('INR 125.00'));
    const unpaid = await createRide({ status: 'completed' });
    assert.equal((await request('/trips/user/' + unpaid._id + '/receipt')).status, 404);
});
test('history is account-scoped, paginated and filtered', async () => {
    const response = await request('/trips/user/history?status=cancelled');
    const data = await response.json(); assert.ok(data.rides.length); assert.ok(data.rides.every(ride => ride.status === 'cancelled' && ride.user._id === String(rider._id)));
    const other = await (await request('/trips/user/history', 'outsider')).json();
    assert.ok(other.rides.every(ride => ride.user._id === String(outsider._id)));
});
test('admin is denied to ordinary users; allowlisted account sees safe account data', async () => {
    assert.equal((await request('/api/admin/overview')).status, 403);
    const response = await request('/api/admin/overview', 'admin'); assert.equal(response.status,200); assert.equal((await response.json()).users,3);
    const users = await (await request('/api/admin/users?search=Rider', 'admin')).json();
    assert.equal(users.items.length,1); assert.equal(users.items[0].email,'rider@example.com'); assert.equal(users.items[0].password,undefined);
    const literal = await request('/api/admin/users?search=' + encodeURIComponent('.*'), 'admin'); assert.equal(literal.status,200); assert.equal((await literal.json()).items.length,0);
});
}
