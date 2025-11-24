// API route for chat interactions using AI SDK UI pattern

import { openai } from '@ai-sdk/openai';
import { streamText, stepCountIs, convertToModelMessages } from 'ai';
import { getAgentTools } from '@/features/agent/tools';
import { getSystemPrompt } from '@/features/agent/prompts';
import { ChartEngine } from '@/features/charts/chart-engine';

const chartEngine = new ChartEngine('./public/charts');

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: openai('gpt-5'),
    system: getSystemPrompt(),
    messages: convertToModelMessages(messages),
    tools: getAgentTools(chartEngine),
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
