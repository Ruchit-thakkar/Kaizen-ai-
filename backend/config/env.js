import dotenv from 'dotenv';
dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/kaizen-ai',
  JWT_SECRET: process.env.JWT_SECRET || 'kaizen_ai_super_secret_jwt_key_2026',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || ''
};

// Safety validations
if (process.env.NODE_ENV === 'production') {
  if (env.JWT_SECRET === 'kaizen_ai_super_secret_jwt_key_2026') {
    console.warn('WARNING: Using default JWT_SECRET in production. Change it immediately!');
  }
  if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY must be provided in production.');
  }
}

export default env;
