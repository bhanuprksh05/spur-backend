import prisma from '../config/db';

export class RateLimiter {
  /**
   * Checks if a session has exceeded the message rate limit.
   * @param sessionId The active chat session ID
   * @param limit The maximum number of user messages allowed in the window
   * @param windowSeconds The time window in seconds
   * @throws Error if the limit is exceeded
   */
  static async checkLimit(sessionId: string, limit: number, windowSeconds: number): Promise<void> {
    const windowStart = new Date(Date.now() - windowSeconds * 1000);

    const messageCount = await prisma.message.count({
      where: {
        chatSessionId: sessionId,
        role: 'user',
        createdAt: {
          gte: windowStart,
        },
      },
    });

    if (messageCount >= limit) {
      throw new Error(`Rate limit exceeded. Maximum ${limit} messages per ${windowSeconds} seconds allowed.`);
    }
  }
}
