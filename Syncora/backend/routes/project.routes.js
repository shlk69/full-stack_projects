const express = require('express');
const { getProjects, createProject, getProject, deleteProject } = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // All project routes require auth

router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/:id')
    .get(getProject)
    .delete(deleteProject);

module.exports = router;
