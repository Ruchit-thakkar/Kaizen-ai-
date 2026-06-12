import { resolveModel } from './modelRouter.service.js';
import { generateNVIDIAStream, generateGroqStream } from './provider.service.js';
import { parseSSEStream } from './streaming.service.js';
import { generateStream } from '../ai/ai.service.js';

/**
 * Generate a streaming response across the multi-model architecture.
 * Formats system instructions and messages to OpenAI specification.
 * @param {Array<Object>} messages - Messages sliding window [{ role: 'user'|'assistant', content: string }]
 * @param {Object} options - Configurations
 * @param {string} options.modelKey - Selected model key (e.g. 'deepseekFlash')
 * @param {string} [options.systemInstruction] - Dynamic system instructions including facts and preferences
 * @param {AbortSignal} [options.signal] - Abort signal to cancel execution
 * @returns {Promise<AsyncGenerator<{text: string}>>} Async generator yielding response delta chunks
 */
export const generateMultiModelStream = async (messages, options = {}) => {
  const { modelKey, systemInstruction, signal } = options;

  // Handle Google Gemini 2.5 Flash direct integration
  if (modelKey === 'gemini25Flash') {
    console.log(`[Model Service] Routing message generation to Google Gemini API (key: ${modelKey})`);
    const stream = await generateStream(messages, {
      signal,
      model: 'gemini-2.5-flash',
      systemInstruction
    });

    return (async function* () {
      for await (const chunk of stream) {
        if (chunk.text) {
          yield { text: chunk.text };
        }
      }
    })();
  }



  // Handle Groq API model (GPT OSS 120B)
  if (modelKey === 'gptOss120b') {
    const modelId = 'openai/gpt-oss-120b';
    console.log(`[Model Service] Routing message generation to Groq API (key: ${modelKey}, model: ${modelId})`);

    const apiMessages = [];
    if (systemInstruction && systemInstruction.trim()) {
      apiMessages.push({ role: 'system', content: systemInstruction.trim() });
    }
    for (const msg of messages) {
      apiMessages.push({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
      });
    }

    const response = await generateGroqStream(apiMessages, {
      model: modelId,
      signal
    });
    return parseSSEStream(response, signal);
  }

  // Prepend conversational guidelines for Llama 3.3 70B to avoid generic/repetitive greeting statements
  let adjustedSystemInstruction = systemInstruction;
  if (modelKey === 'llama70b') {
    adjustedSystemInstruction = `You are Kaizen AI, a highly personalized, natural, engaging, and intelligent AI companion. Your goal is to make conversations feel organic, lively, and intelligent. Avoid generic, dry, or repetitive remarks. Never tell the user that they are repeating greetings (like saying "hello again") or sound robotic. Be direct, helpful, and converse naturally.\n\n` + (systemInstruction || '');
  }

  // 1. Resolve to the fully qualified NVIDIA model ID
  const resolvedModelId = resolveModel(modelKey);
  console.log(`[Model Service] Routing message generation to model: ${resolvedModelId} (key: ${modelKey})`);

  // 2. Format messages into OpenAI compatible structures
  const apiMessages = [];
  
  if (adjustedSystemInstruction && adjustedSystemInstruction.trim()) {
    apiMessages.push({
      role: 'system',
      content: adjustedSystemInstruction.trim()
    });
  }

  // Prepend history mapping 'assistant' and 'user' roles
  for (const msg of messages) {
    apiMessages.push({
      role: msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content
    });
  }

  // 3. Request completion stream from NVIDIA Build API provider
  const response = await generateNVIDIAStream(apiMessages, {
    model: resolvedModelId,
    signal
  });

  // 4. Return the parsed SSE async generator
  return parseSSEStream(response, signal);
};
