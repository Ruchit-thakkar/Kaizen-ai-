import { deleteUserMemories } from './pinecone.service.js';

/**
 * Clear all long-term vector memories for a user.
 * @param {string} userId - User identifier
 * @returns {Promise<boolean>} Success state
 */
export const clearUserMemories = async (userId) => {
  return await deleteUserMemories(userId);
};
