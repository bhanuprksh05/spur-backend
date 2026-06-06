export interface MessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ILLMProvider {
  /**
   * Generate a response from the LLM based on a conversation history.
   * @param chatMessages The array of previous messages in the conversation.
   * @param systemMessage The system message to be included in the conversation.
   * @returns The generated string response from the LLM.
   */
  generateResponse(chatMessages: MessageInput[], systemMessage: MessageInput): Promise<string>;
}
