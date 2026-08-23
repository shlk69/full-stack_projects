import express from 'express';
import { getBrandVoice, updateBrandVoice } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/brand-voice', getBrandVoice);
router.put('/brand-voice', updateBrandVoice);

export default router;
