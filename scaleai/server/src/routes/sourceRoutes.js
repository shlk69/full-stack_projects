import express from 'express';
import { createSource, getSources, deleteSource } from '../controllers/sourceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createSource);
router.get('/', getSources);
router.delete('/:id', deleteSource);

export default router;
