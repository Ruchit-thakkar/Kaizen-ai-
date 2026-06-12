import express from 'express';
import { signUp, login, logout, getMe } from './auth.controller.js';
import { validateSignUp, validateLogin } from './auth.validation.js';
import { validate } from '../../middleware/validate.middleware.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public auth endpoints
router.post('/signup', validate(validateSignUp), signUp);
router.post('/login', validate(validateLogin), login);

// Secured auth endpoints
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
