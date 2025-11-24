'use client';

// Main page for Chart Agent MVP

import { useState, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ChatInterface } from '@/features/ui/ChatInterface';

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function Home() {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const isLoading = status !== 'ready';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    setFileError(null);

    if (!selectedFiles || selectedFiles.length === 0) {
      setFiles(undefined);
      return;
    }

    // Validate file size
    for (const file of Array.from(selectedFiles)) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError('Bestand is te groot. Maximale grootte is 10MB');
        setFiles(undefined);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }

    setFiles(selectedFiles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Must have either input text or files
    if (!input.trim() && !files) return;

    // Build message text
    const messageText = input.trim() || 'Maak een grafiek van dit Excel-bestand.';

    // Send message with files attached
    sendMessage({
      text: messageText,
      files,
    });

    // Clear form
    setInput('');
    setFiles(undefined);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const clearFiles = () => {
    setFiles(undefined);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Chart Agent MVP</h1>
          <p className="text-sm text-gray-600">FD Mediagroep - Grafiek Generatie Agent</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="w-full border-r bg-white flex flex-col">
          <ChatInterface
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            files={files}
            fileError={fileError}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            clearFiles={clearFiles}
          />
        </div>
      </div>
    </div>
  );
}
