export const modelConfig = {
  deepseekFlash: "deepseek-v4-flash",
  deepseekPro: "deepseek-v4-pro",
  llama70b: "llama-3.3-70b-instruct",
  gemma31b: "gemma-4-31b-it",
  phi4Mini: "phi-4-mini-instruct",
  gptOss120b: "gpt-oss-120b",
  embedding: "llama-nemotron-embed-1b-v2"
};

export const modelMetadata = [
  {
    id: "deepseekFlash",
    name: "DeepSeek Flash",
    provider: "DeepSeek",
    modelString: "deepseek-v4-flash",
    description: "Fast responses, low latency, agent & tool calling",
    suggestedUsage: "Fast chats, agents, everyday questions"
  },
  {
    id: "deepseekPro",
    name: "DeepSeek Pro",
    provider: "DeepSeek",
    modelString: "deepseek-v4-pro",
    description: "Programming, advanced reasoning, and complex logic",
    suggestedUsage: "Coding, complex reasoning"
  },
  {
    id: "llama70b",
    name: "Llama 3.3 70B",
    provider: "Meta",
    modelString: "llama-3.3-70b-instruct",
    description: "General-purpose conversation, long answers, creativity",
    suggestedUsage: "General-purpose tasks"
  },
  {
    id: "gemma31b",
    name: "Gemma 4 31B",
    provider: "Google",
    modelString: "gemma-4-31b-it",
    description: "Balanced performance for everyday tasks",
    suggestedUsage: "Balanced performance"
  },
  {
    id: "phi4Mini",
    name: "Phi 4 Mini",
    provider: "Microsoft",
    modelString: "phi-4-mini-instruct",
    description: "Lightweight tasks, fast responses, and cheap inference",
    suggestedUsage: "Lightweight tasks, cheap inference"
  },
  {
    id: "gptOss120b",
    name: "GPT OSS 120B",
    provider: "OpenAI",
    modelString: "gpt-oss-120b",
    description: "High-quality reasoning, general intelligence, complex conversations",
    suggestedUsage: "Premium reasoning"
  }
];

export const NVIDIA_MODEL_IDS = {
  "deepseek-v4-flash": "deepseek-ai/deepseek-v4-flash",
  "deepseek-v4-pro": "deepseek-ai/deepseek-v4-pro",
  "llama-3.3-70b-instruct": "meta/llama-3.3-70b-instruct",
  "gemma-4-31b-it": "google/gemma-4-31b-it",
  "phi-4-mini-instruct": "microsoft/phi-4-mini-instruct",
  "gpt-oss-120b": "openai/gpt-oss-120b",
  "llama-nemotron-embed-1b-v2": "nvidia/llama-nemotron-embed-1b-v2"
};
