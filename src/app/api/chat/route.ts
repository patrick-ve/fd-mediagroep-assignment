// API route for chat interactions

import { NextRequest, NextResponse } from 'next/server';
import { processAgentRequest } from '@/features/agent/agent-core';
import { ChartEngine } from '@/features/charts/chart-engine';
import { ConversationMessage } from '@/lib/types';

const chartEngine = new ChartEngine('./public/charts');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Bericht is verplicht' },
        { status: 400 }
      );
    }

    const response = await processAgentRequest(
      message,
      conversationHistory as ConversationMessage[],
      chartEngine
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Er is een fout opgetreden bij het verwerken van je verzoek',
        details: error instanceof Error ? error.message : 'Onbekende fout'
      },
      { status: 500 }
    );
  }
}
