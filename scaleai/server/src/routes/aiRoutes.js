import express from 'express';
import { generatePosts } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generatePosts);

export default router;
