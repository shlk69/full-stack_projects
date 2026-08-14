const mongoose = require('mongoose');
const Issue = require('../models/Issue');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const projectId = new mongoose.Types.ObjectId(req.params.projectId);

        const stats = await Issue.aggregate([
            { $match: { project: projectId } },
            {
                $group: {
                    _id: null,
                    totalIssues: { $sum: 1 },
                    todo: { $sum: { $cond: [{ $eq: ["$status", "TODO"] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
                    review: { $sum: { $cond: [{ $eq: ["$status", "REVIEW"] }, 1, 0] } },
                    done: { $sum: { $cond: [{ $eq: ["$status", "DONE"] }, 1, 0] } },
                    overdue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ["$status", "DONE"] },
                                        { $lt: ["$dueDate", new Date()] }
                                    ]
                                }, 1, 0
                            ]
                        }
                    }
                }
            }
        ]);

        const data = stats.length > 0 ? stats[0] : { totalIssues: 0, todo: 0, inProgress: 0, review: 0, done: 0, overdue: 0 };
        delete data._id;

        data.completionRate = data.totalIssues > 0 ? ((data.done / data.totalIssues) * 100).toFixed(2) : 0;

        res.json({ success: true, message: 'Dashboard stats retrieved', data });
    } catch (error) {
        next(error);
    }
};
