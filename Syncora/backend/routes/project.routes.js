const express = require('express');
const { getProjects, createProject, getProject, updateProject, deleteProject } = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const memberRoutes = require('./member.routes'); // Let's isolate members

const router = express.Router();

router.use(protect); // All project routes require auth

router.route('/')
    .get(getProjects)
    .post(createProject);

// For nested routes
router.use('/:projectId/members', memberRoutes);
router.use('/:projectId/issues', require('./issue.routes'));

const { getProjectActivities } = require('../controllers/activity.controller');
const { getDashboardStats } = require('../controllers/dashboard.controller');

router.get('/:projectId/activities', requireRole(), getProjectActivities);
router.get('/:projectId/dashboard', requireRole(), getDashboardStats);

router.route('/:id')
    .get(requireRole(), getProject)
    .patch(requireRole(['OWNER', 'ADMIN']), updateProject)
    .delete(requireRole(['OWNER']), deleteProject);

module.exports = router;
