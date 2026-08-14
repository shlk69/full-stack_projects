const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getNotifications);

router.route('/read-all')
    .patch(markAllAsRead);

router.route('/:notificationId/read')
    .patch(markAsRead);

router.route('/:notificationId')
    .delete(deleteNotification);

module.exports = router;
