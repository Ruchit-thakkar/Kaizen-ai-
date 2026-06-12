import Message from '../message/message.model.js';
import Conversation from '../conversation/conversation.model.js';
import { retrieveMemories } from './retrieval.service.js';

/**
 * Retrieve sliding window context and construct user personalized instructions.
 * @param {string} userId - User ID
 * @param {string} conversationId - Conversation ID
 * @param {string} queryText - The current user message query to match memories
 * @returns {Promise<{ messages: Array<{role: string, content: string}>, systemInstruction: string }>}
 */
export const buildContext = async (userId, conversationId, queryText) => {
  let memories = [];
  
  try {
    // 1. Retrieve top 5 long-term memories from Pinecone (changed from 3 to 5 per instructions)
    memories = await retrieveMemories(userId, queryText, 5);
    console.log(`[Context Builder] Retrieved memories for user ${userId}:`, memories);
  } catch (error) {
    console.error(`[Context Builder] Error retrieving memories: ${error.message}`);
  }

  // 2. Fetch the sliding window of last 7 messages from MongoDB
  let recentMessages = [];
  try {
    recentMessages = await Message.find({ conversationId })
      .sort({ timestamp: -1 })
      .limit(7);
      
    // Sort ascending to maintain conversation flow
    recentMessages.reverse();
  } catch (error) {
    console.error(`[Context Builder] Error fetching short-term history: ${error.message}`);
  }

  // 3. Fetch conversation to check for summary
  let conversation = null;
  try {
    conversation = await Conversation.findById(conversationId);
  } catch (error) {
    console.error(`[Context Builder] Error fetching conversation summary: ${error.message}`);
  }

  // 4. Assemble system instruction
  let systemInstruction = `You are Kaizen AI, a highly personalized, friendly, and intelligent AI companion. 
Ensure your answers are professional, clear, and direct.`;

  if (conversation && conversation.summary) {
    systemInstruction += `\n\nHere is a summary of the previous conversation history:
${conversation.summary}`;
  }

  if (memories.length > 0) {
    systemInstruction += `\n\nHere are some relevant long-term facts/preferences about the user:
${memories.map(fact => `- ${fact}`).join('\n')}

Use this information where appropriate to personalize your answers. Do not explicitly say "Based on your preferences" or "I remember that" unless asked; just naturally tailor your response to match this context.`;
  }

  // Return list format compatible with model services
  const formattedMessages = recentMessages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  return {
    messages: formattedMessages,
    systemInstruction
  };
};
