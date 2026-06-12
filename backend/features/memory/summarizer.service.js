import mongoose from 'mongoose';
import env from '../../config/env.js';
import { getEmbedding } from './embedding.service.js';
import { upsertMemory } from './pinecone.service.js';
import Message from '../message/message.model.js';
import Conversation from '../conversation/conversation.model.js';

/**
 * Extract new long-term facts and user preferences from the latest chat exchange using NVIDIA DeepSeek Flash.
 * Runs asynchronously in the background.
 * @param {string} userId - User identifier
 * @param {string} userMessage - The last message sent by the user
 * @param {string} assistantResponse - The response sent by the assistant
 */
export const summarizeAndStore = async (userId, userMessage, assistantResponse) => {
  if (!userMessage || !userMessage.trim()) return;

  const apiKey = env.NVIDIA_API_KEY;
  if (!apiKey || !env.PINECONE_API_KEY) {
    // Bypass silently if keys are missing
    return;
  }

  try {
    const prompt = `You are an advanced memory processing assistant. Your task is to extract user facts, preferences, and important context from the recent dialogue between the user and Kaizen AI.

Guidelines:
1. ONLY extract long-term relevant facts or preferences about the user (e.g. user's name, favorite programming languages, technical stacks, user goals, personal facts, styling choices, hobbies).
2. DO NOT extract temporary states, questions, greetings, casual chit-chat, or transient information (e.g., "The user is asking for a filter", "The user wants an email template", "The user says hi").
3. DO NOT extract facts about the AI assistant or generic info, only specific details about the USER.
4. Each fact should be a concise, standalone statement written in the third person (e.g., "The user prefers Python for backend development", "The user's name is Ruchit").
5. If no new facts or preferences are found, return an empty list.

Latest dialogue exchange:
User: "${userMessage}"
Assistant: "${assistantResponse}"

Output MUST be a JSON object containing a 'facts' key, which is an array of strings representing the extracted facts. Return ONLY valid JSON, with no markdown wrapper (do not use \`\`\`json).`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-v4-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 512
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA completions API error: ${response.status}`);
    }

    const json = await response.json();
    const resultText = json.choices?.[0]?.message?.content?.trim();
    if (!resultText) return;

    // Sanitize in case JSON is wrapped in codeblocks
    const cleanJson = resultText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const { facts } = JSON.parse(cleanJson);
    if (!facts || !Array.isArray(facts) || facts.length === 0) {
      return;
    }

    console.log(`[Memory Summarizer] Extracted facts for user ${userId}:`, facts);

    // Upsert each extracted fact into Pinecone
    for (const fact of facts) {
      const trimmedFact = fact.trim();
      if (!trimmedFact) continue;

      // Use 'passage' inputType for storing memories
      const embedding = await getEmbedding(trimmedFact, 'passage');
      if (!embedding) {
        console.warn(`[Memory Summarizer] Could not generate embedding for fact: "${trimmedFact}"`);
        continue;
      }

      const memoryId = new mongoose.Types.ObjectId().toString();
      const success = await upsertMemory(userId, memoryId, embedding, trimmedFact);
      if (success) {
        console.log(`[Memory Summarizer] Successfully saved user fact: "${trimmedFact}"`);
      } else {
        console.warn(`[Memory Summarizer] Failed to save user fact: "${trimmedFact}"`);
      }
    }
  } catch (error) {
    console.error(`[Memory Summarizer] Error processing user memory: ${error.message}`);
  }
};

/**
 * Summarizes the entire conversation history when it gets long and stores it in MongoDB and Pinecone.
 * Runs asynchronously in the background.
 * @param {string} userId - User identifier
 * @param {string} conversationId - Conversation identifier
 */
export const compressConversationContext = async (userId, conversationId) => {
  const apiKey = env.NVIDIA_API_KEY;
  if (!apiKey) return;

  try {
    // 1. Fetch message history
    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
    
    // 2. Only summarize if the conversation is long (exceeds 7 messages)
    if (messages.length <= 7) {
      return;
    }

    console.log(`[Context Compression] Compressing history for conversation ${conversationId} (${messages.length} messages)`);

    // 3. Compile dialogue text
    const dialogueText = messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Kaizen AI'}: ${msg.content}`)
      .join('\n');

    const prompt = `You are a helpful assistant. Summarize the following chat conversation history between a User and Kaizen AI. Provide a concise, cohesive summary of the topics discussed, preferences expressed, and conclusions. Keep the summary under 150 words.

Conversation History:
${dialogueText}`;

    // 4. Generate summary via deepseek-v4-flash
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-v4-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA completions API error during compression: ${response.status}`);
    }

    const json = await response.json();
    const summary = json.choices?.[0]?.message?.content?.trim();
    if (!summary) return;

    // 5. Save summary to MongoDB
    await Conversation.findByIdAndUpdate(conversationId, { summary });
    console.log(`[Context Compression] Saved MongoDB summary for ${conversationId}`);

    // 6. Generate embedding and update Pinecone memory
    const summaryText = `Summary of conversation history: ${summary}`;
    const embedding = await getEmbedding(summaryText, 'passage');
    if (embedding && env.PINECONE_API_KEY) {
      const memoryId = `summary_${conversationId}`; // Constant ID per conversation to overwrite in-place
      const success = await upsertMemory(userId, memoryId, embedding, summaryText, {
        type: 'summary',
        conversationId: conversationId.toString()
      });
      if (success) {
        console.log(`[Context Compression] Saved Pinecone summary embedding for ${conversationId}`);
      }
    }
  } catch (error) {
    console.error(`[Context Compression] Error compressing conversation context: ${error.message}`);
  }
};
