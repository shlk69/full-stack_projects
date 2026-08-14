const express = require('express');
const { getTasksByProject, createTask, updateTask, deleteTask } = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // All task routes require auth

router.post('/', createTask);
router.get('/project/:projectId', getTasksByProject);
router.route('/:id')
    .put(updateTask)
    .delete(deleteTask);

module.exports = router;
