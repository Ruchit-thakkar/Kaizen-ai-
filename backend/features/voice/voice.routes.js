import express from 'express';
import multer from 'multer';
import { transcribeAudio, synthesizeSpeech } from './voice.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Multer memory configuration for audio uploads (caps audio file size to 15MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max audio file size
  }
});

// POST /api/voice/transcribe - Transcribe audio input
router.post('/transcribe', protect, upload.single('file'), transcribeAudio);

// POST /api/voice/synthesize - Generate spoken audio from text input
router.post('/synthesize', protect, synthesizeSpeech);

export default router;
