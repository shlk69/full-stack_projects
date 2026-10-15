const mongoose = require('mongoose');
const Ride = require('../models/ride.model');
const Message = require('../models/message.model');
const { sendMessageToSocketId } = require('../socket');
const identity = req => ({ role: req.captain ? 'captain' : 'user', id: (req.captain || req.user)._id });
const validId = id => mongoose.isValidObjectId(id);
const participantQuery = req => { const actor = identity(req); return { _id: req.params.rideId, [actor.role]: actor.id }; };
exports.history = async (req, res) => {
    const actor = identity(req);
    const page = Math.max(1, Math.min(10000, Number.parseInt(req.query.page, 10) || 1));
    const filter = { [actor.role]: actor.id };
    if (req.query.status && ['pending','accepted','ongoing','completed','cancelled'].includes(req.query.status)) filter.status = req.query.status;
    const [rides, count] = await Promise.all([Ride.find(filter).select('-signature -orderId').sort({ _id: -1 }).skip((page - 1) * 20).limit(20).populate('captain', 'fullname vehicle').populate('user', 'fullname'), Ride.countDocuments(filter)]);
    res.json({ rides, count, page, pages: Math.max(1, Math.ceil(count / 20)) });
};
exports.cancel = async (req, res) => {
    if (!validId(req.params.rideId)) return res.status(400).json({ message: 'Invalid ride id' });
    const { reason } = req.body;
    if (typeof reason !== 'string' || reason.trim().length < 3 || reason.length > 300) return res.status(400).json({ message: 'Enter a cancellation reason of 3–300 characters.' });
    const actor = identity(req);
    const ride = await Ride.findOneAndUpdate({ ...participantQuery(req), status: { $in: ['pending','accepted'] } }, { status: 'cancelled', cancellation: { reason: reason.trim(), by: actor.role, at: new Date() } }, { returnDocument: 'after' }).populate('user', 'socketId').populate('captain', 'socketId');
    if (!ride) return res.status(409).json({ message: 'Ride unavailable or already started. Only rides before pickup can be cancelled.' });
    for (const person of [ride.user, ride.captain]) if (person?.socketId) sendMessageToSocketId(person.socketId, { event: 'ride-cancelled', data: { rideId: String(ride._id), reason: ride.cancellation.reason, by: actor.role } });
    res.json({ status: ride.status, cancellation: ride.cancellation });
};
exports.messages = async (req, res) => {
    if (!validId(req.params.rideId)) return res.status(400).json({ message: 'Invalid ride id' });
    const ride = await Ride.findOne(participantQuery(req)).select('status cancellation captain');
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    const messages = await Message.find({ ride: ride._id }).sort({ createdAt: -1, _id: -1 }).limit(100);
    res.json({ messages: messages.reverse(), status: ride.status, cancellation: ride.cancellation });
};
exports.send = async (req, res) => {
    if (!validId(req.params.rideId)) return res.status(400).json({ message: 'Invalid ride id' });
    const { text, clientId } = req.body;
    if (typeof text !== 'string' || !text.trim() || text.length > 1000 || typeof clientId !== 'string' || !/^[a-zA-Z0-9-]{8,100}$/.test(clientId)) return res.status(400).json({ message: 'Enter a message of 1–1000 characters.' });
    const ride = await Ride.findOne({ ...participantQuery(req), status: { $in: ['accepted','ongoing'] } });
    if (!ride) return res.status(409).json({ message: 'Chat is available only for accepted or ongoing rides.' });
    const actor = identity(req);
    const existing = await Message.findOne({ ride: ride._id, sender: actor.id, clientId });
    if (existing) return res.json(existing);
    const recent = await Message.countDocuments({ sender: actor.id, createdAt: { $gte: new Date(Date.now() - 10000) } });
    if (recent >= 10) return res.status(429).json({ message: 'Please wait a few seconds before sending more messages.' });
    try {
        const message = await Message.create({ ride: ride._id, sender: actor.id, role: actor.role, text: text.trim(), clientId });
        res.status(201).json(message);
    } catch (error) {
        if (error.code === 11000) return res.json(await Message.findOne({ ride: ride._id, sender: actor.id, clientId }));
        throw error;
    }
};
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
exports.receipt = async (req, res) => {
    if (!validId(req.params.rideId)) return res.status(400).json({ message: 'Invalid ride id' });
    const ride = await Ride.findOne({ ...participantQuery(req), status: 'completed', paymentStatus: 'paid' }).populate('user', 'fullname').populate('captain', 'fullname vehicle');
    if (!ride) return res.status(404).json({ message: 'A receipt is available after successful payment.' });
    const name = person => [person?.fullname?.firstname, person?.fullname?.lastname].filter(Boolean).join(' ');
    const rows = [['Receipt', String(ride._id)], ['Rider', name(ride.user)], ['Captain', name(ride.captain)], ['Vehicle', ride.captain?.vehicle?.plate], ['Pickup', ride.pickup], ['Destination', ride.destination], ['Distance', (Number(ride.distance || 0) / 1000).toFixed(2) + ' km'], ['Amount paid', 'INR ' + Number(ride.fare).toFixed(2)], ['Payment reference', ride.paymentID], ['Paid on', ride.paidAt ? new Date(ride.paidAt).toISOString() : 'Unavailable']];
    res.set('Content-Disposition', 'attachment; filename="ride-' + String(ride._id) + '-receipt.html"');
    res.type('html').send('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Ride receipt</title><style>body{font:16px Arial;max-width:720px;margin:40px auto;padding:24px;color:#111}h1{border-bottom:3px solid #111;padding-bottom:20px}td{padding:12px;border-bottom:1px solid #ddd;vertical-align:top;overflow-wrap:anywhere}td:first-child{font-weight:bold;width:150px}table{width:100%;border-collapse:collapse}</style></head><body><h1>Ride payment receipt</h1><table>' + rows.map(([key,value]) => '<tr><td>' + escape(key) + '</td><td>' + escape(value) + '</td></tr>').join('') + '</table><p>Payment receipt. This document is not a GST tax invoice.</p><p>Use your browser’s Print menu to save as PDF.</p></body></html>');
};
