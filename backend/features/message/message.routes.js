import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { getHistory } from './message.controller.js';

const router = express.Router();

// Protect all message routes
router.use(protect);

router.get('/conversation/:conversationId', getHistory);

export default router;
