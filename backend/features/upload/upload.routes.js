import express from 'express';
import multer from 'multer';
import { handleUpload } from './upload.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Multer in-memory storage config
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB overall max (validated further in service)
  }
});

// POST /api/upload - Requires authentication and single file under field name 'file'
router.post('/', protect, upload.single('file'), handleUpload);

export default router;
