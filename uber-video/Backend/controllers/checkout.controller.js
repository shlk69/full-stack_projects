const mongoose = require('mongoose');
const rideModel = require('../models/ride.model');
const payments = require('../services/payment.service');
async function ownRide(req) {
    if (!req.user || !mongoose.isValidObjectId(req.params.rideId)) return null;
    return rideModel.findOne({ _id: req.params.rideId, user: req.user._id, status: 'completed' });
}
const handle = fn => async (req, res) => {
    try {
        const ride = await ownRide(req);
        if (!ride) return res.status(404).json({ message: 'Completed ride not found' });
        return await fn(req, res, ride);
    } catch { return res.status(502).json({ message: 'Unable to process payment. Please retry or check payment status.' }); }
};
exports.details = handle(async (req, res, ride) => {
    const checked = await payments.reconcile(ride);
    await checked.populate('captain', 'fullname vehicle');
    res.json(checked);
});
exports.order = handle(async (req, res, ride) => res.json(await payments.createOrder(ride)));
exports.verify = handle(async (req, res, ride) => res.json({ paymentStatus: (await payments.verify(ride, req.body)).paymentStatus }));
exports.review = async (req, res) => {
    try {
        const { rating, comment = '' } = req.body;
        if (!Number.isInteger(rating) || rating < 1 || rating > 5 || typeof comment !== 'string' || comment.length > 1000) return res.status(400).json({ message: 'Choose 1–5 stars and a review of up to 1000 characters.' });
        const ride = await ownRide(req);
        if (!ride) return res.status(404).json({ message: 'Completed ride not found' });
        if (ride.paymentStatus !== 'paid') return res.status(409).json({ message: 'Complete payment before reviewing.' });
        const updated = await rideModel.findOneAndUpdate({ _id: ride._id, user: req.user._id, status: 'completed', paymentStatus: 'paid', 'review.createdAt': { $exists: false } },
            { review: { rating, comment: comment.trim(), createdAt: new Date() } }, { new: true, runValidators: true });
        if (!updated) return res.status(409).json({ message: 'You already reviewed this ride.' });
        res.status(201).json({ review: updated.review });
    } catch { res.status(500).json({ message: 'Unable to save review. Please retry.' }); }
};
exports.captainReviews = async (req, res) => {
    try {
        const match = { captain: req.captain._id, status: 'completed', 'review.createdAt': { $exists: true } };
        const [summary, rides] = await Promise.all([
            rideModel.aggregate([{ $match: match }, { $group: { _id: null, averageRating: { $avg: '$review.rating' }, count: { $sum: 1 } } }]),
            rideModel.find(match).select('review user').sort({ 'review.createdAt': -1 }).limit(20).populate('user', 'fullname.firstname')
        ]);
        res.json({ averageRating: summary[0]?.averageRating || 0, count: summary[0]?.count || 0,
            reviews: rides.map(r => ({ id: r._id, name: r.user?.fullname?.firstname || 'Rider', rating: r.review.rating, comment: r.review.comment, createdAt: r.review.createdAt })) });
    } catch { res.status(500).json({ message: 'Unable to load reviews.' }); }
};

exports.status = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.rideId)) return res.status(400).json({ message: 'Invalid ride id' });
    try {
        const ride = await rideModel.findOne({ _id: req.params.rideId, user: req.user._id }).select('status');
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        res.json(ride);
    } catch { res.status(500).json({ message: 'Unable to load ride status' }); }
};
exports.completed = async (req, res) => {
    try {
        const rides = await rideModel.find({ user: req.user._id, status: 'completed' }).select('pickup destination fare paymentStatus review').sort({ _id: -1 }).limit(10);
        res.json({ rides });
    } catch { res.status(500).json({ message: 'Unable to load completed rides' }); }
};
