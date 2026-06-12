import { GoogleGenAI } from '@google/genai';
import env from '../../config/env.js';

let aiClient = null;

const getAIClient = () => {
  if (!aiClient) {
    const key = env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables. Please add it to your .env file.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
};

/**
 * Generate a streaming response from Gemini.
 * @param {Array} messages - Chat history in the format [{ role: 'user'|'model', content: string }]
 * @param {Object} options - Additional options including signal for aborting
 * @returns {Promise<AsyncGenerator>}
 */
export const generateStream = async (messages, options = {}) => {
  const client = getAIClient();
  const { signal, model = 'gemini-2.5-flash', systemInstruction } = options;

  const contents = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const stream = await client.models.generateContentStream(
    {
      model,
      contents,
      config: {
        systemInstruction,
      }
    },
    {
      signal,
    }
  );

  return stream;
};
