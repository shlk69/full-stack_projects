const ProjectMember = require('../models/ProjectMember');

const requireRole = (roles) => {
    return async (req, res, next) => {
        try {
            const projectId = req.params.projectId || req.params.id;
            if (!projectId) {
                return res.status(400).json({ success: false, message: 'Project ID is required', code: 'BAD_REQUEST' });
            }

            const membership = await ProjectMember.findOne({ project: projectId, user: req.user.userId });

            if (!membership) {
                return res.status(403).json({ success: false, message: 'You do not have access to this project', code: 'FORBIDDEN' });
            }

            if (roles && roles.length > 0 && !roles.includes(membership.role)) {
                return res.status(403).json({ success: false, message: 'You do not have permission to perform this action', code: 'FORBIDDEN' });
            }

            // Save membership on request for further use in controller
            req.projectRole = membership.role;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = { requireRole };
