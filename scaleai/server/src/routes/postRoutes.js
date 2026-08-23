import express from 'express';
import { getPosts, updatePost, schedulePost } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getPosts);
router.patch('/:id', updatePost);
router.patch('/:id/schedule', schedulePost);

export default router;
