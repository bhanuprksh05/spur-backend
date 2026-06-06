import OpenAI from 'openai';
import { env } from '../../config/env';
import { ILLMProvider, MessageInput } from './llm.interface';

export class OpenAIProvider implements ILLMProvider {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async generateResponse(chatMessages: MessageInput[], systemMessage: MessageInput): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // or another preferred model
        messages: [systemMessage, ...chatMessages],
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new Error('Failed to generate response from OpenAI.');
    }
  }
}
