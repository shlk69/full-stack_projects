const ProjectMember = require('../models/ProjectMember');
const Activity = require('../models/Activity');

exports.getMembers = async (req, res, next) => {
    try {
        const members = await ProjectMember.find({ project: req.params.projectId }).populate('user', 'name email avatar');
        res.json({ success: true, message: 'Members retrieved', data: { members } });
    } catch (error) {
        next(error);
    }
};

exports.addMember = async (req, res, next) => {
    try {
        const { userId, role } = req.body;
        const exists = await ProjectMember.findOne({ project: req.params.projectId, user: userId });
        if (exists) {
            return res.status(409).json({ success: false, message: 'User is already a member', code: 'CONFLICT' });
        }

        const member = await ProjectMember.create({ project: req.params.projectId, user: userId, role: role || 'MEMBER' });

        await Activity.create({
            project: req.params.projectId, actor: req.user.userId, action: 'MEMBER_ADDED', metadata: { addedUser: userId, role }
        });

        res.status(201).json({ success: true, message: 'Member added', data: { member } });
    } catch (error) {
        next(error);
    }
};

exports.changeMemberRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const member = await ProjectMember.findOneAndUpdate(
            { project: req.params.projectId, user: req.params.userId },
            { role },
            { new: true }
        );
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found', code: 'NOT_FOUND' });
        }

        await Activity.create({
            project: req.params.projectId, actor: req.user.userId, action: 'MEMBER_ROLE_CHANGED', metadata: { targetUser: req.params.userId, newRole: role }
        });

        res.json({ success: true, message: 'Role changed', data: { member } });
    } catch (error) {
        next(error);
    }
};

exports.removeMember = async (req, res, next) => {
    try {
        const member = await ProjectMember.findOne({ project: req.params.projectId, user: req.params.userId });
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found', code: 'NOT_FOUND' });
        }

        // Cannot remove an OWNER
        if (member.role === 'OWNER') {
            return res.status(403).json({ success: false, message: 'Cannot remove the project owner', code: 'FORBIDDEN' });
        }

        await ProjectMember.findByIdAndDelete(member._id);

        await Activity.create({
            project: req.params.projectId, actor: req.user.userId, action: 'MEMBER_REMOVED', metadata: { removedUser: req.params.userId }
        });

        res.json({ success: true, message: 'Member removed', data: {} });
    } catch (error) {
        next(error);
    }
};
