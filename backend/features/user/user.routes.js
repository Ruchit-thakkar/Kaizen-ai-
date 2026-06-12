import express from 'express';
import { getProfile, updateProfile } from './user.controller.js';
import { validateUpdateProfile } from './user.validation.js';
import { validate } from '../../middleware/validate.middleware.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Route Guard: Require authentication for all user routes
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', validate(validateUpdateProfile), updateProfile);

export default router;
