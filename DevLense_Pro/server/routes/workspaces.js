const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getWorkspaces);
router.get('/:id', workspaceController.getWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

module.exports = router;
