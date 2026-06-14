import { processUpload } from './upload.service.js';

/**
 * Handle incoming file uploads
 */
export const handleUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was provided in the upload request.'
      });
    }

    const metadata = await processUpload(req.file);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully.',
      data: metadata
    });
  } catch (error) {
    console.error('[Upload Controller] Upload error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'Something went wrong during the file upload.'
    });
  }
};
