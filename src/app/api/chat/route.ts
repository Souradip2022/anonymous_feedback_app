import {createGoogleGenerativeAI} from '@ai-sdk/google';
import {streamText} from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY
});

const model = google('models/gemini-1.5-pro-latest', {
  topK: 10,
  safetySettings: [{category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH"}],
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const {messages} = await req.json();

  const result = await streamText({
    model: model as any,
    messages,
    temperature: 0.9,
    maxTokens: 500,
    maxRetries: 5,
    frequencyPenalty: 0.3,
    system: "You are a helpful assistant.",
  });

  return result.toAIStreamResponse();
}