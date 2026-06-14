import fs from 'fs';
import axios from 'axios';

/**
 * Reads code content from a local path or remote URL
 * @param {Object} attachment 
 * @returns {Promise<string>}
 */
export const readCodeFile = async (attachment) => {
  const { url, localPath } = attachment;
  try {
    if (localPath && fs.existsSync(localPath)) {
      return fs.readFileSync(localPath, 'utf8');
    }
    if (url) {
      const response = await axios.get(url, { responseType: 'text' });
      return response.data;
    }
    throw new Error('No valid file path or URL provided.');
  } catch (err) {
    console.error('[Code Service] Error reading code file:', err.message);
    return `[Error loading code content: ${err.message}]`;
  }
};

/**
 * Get system instructions tailored for coding tasks
 */
export const getInstructions = () => {
  return `You are a professional software engineering assistant. Your task is to analyze code, explain logic, debug issues, refactor, and recommend optimizations.
- Point out potential bugs or edge cases.
- Explain details step-by-step.
- Provide clean, commented, and production-ready snippets in markdown code blocks.
- List architectural improvements or performance optimizations.`;
};
