import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import {
  getConversations,
  addConversation,
  updateConversationTitle,
  removeConversation,
  updateModel
} from './conversation.controller.js';

const router = express.Router();

// All conversation routes are protected by JWT session verification
router.use(protect);

router.route('/')
  .get(getConversations)
  .post(addConversation);

router.route('/:id')
  .put(updateConversationTitle)
  .delete(removeConversation);

router.route('/:id/model')
  .put(updateModel);

export default router;
