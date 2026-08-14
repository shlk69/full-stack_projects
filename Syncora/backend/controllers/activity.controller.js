const Activity = require('../models/Activity');

exports.getProjectActivities = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [activities, total] = await Promise.all([
            Activity.find({ project: req.params.projectId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('actor', 'name avatar')
                .populate('issue', 'title status'),
            Activity.countDocuments({ project: req.params.projectId })
        ]);

        res.json({
            success: true, message: 'Activities retrieved',
            data: {
                activities,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
            }
        });
    } catch (error) {
        next(error);
    }
};
