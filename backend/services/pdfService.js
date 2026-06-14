import mammoth from 'mammoth';
import fs from 'fs';

/**
 * Extract raw text from a local .docx file path
 * @param {string} filePath 
 * @returns {Promise<string>}
 */
export const parseDocx = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('[Docx Service] Mammoth extraction error:', error.message);
    throw new Error('Failed to parse .docx file content.');
  }
};

/**
 * Get system instructions tailored for document Q&A and analysis
 */
export const getInstructions = () => {
  return `You are a document understanding expert. Your task is to analyze documents, perform summarization, extract key bullet points, and answer questions. Be thorough and trace claims back to specific headings or sections where possible. If tabular data is present, format it clearly using markdown tables.`;
};
