import { clearUserMemories } from './memory.service.js';

/**
 * Clear all long-term memories for the logged-in user.
 */
export const clearMemories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const success = await clearUserMemories(userId);
    
    if (!success) {
      return res.status(500).json({ success: false, message: 'Failed to clear long-term memories.' });
    }

    res.status(200).json({ success: true, message: 'Long-term memories cleared successfully.' });
  } catch (error) {
    next(error);
  }
};
