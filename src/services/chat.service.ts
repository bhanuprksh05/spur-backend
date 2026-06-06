import prisma from '../config/db';
import { helper } from '../utils/helper';
import { LLMFactory } from './llm/llm.factory';
import { MessageInput } from './llm/llm.interface';
import { RateLimiter } from '../utils/rateLimiter';

export class ChatService {
  /**
   * Send a message to an existing or new chat session.
   * @param sessionId Optional ID of an existing chat session. If not provided, a new session is created.
   * @param content The user's message content.
   * @returns The assistant's response and the sessionId.
   */
  static async sendMessage(content: string, sessionId?: string) {
    let currentSessionId = sessionId;

    // 1. Ensure a chat session exists
    if (!currentSessionId) {
      const newSession = await prisma.chatSession.create({ data: {} });
      currentSessionId = newSession.id;
    } else {
      // Verify session exists
      const session = await prisma.chatSession.findUnique({ where: { id: currentSessionId } });
      if (!session) {
        throw new Error('Chat session not found');
      }

      // Check rate limit on existing session
      const limitCount = process.env.CHAT_RATE_LIMIT_COUNT ? parseInt(process.env.CHAT_RATE_LIMIT_COUNT, 10) : 5;
      const windowSeconds = process.env.CHAT_RATE_LIMIT_WINDOW_SECONDS ? parseInt(process.env.CHAT_RATE_LIMIT_WINDOW_SECONDS, 10) : 15;
      await RateLimiter.checkLimit(currentSessionId, limitCount, windowSeconds);
    }

    // 2. Save user's message to the database
    await prisma.message.create({
      data: {
        chatSessionId: currentSessionId,
        role: 'user',
        content,
      },
    });

    // 3. Fetch full conversation history for LLM (in ascending order)
    const history = await prisma.message.findMany({
      where: { chatSessionId: currentSessionId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const orderedHistory = history.reverse();

    // Map Prisma history to LLM MessageInput
    const messagesForLLM: MessageInput[] = orderedHistory.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    // 4. Get response from the configured LLM provider
    const llmProvider = LLMFactory.getProvider();
    const systemMessage = helper.systemMessage('Customer Support')
    const assistantResponse = await llmProvider.generateResponse(messagesForLLM, systemMessage);

    // 5. Save the assistant's response to the database
    const savedAssistantMsg = await prisma.message.create({
      data: {
        chatSessionId: currentSessionId,
        role: 'assistant',
        content: assistantResponse,
      },
    });

    // 6. Update the session's updatedAt timestamp so sorting works correctly
    await prisma.chatSession.update({
      where: { id: currentSessionId },
      data: { updatedAt: new Date() },
    });

    return {
      sessionId: currentSessionId,
      message: savedAssistantMsg,
    };
  }

  /**
   * Fetch all messages for a given chat session, with cursor-based pagination.
   */
  static async getHistory(sessionId: string, cursor?: string, limit: number = 20) {
    const queryOptions: any = {
      where: { chatSessionId: sessionId },
      orderBy: { createdAt: 'desc' }, // Get newest first for pagination
      take: limit,
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1; // Skip the cursor message itself
    }

    const messages = await prisma.message.findMany(queryOptions);

    // Return in chronological order
    return messages.reverse();
  }

  /**
   * Fetch details for a specific batch of session IDs.
   */
  static async getSessionsBatch(sessionIds: string[]) {
    if (!sessionIds || sessionIds.length === 0) {
      return [];
    }

    const sessions = await prisma.chatSession.findMany({
      where: {
        id: { in: sessionIds },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Only get the latest message for preview
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return sessions;
  }
}
