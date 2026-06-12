import { getNVIDIAEmbedding } from '../model/provider.service.js';

/**
 * Generate a 1024-dimension vector embedding using NVIDIA's llama-nemotron-embed-1b-v2 model.
 * @param {string} text - Text block to vectorize
 * @param {string} [inputType='query'] - Input type ('query' or 'passage')
 * @returns {Promise<Array<number>|null>} 1024 float array vector
 */
export const getEmbedding = async (text, inputType = 'query') => {
  return await getNVIDIAEmbedding(text, inputType);
};
