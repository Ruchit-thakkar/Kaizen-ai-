import fs from 'fs';
import path from 'path';
import imagekit from '../../lib/imagekit.js';
import env from '../../config/env.js';

// List of dangerous file extensions to block
const BLOCKED_EXTENSIONS = ['exe', 'dll', 'bat', 'apk', 'iso', 'sh'];

// Max size rules per file category (in bytes)
const SIZE_LIMITS = {
  image: 20 * 1024 * 1024,      // 20 MB
  document: 50 * 1024 * 1024,   // 50 MB
  code: 10 * 1024 * 1024,       // 10 MB
  audio: 50 * 1024 * 1024,      // 50 MB
  video: 200 * 1024 * 1024      // 200 MB
};

/**
 * Detect file type category based on filename extension
 * @param {string} fileName 
 * @returns {string|null}
 */
export const getFileTypeCategory = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const images = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const documents = ['pdf', 'txt', 'docx', 'md'];
  const code = ['js', 'ts', 'jsx', 'tsx', 'py', 'cpp', 'java', 'html', 'css', 'php'];
  const audio = ['mp3', 'wav', 'm4a', 'ogg'];
  const video = ['mp4', 'mov', 'avi', 'webm'];
  
  if (images.includes(extension)) return 'image';
  if (documents.includes(extension)) return 'document';
  if (code.includes(extension)) return 'code';
  if (audio.includes(extension)) return 'audio';
  if (video.includes(extension)) return 'video';
  
  return null;
};

/**
 * Handle file upload processing (ImageKit upload or local storage fallback)
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} File upload metadata
 */
export const processUpload = async (file) => {
  const extension = file.originalname.split('.').pop().toLowerCase();

  // 1. Dangerous file validation
  if (BLOCKED_EXTENSIONS.includes(extension)) {
    throw new Error(`Upload rejected: Extension .${extension} is dangerous and not allowed.`);
  }

  // 2. File type detection
  const fileType = getFileTypeCategory(file.originalname);
  if (!fileType) {
    throw new Error(`Upload rejected: File type of .${extension} is not supported.`);
  }

  // 3. Size validation
  const sizeLimit = SIZE_LIMITS[fileType];
  if (file.size > sizeLimit) {
    const limitMb = sizeLimit / (1024 * 1024);
    throw new Error(`Upload rejected: File size exceeds the ${limitMb}MB limit for ${fileType}s.`);
  }

  // 4. Try ImageKit upload if configured
  if (imagekit) {
    try {
      console.log(`[Upload Service] Attempting ImageKit upload for ${file.originalname}`);
      const uploadResult = await imagekit.upload({
        file: file.buffer,
        fileName: `${Date.now()}-${file.originalname}`,
        folder: '/kaizen'
      });
      return {
        url: uploadResult.url,
        name: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        fileType
      };
    } catch (err) {
      console.error('[Upload Service] ImageKit upload error. Falling back to local storage:', err.message);
    }
  }

  // 5. Local storage fallback
  console.log(`[Upload Service] Saving ${file.originalname} to local disk`);
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const safeFilename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = path.join(uploadsDir, safeFilename);
  
  fs.writeFileSync(filePath, file.buffer);

  // Clean URL path
  const localUrl = `${env.BACKEND_URL}/uploads/${safeFilename}`;
  return {
    url: localUrl,
    name: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    fileType,
    localPath: filePath // Keep path to read text/code files locally on the backend
  };
};
