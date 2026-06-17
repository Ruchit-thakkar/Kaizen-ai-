import env from './env.js';

const allowedOrigins = [
  env.CLIENT_URL,
  env.BACKEND_URL,
  'https://kaizen-ai-yj4p.onrender.com'
];

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow same-origin requests (origin is undefined) or requests from allowed origins
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};
