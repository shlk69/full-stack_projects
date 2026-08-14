const Issue = require('../models/Issue');
const Activity = require('../models/Activity');
const { getIo } = require('../sockets/socket');

exports.createIssue = async (req, res, next) => {
    try {
        const { title, description, priority, assignee, labels, dueDate, status } = req.body;

        // Only members/admins/owners can create issues. Viewers cannot.
        // Role check is handled by middleware on the route.

        const issue = await Issue.create({
            project: req.params.projectId,
            title, description, priority, assignee, labels, dueDate, status,
            reporter: req.user.userId
        });

        await Activity.create({
            project: req.params.projectId, actor: req.user.userId, action: 'ISSUE_CREATED', issue: issue._id, metadata: { title: issue.title }
        });

        getIo().to(`project:${req.params.projectId}`).emit('issue:created', issue);

        res.status(201).json({ success: true, message: 'Issue created', data: { issue } });
    } catch (error) {
        next(error);
    }
};

exports.getIssues = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, priority, assignee, label, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        let query = { project: req.params.projectId };

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignee) query.assignee = assignee;
        if (label) query.labels = label;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortDirection = sortOrder === 'asc' ? 1 : -1;

        const [issues, total] = await Promise.all([
            Issue.find(query)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('assignee', 'name avatar')
                .populate('labels'),
            Issue.countDocuments(query)
        ]);

        res.json({
            success: true, message: 'Issues retrieved',
            data: {
                items: issues,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getIssue = async (req, res, next) => {
    try {
        const issue = await Issue.findOne({ _id: req.params.issueId, project: req.params.projectId })
            .populate('assignee', 'name avatar')
            .populate('reporter', 'name avatar')
            .populate('labels');
        if (!issue) return res.status(404).json({ success: false, message: 'Issue not found', code: 'NOT_FOUND' });
        res.json({ success: true, message: 'Issue retrieved', data: { issue } });
    } catch (error) {
        next(error);
    }
};

exports.updateIssue = async (req, res, next) => {
    try {
        const updates = req.body;
        const issue = await Issue.findOneAndUpdate(
            { _id: req.params.issueId, project: req.params.projectId },
            updates,
            { new: true }
        );
        if (!issue) return res.status(404).json({ success: false, message: 'Issue not found', code: 'NOT_FOUND' });

        await Activity.create({
            project: req.params.projectId, actor: req.user.userId, action: 'ISSUE_UPDATED', issue: issue._id, metadata: { updates }
        });

        res.json({ success: true, message: 'Issue updated', data: { issue } });
    } catch (error) {
        next(error);
    }
};

exports.deleteIssue = async (req, res, next) => {
    try {
        // Deletion requires specific role checking (Owner/Admin or Restricted). Route will handle some.
        const issue = await Issue.findOneAndDelete({ _id: req.params.issueId, project: req.params.projectId });
        if (!issue) return res.status(404).json({ success: false, message: 'Issue not found', code: 'NOT_FOUND' });

        await Activity.create({
            project: req.params.projectId, actor: req.user.userId, action: 'ISSUE_DELETED', metadata: { title: issue.title }
        });

        res.json({ success: true, message: 'Issue deleted', data: {} });
    } catch (error) {
        next(error);
    }
};

exports.changeStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const issue = await Issue.findOneAndUpdate(
            { _id: req.params.issueId, project: req.params.projectId },
            { status },
            { new: true }
        );
        if (!issue) return res.status(404).json({ success: false, message: 'Issue not found', code: 'NOT_FOUND' });

        await Activity.create({
            project: req.params.projectId, actor: req.user.userId, action: 'ISSUE_STATUS_CHANGED', issue: issue._id,
            metadata: { newStatus: status } // Real flow might compare from/to
        });

        getIo().to(`project:${req.params.projectId}`).emit('issue:updated', issue);

        res.json({ success: true, message: 'Status updated', data: { issue } });
    } catch (error) {
        next(error);
    }
};

const Notification = require('../models/Notification');

exports.assignIssue = async (req, res, next) => {
    try {
        const { assignee } = req.body;
        const issue = await Issue.findOneAndUpdate(
            { _id: req.params.issueId, project: req.params.projectId },
            { assignee },
            { new: true }
        );
        if (!issue) return res.status(404).json({ success: false, message: 'Issue not found', code: 'NOT_FOUND' });

        await Activity.create({
            project: req.params.projectId, actor: req.user.userId, action: 'ISSUE_ASSIGNED', issue: issue._id, metadata: { assignee }
        });

        // Phase 11: Notification
        if (assignee && assignee !== req.user.userId) {
            const notification = await Notification.create({
                recipient: assignee,
                actor: req.user.userId,
                type: 'ISSUE_ASSIGNED',
                message: `assigned issue ${issue.title} to you`,
                project: req.params.projectId,
                issue: issue._id
            });
            // Send socket directly to the user (would need a personal room config, assume project for now or user room)
            // Or broadcast globally to active clients filtering client-side
            getIo().to(`project:${req.params.projectId}`).emit('notification:new', notification);
        }

        getIo().to(`project:${req.params.projectId}`).emit('issue:updated', issue);

        res.json({ success: true, message: 'Assignee updated', data: { issue } });
    } catch (error) {
        next(error);
    }
};

exports.updateOrder = async (req, res, next) => {
    try {
        const { status, order } = req.body;
        const issue = await Issue.findOneAndUpdate(
            { _id: req.params.issueId, project: req.params.projectId },
            { status, order },
            { new: true }
        );
        if (!issue) return res.status(404).json({ success: false, message: 'Issue not found', code: 'NOT_FOUND' });

        res.json({ success: true, message: 'Order updated', data: { issue } });
    } catch (error) {
        next(error);
    }
};
