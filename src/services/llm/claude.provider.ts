import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { ILLMProvider, MessageInput } from './llm.interface';

export class ClaudeProvider implements ILLMProvider {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }

  async generateResponse(chatMessages: MessageInput[], systemMessage: MessageInput): Promise<string> {
    try {


      const response = await this.anthropic.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 500,
        system: systemMessage.content,
        messages: chatMessages,
      });

      const firstContent = response.content[0];
      if (firstContent && firstContent.type === 'text') {
        return firstContent.text;
      }

      return 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Claude Error:', error);
      throw new Error('Failed to generate response from Claude.');
    }
  }
}
