const express = require('express');
const { getComments, createComment, updateComment, deleteComment } = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth.middleware');
const Issue = require('../models/Issue');
const ProjectMember = require('../models/ProjectMember');

const router = express.Router({ mergeParams: true });

router.use(protect); // Ensure authenticated

// Middleware to verify issue exists and user has access to its project
router.use(async (req, res, next) => {
    try {
        const issue = await Issue.findById(req.params.issueId);
        if (!issue) return res.status(404).json({ success: false, message: 'Issue not found', code: 'NOT_FOUND' });

        const membership = await ProjectMember.findOne({ project: issue.project, user: req.user.userId });
        if (!membership) {
            return res.status(403).json({ success: false, message: 'Not authorized for this project', code: 'FORBIDDEN' });
        }

        req.projectId = issue.project; // Inject for controller
        req.projectRole = membership.role;
        next();
    } catch (error) {
        next(error);
    }
});

router.route('/')
    .get(getComments)
    .post(createComment); // Need to restrict VIEWER from commenting

router.route('/:commentId')
    .patch(updateComment)
    .delete(deleteComment);

module.exports = router;
