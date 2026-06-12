import { useEffect, useState, useRef, useCallback } from 'react';
import { socket } from '../services/socket';
import api from '../services/api';

export const useSocket = () => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [error, setError] = useState(null);
  const [defaultModel, setDefaultModel] = useState('deepseekFlash');

  // Change conversation model or default model
  const changeConversationModel = useCallback(async (id, model) => {
    if (!id) {
      setDefaultModel(model);
      return;
    }
    try {
      const res = await api.put(`/conversations/${id}/model`, { model });
      if (res.data.success) {
        setConversations((prev) =>
          prev.map((c) => (c._id === id ? { ...c, model: res.data.data.model } : c))
        );
      }
    } catch (err) {
      console.error('Error changing conversation model:', err);
      setError('Failed to update conversation model.');
    }
  }, []);

  // Fetch all conversations from backend REST API
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/conversations');
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversation list.');
    }
  }, []);

  // Fetch message history for a specific conversation
  const fetchHistory = useCallback(async (conversationId) => {
    try {
      setError(null);
      const res = await api.get(`/messages/conversation/${conversationId}`);
      if (res.data.success) {
        const history = res.data.data.map((msg) => ({
          id: msg._id,
          role: msg.role,
          content: msg.content
        }));
        setMessages(history);
      }
    } catch (err) {
      console.error('Error fetching message history:', err);
      setError('Failed to load message history.');
    }
  }, []);

  // Set active conversation and load its history
  const selectConversation = useCallback((conversationId) => {
    setActiveConversationId(conversationId);
    if (conversationId) {
      fetchHistory(conversationId);
    } else {
      setMessages([]);
    }
  }, [fetchHistory]);

  // Rename a conversation
  const renameConversation = useCallback(async (id, title) => {
    try {
      const res = await api.put(`/conversations/${id}`, { title });
      if (res.data.success) {
        setConversations((prev) =>
          prev.map((c) => (c._id === id ? { ...c, title: res.data.data.title } : c))
        );
      }
    } catch (err) {
      console.error('Error renaming conversation:', err);
      setError('Failed to rename conversation.');
    }
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (id) => {
    try {
      const res = await api.delete(`/conversations/${id}`);
      if (res.data.success) {
        setConversations((prev) => prev.filter((c) => c._id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation.');
    }
  }, [activeConversationId]);

  // Initialize/refresh lists on connection
  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Listen for streaming chunks and lifecycle updates
    socket.on('receive-message', (data) => {
      const { chunk, done, stopped, error: streamError } = data;

      if (streamError) {
        setError(streamError);
        setIsGenerating(false);
        // Remove assistant placeholder in case of error
        setMessages((prev) => {
          if (prev.length > 0 && prev[prev.length - 1].role === 'assistant' && prev[prev.length - 1].content === '') {
            return prev.slice(0, -1);
          }
          return prev;
        });
        return;
      }

      if (chunk) {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: lastMsg.content + chunk
            };
          } else {
            updated.push({
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: chunk
            });
          }
          return updated;
        });
      }

      if (done) {
        setIsGenerating(false);
      }
    });

    // Listen for title / conversation creation events from backend
    socket.on('conversation-created', (data) => {
      const { conversationId, title, model } = data;
      setActiveConversationId(conversationId);
      setConversations((prev) => {
        // Add if not already present
        if (!prev.some((c) => c._id === conversationId)) {
          return [{ _id: conversationId, title, model: model || 'deepseekFlash', updatedAt: new Date() }, ...prev];
        }
        return prev;
      });
    });

    socket.on('conversation-updated', (data) => {
      const { conversationId, title } = data;
      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? { ...c, title } : c))
      );
    });

    if (!socket.connected) {
      socket.connect();
    }

    // Load conversation list initially
    fetchConversations();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive-message');
      socket.off('conversation-created');
      socket.off('conversation-updated');
    };
  }, [fetchConversations]);

  const sendMessage = useCallback((text) => {
    if (!text.trim() || isGenerating) return;

    setError(null);
    setIsGenerating(true);

    const activeConv = conversations.find(c => c._id === activeConversationId);
    const currentModel = activeConv?.model || defaultModel;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text
    };

    const assistantPlaceholder = {
      id: `assistant-${Date.now() + 1}`,
      role: 'assistant',
      content: ''
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);

    socket.emit('send-message', {
      conversationId: activeConversationId,
      messageText: text,
      model: currentModel
    });
  }, [activeConversationId, conversations, defaultModel, isGenerating]);

  const stopGeneration = useCallback(() => {
    socket.emit('stop-generation');
    setIsGenerating(false);
  }, []);

  const regenerateResponse = useCallback(() => {
    if (messages.length < 2 || isGenerating) return;
    setError(null);
    setIsGenerating(true);

    // Locate last user message
    let lastUserMessage = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessage = messages[i];
        break;
      }
    }

    if (!lastUserMessage) {
      setIsGenerating(false);
      return;
    }

    const activeConv = conversations.find(c => c._id === activeConversationId);
    const currentModel = activeConv?.model || defaultModel;

    // Keep messages history up to the last user message, append placeholder
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === lastUserMessage.id);
      if (idx !== -1) {
        return [
          ...prev.slice(0, idx + 1),
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: ''
          }
        ];
      }
      return prev;
    });

    socket.emit('send-message', {
      conversationId: activeConversationId,
      messageText: lastUserMessage.content,
      model: currentModel
    });
  }, [messages, activeConversationId, conversations, defaultModel, isGenerating]);

  const clearChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setIsGenerating(false);
    setError(null);
  }, []);

  const activeConversation = conversations.find((c) => c._id === activeConversationId);
  const activeModel = activeConversation ? (activeConversation.model || 'deepseekFlash') : defaultModel;

  return {
    messages,
    conversations,
    activeConversationId,
    isGenerating,
    isConnected,
    error,
    sendMessage,
    stopGeneration,
    regenerateResponse,
    clearChat,
    selectConversation,
    renameConversation,
    deleteConversation,
    fetchConversations,
    activeModel,
    defaultModel,
    setDefaultModel,
    changeConversationModel
  };
};
