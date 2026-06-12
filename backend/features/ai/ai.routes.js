import express from 'express';
import { getAvailableModels } from './ai.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Route Guard: Require authentication for all AI routes
router.use(protect);

router.get('/models', getAvailableModels);

export default router;
