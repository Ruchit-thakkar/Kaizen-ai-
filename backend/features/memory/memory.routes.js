import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { clearMemories } from './memory.controller.js';

const router = express.Router();

// Protect memory routes
router.use(protect);

router.delete('/', clearMemories);

export default router;
