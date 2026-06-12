import { Pinecone } from '@pinecone-database/pinecone';
import env from '../../config/env.js';

let pineconeClient = null;
let indexInstance = null;

const getIndex = () => {
  if (!indexInstance) {
    const apiKey = env.PINECONE_API_KEY;
    if (!apiKey) {
      console.warn('WARNING: PINECONE_API_KEY is not defined. Semantic long-term memory operations will be bypassed.');
      return null;
    }
    
    try {
      pineconeClient = new Pinecone({ apiKey });
      indexInstance = pineconeClient.index('kaizen');
    } catch (error) {
      console.error('Pinecone initialization failed:', error.message);
      return null;
    }
  }
  return indexInstance;
};

/**
 * Upsert a semantic memory vector to Pinecone inside the user's namespace.
 * @param {string} userId - User identifier
 * @param {string} memoryId - Unique ID of the memory record
 * @param {Array<number>} vector - 768-dimension embedding values
 * @param {string} text - The raw memory fact text string
 * @param {Object} metadata - Optional additional fields
 */
export const upsertMemory = async (userId, memoryId, vector, text, metadata = {}) => {
  const index = getIndex();
  if (!index) return false;

  try {
    const namespace = `user_${userId}`;
    const record = {
      id: memoryId,
      values: vector,
      metadata: {
        ...metadata,
        text,
        userId: userId.toString()
      }
    };
    
    await index.namespace(namespace).upsert([record]);
    return true;
  } catch (error) {
    console.error(`Error upserting vector memory to Pinecone: ${error.message}`);
    return false;
  }
};

/**
 * Query Pinecone for semantically relevant memories in the user's namespace.
 * @param {string} userId - User identifier
 * @param {Array<number>} vector - Query embedding vector
 * @param {number} topK - Maximum number of relevant memories to retrieve
 * @returns {Promise<Array<string>>} List of retrieved memory text facts
 */
export const queryMemories = async (userId, vector, topK = 3) => {
  const index = getIndex();
  if (!index) return [];

  try {
    const namespace = `user_${userId}`;
    const queryResponse = await index.namespace(namespace).query({
      vector,
      topK,
      includeMetadata: true
    });

    if (!queryResponse || !queryResponse.matches) return [];

    // Filter results using a similarity threshold of 0.65 to ensure only related facts are injected
    return queryResponse.matches
      .filter(match => match.score >= 0.65 && match.metadata && match.metadata.text)
      .map(match => match.metadata.text);
  } catch (error) {
    console.error(`Error querying memories from Pinecone: ${error.message}`);
    return [];
  }
};

/**
 * Clear all vector memory entries in Pinecone for a given user.
 */
export const deleteUserMemories = async (userId) => {
  const index = getIndex();
  if (!index) return false;

  try {
    const namespace = `user_${userId}`;
    await index.namespace(namespace).deleteAll();
    return true;
  } catch (error) {
    console.error(`Error clearing Pinecone namespace for user ${userId}: ${error.message}`);
    return false;
  }
};
