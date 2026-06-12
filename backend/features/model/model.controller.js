import { modelMetadata } from './modelConfig.js';

/**
 * Retrieve metadata details of all supported AI models.
 * @route GET /api/models
 */
export const getAvailableModels = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: modelMetadata
    });
  } catch (error) {
    next(error);
  }
};
