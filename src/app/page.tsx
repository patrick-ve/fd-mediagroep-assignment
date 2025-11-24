'use client';

// Main page for Chart Agent MVP

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ChatInterface } from '@/features/ui/ChatInterface';
import { FileUpload } from '@/features/ui/FileUpload';
import { ChartData, ColorScheme } from '@/lib/types';

export default function Home() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('fd');
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const isLoading = status !== 'ready';

  const handleFileProcessed = async (data: ChartData) => {
    const message = `Ik heb een Excel-bestand geüpload met de volgende data: ${JSON.stringify(data)}. Maak hier een ${data.chartType} grafiek van met de titel "${data.title}".`;

    sendMessage({ text: message });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage({ text: input });
    setInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
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
        <div className="w-full border-r bg-white flex flex-col">
          <FileUpload onFileProcessed={handleFileProcessed} />
          <ChatInterface
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            colorScheme={colorScheme}
          />
        </div>
      </div>
    </div>
  );
}
