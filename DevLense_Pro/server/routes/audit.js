const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const auth = require('../middleware/auth');

router.post('/run-full-audit', auth, auditController.runAudit);

module.exports = router;
