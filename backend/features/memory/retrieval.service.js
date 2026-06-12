import { getEmbedding } from './embedding.service.js';
import { queryMemories } from './pinecone.service.js';

/**
 * Retrieve relevant long-term memories for a user given a query text.
 * @param {string} userId - User identifier
 * @param {string} queryText - The text query (e.g. user's message)
 * @param {number} topK - Maximum number of relevant memories to retrieve
 * @returns {Promise<Array<string>>} List of retrieved memory text facts
 */
export const retrieveMemories = async (userId, queryText, topK = 3) => {
  if (!queryText || !queryText.trim()) return [];

  try {
    const vector = await getEmbedding(queryText);
    if (!vector) {
      console.warn(`Could not generate embedding for query: "${queryText.substring(0, 30)}..."`);
      return [];
    }

    return await queryMemories(userId, vector, topK);
  } catch (error) {
    console.error(`Error retrieving user memories: ${error.message}`);
    return [];
  }
};
