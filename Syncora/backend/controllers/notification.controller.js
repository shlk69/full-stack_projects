const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [notifications, total] = await Promise.all([
            Notification.find({ recipient: req.user.userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('actor', 'name avatar'),
            Notification.countDocuments({ recipient: req.user.userId })
        ]);

        res.json({
            success: true, message: 'Notifications retrieved',
            data: {
                items: notifications,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.notificationId, recipient: req.user.userId },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.json({ success: true, message: 'Notification marked as read', data: { notification } });
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.userId, isRead: false },
            { isRead: true }
        );
        res.json({ success: true, message: 'All notifications marked as read', data: {} });
    } catch (error) {
        next(error);
    }
};

exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndDelete({ _id: req.params.notificationId, recipient: req.user.userId });
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.json({ success: true, message: 'Notification deleted', data: {} });
    } catch (error) {
        next(error);
    }
};
