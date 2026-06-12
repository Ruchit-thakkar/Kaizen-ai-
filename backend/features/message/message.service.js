import Message from './message.model.js';
import Conversation from '../conversation/conversation.model.js';

/**
 * Save a new message document in MongoDB.
 * @param {string} conversationId - Conversation ID
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - Message text content
 * @returns {Promise<Object>} Saved message document
 */
export const saveMessage = async (conversationId, role, content) => {
  const message = await Message.create({ conversationId, role, content });
  
  // Touch conversation to update updatedAt timestamp
  await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });
  
  return message;
};

/**
 * Get the full message history for a conversation, sorted chronologically.
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Array>} List of message documents
 */
export const getConversationMessages = async (conversationId) => {
  return await Message.find({ conversationId }).sort({ timestamp: 1 });
};
