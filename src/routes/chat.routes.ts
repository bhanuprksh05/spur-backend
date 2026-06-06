import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();

// POST /api/chat/message -> Send a message
router.post('/message', ChatController.sendMessage);

// GET /api/chat/history/:sessionId -> Get history for a session
router.get('/history/:sessionId', ChatController.getHistory);

// POST /api/chat/sessions/batch -> Get details for a specific list of session IDs
router.post('/sessions/batch', ChatController.getSessionsBatch);

export default router;
