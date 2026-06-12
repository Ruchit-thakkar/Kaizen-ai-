import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { registerSocketHandler } from './socket/socketHandler.js';
import env from './config/env.js';

const server = http.createServer(app);

// Attach Socket.IO with credentials CORS rules
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Bootstrapping function
const bootstrap = async () => {
  // Connect to MongoDB
  await connectDB();

  // Attach WebSocket handlers
  registerSocketHandler(io);

  // Start HTTP Server
  server.listen(env.PORT, () => {
    console.log(`===============================================`);
    console.log(` Kaizen AI Backend Server started on port ${env.PORT}`);
    console.log(` Accepting client connections from: ${env.CLIENT_URL}`);
    console.log(`===============================================`);
  });
};

bootstrap();
