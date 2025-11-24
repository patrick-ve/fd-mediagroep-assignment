'use client';

// Main page for Chart Agent MVP

import { useState } from 'react';
import { ChatInterface } from '@/features/ui/ChatInterface';
import { ChartDisplay } from '@/features/ui/ChartDisplay';
import { FileUpload } from '@/features/ui/FileUpload';
import { ConversationMessage, ChartData, ColorScheme } from '@/lib/types';

export default function Home() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChart, setCurrentChart] = useState<ChartData | null>(null);
  const [colorScheme, setColorScheme] = useState<ColorScheme>('fd');

  const handleSendMessage = async (message: string) => {
    setIsLoading(true);

    // Add user message
    const userMessage: ConversationMessage = {
      role: 'user',
      content: message
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          conversationHistory: messages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij verwerken');
      }

      // Add assistant message
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: data.message
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update chart if available
      if (data.chartData) {
        setCurrentChart(data.chartData);
      }
    } catch (error) {
      const errorMessage: ConversationMessage = {
        role: 'assistant',
        content: `Fout: ${error instanceof Error ? error.message : 'Onbekende fout'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileProcessed = async (data: ChartData) => {
    const message = `Ik heb een Excel-bestand geüpload met de volgende data: ${data.labels.length} datapunten. Maak hier een grafiek van.`;
    
    // Add user message about file upload
    const userMessage: ConversationMessage = {
      role: 'user',
      content: message
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to agent with Excel data
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          conversationHistory: messages,
          excelData: JSON.stringify(data)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fout bij verwerken');
      }

      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: result.message
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (result.chartData) {
        setCurrentChart(result.chartData);
      }
    } catch (error) {
      const errorMessage: ConversationMessage = {
        role: 'assistant',
        content: `Fout: ${error instanceof Error ? error.message : 'Onbekende fout'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chart Agent MVP</h1>
              <p className="text-sm text-gray-600">FD Mediagroep - Grafiek Generatie Agent</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setColorScheme('fd')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  colorScheme === 'fd'
                    ? 'bg-[#379596] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                FD Kleuren
              </button>
              <button
                onClick={() => setColorScheme('bnr')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  colorScheme === 'bnr'
                    ? 'bg-[#ffd200] text-black'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                BNR Kleuren
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="w-1/2 border-r bg-white flex flex-col">
          <FileUpload onFileProcessed={handleFileProcessed} />
          <ChatInterface
            onSendMessage={handleSendMessage}
            messages={messages}
            isLoading={isLoading}
          />
        </div>

        {/* Chart Panel */}
        <div className="w-1/2 bg-gray-50 overflow-auto">
          {currentChart ? (
            <ChartDisplay data={currentChart} colorScheme={colorScheme} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <svg
                  className="w-24 h-24 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-lg">Geen grafiek om weer te geven</p>
                <p className="text-sm mt-2">Vraag om een grafiek in de chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
