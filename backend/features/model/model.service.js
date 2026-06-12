import { resolveModel } from './modelRouter.service.js';
import { generateNVIDIAStream } from './provider.service.js';
import { parseSSEStream } from './streaming.service.js';

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

  // 1. Resolve to the fully qualified NVIDIA model ID
  const resolvedModelId = resolveModel(modelKey);
  console.log(`[Model Service] Routing message generation to model: ${resolvedModelId} (key: ${modelKey})`);

  // 2. Format messages into OpenAI compatible structures
  const apiMessages = [];
  
  if (systemInstruction && systemInstruction.trim()) {
    apiMessages.push({
      role: 'system',
      content: systemInstruction.trim()
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
