import { getConversationMessages } from './message.service.js';
import Conversation from '../conversation/conversation.model.js';

/**
 * Retrieve messages for a given conversation, ensuring proper authorization.
 */
export const getHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify conversation exists and belongs to this user
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    if (conversation.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied to this conversation.' });
    }

    const messages = await getConversationMessages(conversationId);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};
