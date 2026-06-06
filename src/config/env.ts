import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'openai',
};

// Validate essential variables
if (!env.DATABASE_URL) {
  console.warn('Warning: DATABASE_URL is not set in environment variables.');
}

if (!env.OPENAI_API_KEY && env.LLM_PROVIDER === 'openai') {
  console.warn('Warning: OPENAI_API_KEY is not set in environment variables.');
}

if (!env.ANTHROPIC_API_KEY && env.LLM_PROVIDER === 'claude') {
  console.warn('Warning: ANTHROPIC_API_KEY is not set in environment variables.');
}
