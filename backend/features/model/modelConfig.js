export const modelConfig = {
  gemini25Flash: "gemini-2.5-flash",
  deepseekFlash: "deepseek-v4-flash",
  llama70b: "llama-3.3-70b-instruct",
  gptOss120b: "openai/gpt-oss-120b",
  embedding: "llama-nemotron-embed-1b-v2"
};

export const modelMetadata = [
  {
    id: "gptOss120b",
    name: "GPT OSS 120B",
    provider: "OpenAI",
    modelString: "openai/gpt-oss-120b",
    description: "Advanced reasoning and premium quality.",
    suggestedUsage: "Advanced reasoning and premium quality."
  },
  {
    id: "gemini25Flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    modelString: "gemini-2.5-flash",
    description: "Fast and balanced.",
    suggestedUsage: "Fast and balanced."
  },
  {
    id: "deepseekFlash",
    name: "DeepSeek V4 Flash",
    provider: "NVIDIA",
    modelString: "deepseek-v4-flash",
    description: "Best for speed and agents.",
    suggestedUsage: "Best for speed and agents."
  },
  {
    id: "llama70b",
    name: "Llama 3.3 70B",
    provider: "Meta",
    modelString: "llama-3.3-70b-instruct",
    description: "General-purpose conversations.",
    suggestedUsage: "General-purpose conversations."
  }
];

export const NVIDIA_MODEL_IDS = {
  "deepseek-v4-flash": "deepseek-ai/deepseek-v4-flash",
  "llama-3.3-70b-instruct": "meta/llama-3.3-70b-instruct",
  "llama-nemotron-embed-1b-v2": "nvidia/llama-nemotron-embed-1b-v2"
};
