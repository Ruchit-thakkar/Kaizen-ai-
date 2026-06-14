import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { parseCookies } from '../shared/utils/cookie.util.js';
import { generateMultiModelStream } from '../features/model/model.service.js';
import Conversation from '../features/conversation/conversation.model.js';
import {
  createConversation,
  renameConversation,
  generateTitle,
  updateConversationModel
} from '../features/conversation/conversation.service.js';
import { saveMessage } from '../features/message/message.service.js';
import { buildContext } from '../features/memory/contextBuilder.service.js';
import { summarizeAndStore, compressConversationContext } from '../features/memory/summarizer.service.js';

// Map to store active AbortControllers per socket connection
const activeConnections = new Map();

export const registerSocketHandler = (io) => {
  // Socket.IO Connection Middleware for JWT verification
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || '';
      const cookies = parseCookies(cookieHeader);
      const token = cookies.token;

      if (!token) {
        return next(new Error('Authentication error: Token is missing. Please log in first.'));
      }

      // Verify and decode JWT token
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded; // Attach user details to socket instance
      next();
    } catch (error) {
      console.error(`Socket auth failed for handshake: ${error.message}`);
      next(new Error('Authentication error: Session is invalid or has expired.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Secure client connected: ${socket.id} (User: ${socket.user.name})`);

    socket.on('send-message', async (data) => {
      let { conversationId, messageText, model, attachment } = data;
      const userId = socket.user.id;

      if ((!messageText || !messageText.trim()) && !attachment) {
        socket.emit('receive-message', { error: 'Message content or attachment is required.' });
        return;
      }

      // If there is already an active generation for this socket, abort it first
      if (activeConnections.has(socket.id)) {
        try {
          activeConnections.get(socket.id).abort();
        } catch (e) {
          console.error('Error aborting previous connection:', e);
        }
        activeConnections.delete(socket.id);
      }

      const controller = new AbortController();
      activeConnections.set(socket.id, controller);

      try {
        let conversation = null;

        // 1. Resolve or Create Conversation
        if (conversationId) {
          conversation = await Conversation.findOne({ _id: conversationId, userId });
          if (!conversation) {
            socket.emit('receive-message', { error: 'Conversation not found or unauthorized.' });
            return;
          }
          // Persist selected model if it changes or is explicitly provided
          if (model && conversation.model !== model) {
            conversation = await updateConversationModel(conversationId, model);
          }
        } else {
          // New conversation creation
          conversation = await createConversation(userId, 'New chat');
          conversationId = conversation._id.toString();
          
          if (model) {
            conversation = await updateConversationModel(conversationId, model);
          }

          // Notify frontend immediately of the new conversation
          socket.emit('conversation-created', {
            conversationId,
            title: 'New chat',
            model: conversation.model
          });

          // Generate a descriptive title asynchronously
          const titleInput = messageText || (attachment ? `Analyzed ${attachment.fileType}` : 'New chat');
          generateTitle(titleInput).then(async (title) => {
            await renameConversation(conversationId, title);
            socket.emit('conversation-updated', {
              conversationId,
              title
            });
          }).catch(err => {
            console.error('Error generating chat title:', err.message);
          });
        }

        // 2. Save incoming user message
        await saveMessage(conversationId, 'user', messageText || '', attachment);

        // 3. Retrieve sliding window history and relevant long-term memory facts
        const { messages, systemInstruction } = await buildContext(userId, conversationId, messageText);

        // 4. Trigger Multi-Model stream generation
        const stream = await generateMultiModelStream(messages, {
          signal: controller.signal,
          modelKey: conversation.model || model || 'gptOss120b',
          systemInstruction,
        });

        let fullResponseText = '';

        // Iterate over stream generator and send chunks
        for await (const chunk of stream) {
          if (controller.signal.aborted) {
            break;
          }
          if (chunk.text) {
            fullResponseText += chunk.text;
            socket.emit('receive-message', { chunk: chunk.text });
          }
        }

        if (!controller.signal.aborted) {
          // 5. Save assistant response to DB
          await saveMessage(conversationId, 'assistant', fullResponseText);

          // 6. Trigger memory summarizer background task to extract user preferences
          summarizeAndStore(userId, messageText, fullResponseText).catch(err => {
            console.error('Error running memory summarizer:', err.message);
          });

          // 7. Trigger conversation summarization for context compression
          compressConversationContext(userId, conversationId).catch(err => {
            console.error('Error running context compressor:', err.message);
          });

          // Notify client generation completed successfully
          socket.emit('receive-message', { done: true });
        }
      } catch (error) {
        if (error.name === 'AbortError' || controller.signal.aborted) {
          console.log(`Generation aborted for client socket: ${socket.id}`);
          socket.emit('receive-message', { done: true, stopped: true });
        } else {
          console.error(`Gemini API Error for client ${socket.id}:`, error);
          socket.emit('receive-message', { error: error.message || 'Failed to generate response. Please try again.' });
        }
      } finally {
        if (activeConnections.get(socket.id) === controller) {
          activeConnections.delete(socket.id);
        }
      }
    });

    socket.on('stop-generation', () => {
      const controller = activeConnections.get(socket.id);
      if (controller) {
        console.log(`Stopping generation for client socket: ${socket.id}`);
        controller.abort();
        activeConnections.delete(socket.id);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Secure client disconnected: ${socket.id} (User: ${socket.user.name})`);
      const controller = activeConnections.get(socket.id);
      if (controller) {
        controller.abort();
        activeConnections.delete(socket.id);
      }
    });
  });
};
