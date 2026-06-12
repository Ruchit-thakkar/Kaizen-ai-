import {
  listConversations,
  createConversation,
  renameConversation,
  deleteConversation,
  updateConversationModel
} from './conversation.service.js';

/**
 * Get all conversations for the logged-in user.
 */
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await listConversations(userId);
    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new conversation.
 */
export const addConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;
    const conversation = await createConversation(userId, title);
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

/**
 * Rename a conversation.
 */
export const updateConversationTitle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    const conversation = await renameConversation(id, title);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a conversation.
 */
export const removeConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await deleteConversation(id);

    if (!success) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    res.status(200).json({ success: true, message: 'Conversation deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Update selected model for conversation.
 */
export const updateModel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { model } = req.body;

    if (!model || !model.trim()) {
      return res.status(400).json({ success: false, message: 'Model identifier is required.' });
    }

    const conversation = await updateConversationModel(id, model);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

