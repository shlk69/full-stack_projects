const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const trip = require('../controllers/trip.controller');
router.use('/:role', (req, res, next) => {
    if (req.params.role === 'user') return auth.authUser(req, res, next);
    if (req.params.role === 'captain') return auth.authCaptain(req, res, next);
    return res.status(404).json({ message: 'Unknown role' });
});
for (const role of ['user', 'captain']) {
    router.get('/' + role + '/history', trip.history);
    router.post('/' + role + '/:rideId/cancel', trip.cancel);
    router.get('/' + role + '/:rideId/messages', trip.messages);
    router.post('/' + role + '/:rideId/messages', trip.send);
    router.get('/' + role + '/:rideId/receipt', trip.receipt);
}
module.exports = router;
