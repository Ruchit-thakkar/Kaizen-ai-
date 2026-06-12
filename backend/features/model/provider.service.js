import env from '../../config/env.js';


/**
 * Normalizes a vector using L2 normalization (Euclidean norm).
 * @param {Array<number>} vec - The raw vector array
 * @returns {Array<number>} Normalized vector
 */
const l2Normalize = (vec) => {
  const sumOfSquares = vec.reduce((sum, val) => sum + val * val, 0);
  const magnitude = Math.sqrt(sumOfSquares);
  return magnitude === 0 ? vec : vec.map(val => val / magnitude);
};

/**
 * Generate a stream of completion chunks from the NVIDIA Build API.
 * @param {Array<Object>} messages - Array of message objects [{role, content}]
 * @param {Object} options - API Options
 * @param {string} options.model - NVIDIA Model ID (full name with vendor prefix)
 * @param {AbortSignal} [options.signal] - Abort signal to cancel the stream
 * @returns {Promise<Response>} HTTP Response object containing the readable stream
 */
export const generateNVIDIAStream = async (messages, options = {}) => {
  const { model, signal } = options;
  const apiKey = env.NVIDIA_API_KEY;

  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not defined in environment variables.');
  }

  // Set default parameters
  let temperature = 0.2;
  let top_p = 0.7;
  let max_tokens = 1024;
  let frequency_penalty = 0.0;
  let presence_penalty = 0.0;
  let stop = undefined;

  // Custom configurations per model
  if (model.includes('llama-3.3-70b')) {
    // Llama 3.3 70B: higher temperature for natural flow
    temperature = 0.7;
    top_p = 0.9;
    max_tokens = 2048;
  }

  const requestBody = {
    model,
    messages,
    stream: true,
    temperature,
    top_p,
    max_tokens,
    frequency_penalty,
    presence_penalty
  };

  if (stop) {
    requestBody.stop = stop;
  }

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody),
    signal
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error(`[Model Service Error] Provider: NVIDIA, Model: ${model}, Status Code: ${response.status}, Error Message: ${response.statusText}, Response Body: ${errorBody}`);
    throw new Error(`Unable to generate a response.\nPlease try again or switch to another model.`);
  }

  return response;
};



/**
 * Generate a stream of completion chunks from the Groq API.
 * @param {Array<Object>} messages - Array of message objects [{role, content}]
 * @param {Object} options - API Options
 * @param {string} options.model - Model ID (e.g. 'openai/gpt-oss-120b')
 * @param {AbortSignal} [options.signal] - Abort signal to cancel the stream
 * @returns {Promise<Response>} HTTP Response object
 */
export const generateGroqStream = async (messages, options = {}) => {
  const { model, signal } = options;
  const apiKey = env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined in environment variables.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.3,
      top_p: 0.85,
      max_tokens: 2048
    }),
    signal
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error(`[Model Service Error] Provider: Groq, Model: ${model}, Status Code: ${response.status}, Error Message: ${response.statusText}, Response Body: ${errorBody}`);
    throw new Error(`Unable to generate a response.\nPlease try again or switch to another model.`);
  }

  return response;
};

/**
 * Get embedding vector using llama-nemotron-embed-1b-v2, sliced to 1024-dim and normalized.
 * @param {string} text - Raw text block to embed
 * @param {string} [inputType='query'] - Input type: 'query' or 'passage'
 * @returns {Promise<Array<number>|null>} 1024-dimension float array
 */
export const getNVIDIAEmbedding = async (text, inputType = 'query') => {
  if (!text || !text.trim()) return null;
  const apiKey = env.NVIDIA_API_KEY;

  if (!apiKey) {
    console.error('[NVIDIA Embedding] NVIDIA_API_KEY is missing.');
    return null;
  }

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        input: [text],
        model: 'nvidia/llama-nemotron-embed-1b-v2',
        input_type: inputType,
        encoding_format: 'float'
      })
    });

    if (!response.ok) {
      throw new Error(`Embedding request failed with status ${response.status}`);
    }

    const json = await response.json();
    if (json && json.data && json.data[0] && json.data[0].embedding) {
      const fullEmbedding = json.data[0].embedding;
      
      // Slice embedding to 1024 dimensions (Matryoshka Representation Learning downscaling)
      const sliced = fullEmbedding.slice(0, 1024);
      
      // Re-apply L2 normalization to the sliced vector
      return l2Normalize(sliced);
    }
    
    throw new Error('NVIDIA embedding response did not contain embedding values.');
  } catch (error) {
    console.error(`[NVIDIA Embedding] Error generating vector: ${error.message}`);
    return null;
  }
};
