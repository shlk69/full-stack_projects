const express = require('express');
const {
    createIssue, getIssues, getIssue, updateIssue, deleteIssue,
    changeStatus, assignIssue, updateOrder
} = require('../controllers/issue.controller');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router({ mergeParams: true });

// Require user to at least be part of the project (VIEWER or higher)
router.use(requireRole());

router.route('/')
    .get(getIssues)
    .post(requireRole(['OWNER', 'ADMIN', 'MEMBER']), createIssue);

router.route('/:issueId')
    .get(getIssue)
    .patch(requireRole(['OWNER', 'ADMIN', 'MEMBER']), updateIssue) // Needs more granular check if MEMBER can update someone else's issue
    .delete(requireRole(['OWNER', 'ADMIN']), deleteIssue);

router.patch('/:issueId/status', requireRole(['OWNER', 'ADMIN', 'MEMBER']), changeStatus);
router.patch('/:issueId/assign', requireRole(['OWNER', 'ADMIN', 'MEMBER']), assignIssue);
router.patch('/:issueId/order', requireRole(['OWNER', 'ADMIN', 'MEMBER']), updateOrder);

module.exports = router;
