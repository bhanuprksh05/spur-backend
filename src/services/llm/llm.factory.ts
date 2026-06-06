import { env } from '../../config/env';
import { ILLMProvider } from './llm.interface';
import { OpenAIProvider } from './openai.provider';
import { ClaudeProvider } from './claude.provider';

export class LLMFactory {
  static getProvider(providerName?: string): ILLMProvider {
    const selectedProvider = providerName || env.LLM_PROVIDER;
    switch (selectedProvider) {
      case 'openai':
        return new OpenAIProvider();
      case 'claude':
        return new ClaudeProvider();
      default:
        console.warn(`Provider ${selectedProvider} not found, falling back to OpenAI.`);
        return new OpenAIProvider();
    }
  }
}
