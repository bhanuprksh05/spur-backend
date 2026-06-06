import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';

export class ChatController {
  /**
   * Handle sending a new message.
   * Expects { content, sessionId? } in the request body.
   */
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { content, sessionId } = req.body;

      if (!content) {
        res.status(400).json({ error: 'Message content is required.' });
        return;
      }

      if (content.length > 1000) {
        res.status(400).json({ error: 'Message content exceeds the maximum limit of 1000 characters.' });
        return;
      }

      const result = await ChatService.sendMessage(content, sessionId);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in sendMessage controller:', error);
      res.status(500).json({ error: error.message || 'Internal server error.' });
    }
  }

  /**
   * Fetch chat history for a specific session.
   * Expects sessionId as a URL parameter, and optional cursor & limit as query parameters.
   */
  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { cursor, limit } = req.query;

      if (!sessionId) {
        res.status(400).json({ error: 'sessionId is required in URL parameters.' });
        return;
      }

      const parsedLimit = limit ? parseInt(limit as string, 10) : 20;

      const history = await ChatService.getHistory(
        sessionId as string,
        cursor ? (cursor as string) : undefined,
        parsedLimit
      );
      res.status(200).json({ sessionId, history });
    } catch (error: any) {
      console.error('Error in getHistory controller:', error);
      res.status(500).json({ error: error.message || 'Internal server error.' });
    }
  }

  /**
   * Fetch details for a specific batch of session IDs.
   * Expects { sessionIds: string[] } in the request body.
   */
  static async getSessionsBatch(req: Request, res: Response): Promise<void> {
    try {
      const { sessionIds } = req.body;

      if (!sessionIds || !Array.isArray(sessionIds)) {
        res.status(400).json({ error: 'sessionIds must be an array of strings in the request body.' });
        return;
      }

      const sessions = await ChatService.getSessionsBatch(sessionIds);
      res.status(200).json({ sessions });
    } catch (error: any) {
      console.error('Error in getSessionsBatch controller:', error);
      res.status(500).json({ error: error.message || 'Internal server error.' });
    }
  }
}
