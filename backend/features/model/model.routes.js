import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { getAvailableModels } from './model.controller.js';

const router = express.Router();

// Protect all routes under this feature
router.use(protect);

router.route('/')
  .get(getAvailableModels);

export default router;
