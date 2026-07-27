const providers = {
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat',
    baseURL: 'https://api.deepseek.com',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-pro',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.1-70b-versatile',
    baseURL: 'https://api.groq.com/openai/v1',
  },
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    model: 'claude-sonnet-4-20250514',
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    model: 'meta-llama/llama-3.1-70b-instruct',
    baseURL: 'https://openrouter.ai/api/v1',
  },
  nvidia: {
    apiKey: process.env.NVIDIA_NIM_API_KEY,
    model: 'meta/llama-3.1-70b-instruct',
    baseURL: 'https://integrate.api.nvidia.com/v1',
  },
  huggingface: {
    apiKey: process.env.HUGGING_FACE_API_TOKEN,
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    baseURL: 'https://api-inference.huggingface.co/models',
  },
};

export const getAIProvider = (name) => {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Unknown AI provider: ${name}`);
  }
  if (!provider.apiKey) {
    throw new Error(`API key not configured for provider: ${name}`);
  }
  return provider;
};

export const getActiveProvider = () => {
  // Priority order: deepseek > openai > groq > openrouter > nvidia > huggingface > gemini > claude
  const priority = ['deepseek', 'openai', 'groq', 'openrouter', 'nvidia', 'huggingface', 'gemini', 'claude'];
  for (const name of priority) {
    const config = providers[name];
    if (config && config.apiKey) {
      return { name, ...config };
    }
  }
  throw new Error('No AI provider configured. Set at least one API key in environment variables.');
};

export const listProviders = () => {
  return Object.entries(providers).map(([name, config]) => ({
    name,
    configured: !!config.apiKey,
    model: config.model,
  }));
};

export default providers;
