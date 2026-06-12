import { modelConfig, NVIDIA_MODEL_IDS } from './modelConfig.js';

/**
 * Resolves a model selection key to the exact NVIDIA model ID string.
 * Fallbacks to the default model 'deepseek-v4-flash' if key is invalid or undefined.
 * @param {string} modelKey - Model key (e.g., 'deepseekFlash', 'llama70b')
 * @returns {string} Fully qualified NVIDIA model ID (e.g., 'deepseek-ai/deepseek-v4-flash')
 */
export const resolveModel = (modelKey) => {
  // Try mapping modelKey (like 'llama70b') to its modelString (like 'llama-3.3-70b-instruct')
  const modelString = modelConfig[modelKey] || modelConfig.llama70b;

  // Resolve modelString to fully qualified NVIDIA model ID (with vendor prefix)
  const fullModelId = NVIDIA_MODEL_IDS[modelString];
  
  if (fullModelId) {
    return fullModelId;
  }

  // Fallback to llama-3.3-70b-instruct with correct vendor prefix if mapping not found
  console.warn(`[Model Router] Unresolved model: "${modelKey}". Falling back to default llama-3.3-70b-instruct.`);
  return 'meta/llama-3.3-70b-instruct';
};
