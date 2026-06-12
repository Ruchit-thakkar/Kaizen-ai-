import { GoogleGenAI } from '@google/genai';
import env from '../../config/env.js';
import Conversation from './conversation.model.js';
import Message from '../message/message.model.js';

/**
 * List all conversations belonging to a user, sorted by update time descending.
 * @param {string} userId - User identifier
 * @returns {Promise<Array>} List of conversation documents
 */
export const listConversations = async (userId) => {
  return await Conversation.find({ userId }).sort({ updatedAt: -1 });
};

/**
 * Create a new conversation document.
 * @param {string} userId - User identifier
 * @param {string} [title='New chat'] - Initial conversation title
 * @returns {Promise<Object>} Created conversation document
 */
export const createConversation = async (userId, title = 'New chat') => {
  return await Conversation.create({ userId, title });
};

/**
 * Rename an existing conversation title.
 * @param {string} conversationId - Conversation identifier
 * @param {string} title - New title
 * @returns {Promise<Object|null>} Updated conversation document or null
 */
export const renameConversation = async (conversationId, title) => {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    { title },
    { new: true, runValidators: true }
  );
};

/**
 * Delete a conversation and all its associated messages.
 * @param {string} conversationId - Conversation identifier
 * @returns {Promise<boolean>} Success state
 */
export const deleteConversation = async (conversationId) => {
  // Delete all associated messages first
  await Message.deleteMany({ conversationId });
  // Delete the conversation document
  const deleted = await Conversation.findByIdAndDelete(conversationId);
  return !!deleted;
};

/**
 * Generate a short summary title for a conversation using NVIDIA Build API.
 * @param {string} firstMessageText - The first message text
 * @returns {Promise<string>} 2-4 word summary title
 */
export const generateTitle = async (firstMessageText) => {
  const apiKey = env.NVIDIA_API_KEY;
  if (!apiKey) return 'New chat';
  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-v4-flash',
        messages: [
          {
            role: 'user',
            content: `Generate a very short summary title (2 to 4 words) for a chat session starting with: "${firstMessageText}". Respond with ONLY the title. Do not include quotes, punctuation, or explanations.`
          }
        ],
        max_tokens: 32,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA Title API HTTP error ${response.status}`);
    }

    const json = await response.json();
    const title = json.choices?.[0]?.message?.content || 'New chat';
    return title.replace(/["']/g, '').trim();
  } catch (error) {
    console.error('Error generating conversation title via NVIDIA:', error.message);
    return 'New chat';
  }
};

/**
 * Update the active model of a conversation.
 * @param {string} conversationId - Conversation identifier
 * @param {string} model - Selected model key (e.g. 'deepseekPro')
 * @returns {Promise<Object|null>} Updated conversation document or null
 */
export const updateConversationModel = async (conversationId, model) => {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    { model },
    { new: true, runValidators: true }
  );
};

