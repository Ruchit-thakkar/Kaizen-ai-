import { modelConfig, NVIDIA_MODEL_IDS } from './modelConfig.js';

/**
 * Resolves a model selection key to the exact NVIDIA model ID string.
 * Fallbacks to the default model 'deepseek-v4-flash' if key is invalid or undefined.
 * @param {string} modelKey - Model key (e.g., 'deepseekFlash', 'llama70b')
 * @returns {string} Fully qualified NVIDIA model ID (e.g., 'deepseek-ai/deepseek-v4-flash')
 */
export const resolveModel = (modelKey) => {
  // Try mapping modelKey (like 'deepseekFlash') to its modelString (like 'deepseek-v4-flash')
  const modelString = modelConfig[modelKey] || modelConfig.deepseekFlash;

  // Resolve modelString to fully qualified NVIDIA model ID (with vendor prefix)
  const fullModelId = NVIDIA_MODEL_IDS[modelString];
  
  if (fullModelId) {
    return fullModelId;
  }

  // Fallback to deepseek-v4-flash with correct vendor prefix if mapping not found
  console.warn(`[Model Router] Unresolved model: "${modelKey}". Falling back to default deepseek-v4-flash.`);
  return 'deepseek-ai/deepseek-v4-flash';
};
