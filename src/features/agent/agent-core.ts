// Core agent logic using Vercel AI SDK

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { getAgentTools } from './tools';
import { getSystemPrompt, getUserMessageTemplate } from './prompts';
import { ChartEngine } from '../charts/chart-engine';
import { AgentResponse, ConversationMessage } from '@/lib/types';

export async function processAgentRequest(
  userMessage: string,
  conversationHistory: ConversationMessage[],
  chartEngine: ChartEngine,
  excelData?: string
): Promise<AgentResponse> {
  try {
    const formattedMessage = getUserMessageTemplate(userMessage, excelData);

    const result = await generateText({
      model: openai('gpt-5'),
      messages: [
        { role: 'system', content: getSystemPrompt() },
        ...conversationHistory,
        { role: 'user', content: formattedMessage }
      ],
      tools: getAgentTools(chartEngine),
      maxSteps: 5
    });
    
    // Extract chart path from tool results if available
    let chartPath: string | undefined;
    if (result.toolResults && result.toolResults.length > 0) {
      const lastResult = result.toolResults[result.toolResults.length - 1];
      if (lastResult.result && typeof lastResult.result === 'object') {
        const resultObj = lastResult.result as any;
        chartPath = resultObj.filePath;
      }
    }
    
    return {
      message: result.text,
      chartPath,
      success: true
    };
  } catch (error) {
    console.error('Agent error:', error);
    return {
      message: 'Er is een fout opgetreden bij het verwerken van je verzoek.',
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout'
    };
  }
}
