import { Router, Request, Response } from 'express';
import chatRoutes from './chat.routes';

const router = Router();

// Health Check Route
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Example API Route
router.get('/api/v1', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the API v1',
  });
});

// Mount Chat Routes under /api/chat
router.use('/api/chat', chatRoutes);

export default router;

