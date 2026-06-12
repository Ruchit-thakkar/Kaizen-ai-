import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { errorHandler } from './middleware/error.middleware.js';

// Import Feature Routers
import authRoutes from './features/auth/auth.routes.js';
import userRoutes from './features/user/user.routes.js';
import aiRoutes from './features/ai/ai.routes.js';
import conversationRoutes from './features/conversation/conversation.routes.js';
import messageRoutes from './features/message/message.routes.js';
import memoryRoutes from './features/memory/memory.routes.js';
import modelRoutes from './features/model/model.routes.js';

const app = express();

// Enable credentials CORS, JSON parsers, and cookie parsers
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Mount feature-based API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/models', modelRoutes);

// API Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Kaizen AI Secure Backend is active.' });
});

// Register global error middleware (must be registered last)
app.use(errorHandler);

export default app;
