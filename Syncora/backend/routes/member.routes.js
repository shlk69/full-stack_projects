const express = require('express');
const { getMembers, addMember, changeMemberRole, removeMember } = require('../controllers/member.controller');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router({ mergeParams: true });

// Require user to at least be part of the project
router.use(requireRole());

router.route('/')
    .get(getMembers)
    .post(requireRole(['OWNER', 'ADMIN']), addMember);

router.route('/:userId')
    .patch(requireRole(['OWNER']), changeMemberRole)
    .delete(requireRole(['OWNER', 'ADMIN']), removeMember);

module.exports = router;
