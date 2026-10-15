const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const Ride = require('../models/ride.model');
const User = require('../models/user.model');
const Captain = require('../models/captain.model');
router.use(auth.authUser, (req, res, next) => {
    const emails = (process.env.ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
    if (!emails.includes(req.user.email.toLowerCase())) return res.status(403).json({ message: 'Administrator access required.' });
    next();
});
router.get('/overview', async (req, res) => {
    const [users, captains, activeRides, completed, cancelled, payments] = await Promise.all([
        User.countDocuments(), Captain.countDocuments(), Ride.countDocuments({ status: { $in: ['pending','accepted','ongoing'] } }), Ride.countDocuments({status:'completed'}), Ride.countDocuments({status:'cancelled'}),
        Ride.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$fare' }, count: { $sum: 1 } } }])
    ]);
    res.json({ users, captains, activeRides, completed, cancelled, revenue: payments[0]?.total || 0, paidRides: payments[0]?.count || 0 });
});
router.get('/:section', async (req, res) => {
    const models = { rides: Ride, users: User, captains: Captain };
    const model = models[req.params.section];
    if (!model) return res.status(404).json({ message: 'Unknown section' });
    const page = Math.max(1, Math.min(10000, Number.parseInt(req.query.page, 10) || 1));
    const filter = {};
    if (req.params.section === 'rides' && ['pending','accepted','ongoing','completed','cancelled'].includes(req.query.status)) filter.status = req.query.status;
    if (req.params.section !== 'rides' && typeof req.query.search === 'string' && req.query.search.trim()) {
        const safe = Array.from(req.query.search.trim().slice(0,100)).map(char => '\\^$.*+?()[]{}|'.includes(char) ? String.fromCharCode(92) + char : char).join('');
        filter.$or = [{email:{$regex:safe,$options:'i'}},{'fullname.firstname':{$regex:safe,$options:'i'}}];
    }
    const selection = req.params.section === 'rides' ? 'pickup destination fare status paymentStatus cancellation createdAt user captain' : 'fullname email vehicle status';
    let query = model.find(filter).select(selection).sort({_id:-1}).skip((page-1)*20).limit(20);
    if(req.params.section === 'rides') query = query.populate('user','fullname').populate('captain','fullname');
    const [items,count] = await Promise.all([query,model.countDocuments(filter)]);
    res.json({items,count,page,pages:Math.max(1,Math.ceil(count/20))});
});
module.exports = router;
