import OpenAI from 'openai';

// Create OpenAI instance with API key from environment variable
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? process.env.LLM_API_KEY,
});