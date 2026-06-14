import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Lazy-initialize client so it doesn't crash on startup if API key is not set yet
let aiClient = null;

const getAIClient = () => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables. Please add it to your .env file.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
};

import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * Resolves a file URL or local path to base64 inlineData for the Gemini API
 * @param {Object} attachment 
 * @returns {Promise<Object|null>} Gemini inlineData part
 */
const resolveFileToGeminiPart = async (attachment) => {
  const { url, mimeType, localPath } = attachment;
  if (!url && !localPath) return null;

  try {
    let dataBuffer;
    if (localPath && fs.existsSync(localPath)) {
      dataBuffer = fs.readFileSync(localPath);
    } else if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      dataBuffer = Buffer.from(response.data);
    } else if (url) {
      // Relative path handling
      const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
      const resolvedPath = path.join(process.cwd(), cleanUrl);
      if (fs.existsSync(resolvedPath)) {
        dataBuffer = fs.readFileSync(resolvedPath);
      } else {
        throw new Error(`File not found at resolved local path: ${resolvedPath}`);
      }
    } else {
      throw new Error('No valid file source.');
    }

    return {
      inlineData: {
        data: dataBuffer.toString('base64'),
        mimeType
      }
    };
  } catch (err) {
    console.error('[AI Service Duplicate] resolveFileToGeminiPart error:', err.message);
    return null;
  }
};

/**
 * Generate a streaming response from Gemini
 * @param {Array} messages - Chat history in the format [{ role: 'user'|'model', content: string }]
 * @param {Object} options - Additional options including signal for aborting
 * @returns {Promise<AsyncGenerator>}
 */
export const generateStream = async (messages, options = {}) => {
  const client = getAIClient();
  const { signal, model = 'gemini-2.5-flash', systemInstruction } = options;

  // Map messages to include file parts when attachments are present
  const contents = [];
  for (const msg of messages) {
    const parts = [];
    if (msg.content) {
      parts.push({ text: msg.content });
    }
    if (msg.attachment) {
      const part = await resolveFileToGeminiPart(msg.attachment);
      if (part) {
        parts.push(part);
      }
    }
    // Gemini requires at least one part per content object
    if (parts.length === 0) {
      parts.push({ text: '' });
    }
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts
    });
  }

  // Call the generateContentStream API.
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
