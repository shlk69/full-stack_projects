const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
// const Notification = require('../models/Notification'); // For phase 11

exports.getComments = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [comments, total] = await Promise.all([
            Comment.find({ issue: req.params.issueId })
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('author', 'name avatar'),
            Comment.countDocuments({ issue: req.params.issueId })
        ]);

        res.json({
            success: true, message: 'Comments retrieved',
            data: {
                items: comments,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.createComment = async (req, res, next) => {
    try {
        if (req.projectRole === 'VIEWER') {
            return res.status(403).json({ success: false, message: 'Viewers cannot comment', code: 'FORBIDDEN' });
        }

        const { content, mentions = [] } = req.body;

        const comment = await Comment.create({
            issue: req.params.issueId,
            author: req.user.userId,
            content,
            mentions
        });

        await Activity.create({
            project: req.projectId,
            actor: req.user.userId,
            action: 'COMMENT_CREATED',
            issue: req.params.issueId
        });

        // Notifications logic later

        res.status(201).json({ success: true, message: 'Comment created', data: { comment } });
    } catch (error) {
        next(error);
    }
};

exports.updateComment = async (req, res, next) => {
    try {
        // Must verify if author OR Owner/Admin (handled in route or here)
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found', code: 'NOT_FOUND' });

        if (comment.author.toString() !== req.user.userId && !['OWNER', 'ADMIN'].includes(req.projectRole)) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this comment', code: 'FORBIDDEN' });
        }

        comment.content = req.body.content;
        await comment.save();

        res.json({ success: true, message: 'Comment updated', data: { comment } });
    } catch (error) {
        next(error);
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found', code: 'NOT_FOUND' });

        if (comment.author.toString() !== req.user.userId && !['OWNER', 'ADMIN'].includes(req.projectRole)) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this comment', code: 'FORBIDDEN' });
        }

        await Comment.findByIdAndDelete(req.params.commentId);
        res.json({ success: true, message: 'Comment deleted', data: {} });
    } catch (error) {
        next(error);
    }
};
