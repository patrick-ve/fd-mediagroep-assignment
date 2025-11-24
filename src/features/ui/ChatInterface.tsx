'use client';

// Chat interface component with tool parts rendering

import { RefObject } from 'react';
import { UIMessage } from 'ai';
import { ChartDisplay } from './ChartDisplay';

interface ChatInterfaceProps {
  messages: UIMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  files?: FileList;
  fileError?: string | null;
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearFiles: () => void;
}

// Helper to get filename from FileList
function getFileNames(files: FileList | undefined): string[] {
  if (!files) return [];
  return Array.from(files).map((f) => f.name);
}

export function ChatInterface({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  files,
  fileError,
  fileInputRef,
  handleFileChange,
  clearFiles,
}: ChatInterfaceProps) {
  const fileNames = getFileNames(files);
  const hasFiles = fileNames.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-semibold mb-2">Welkom bij Chart Agent MVP!</p>
            <p>Ik kan staaf- en lijngrafieken maken in FD- of BNR-kleuren.</p>
            <p className="mt-2 text-sm">Probeer bijvoorbeeld:</p>
            <ul className="mt-2 text-sm text-left max-w-md mx-auto">
              <li>• "Maak een staafgrafiek met verkoopcijfers Q1=100, Q2=150, Q3=175, Q4=200"</li>
              <li>• "Laat me een lijngrafiek zien van de groei: Jan=10, Feb=15, Mrt=20"</li>
              <li>• Upload een Excel-bestand met data</li>
            </ul>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="space-y-4">
            {/* User message */}
            {message.role === 'user' && (
              <div className="flex justify-end">
                <div className="max-w-[70%] rounded-lg px-4 py-2 bg-blue-500 text-white">
                  {message.parts?.map((part, idx) => {
                    if (part.type === 'text') {
                      // Don't show the excel_data XML tags to the user
                      const displayText = part.text.replace(/<excel_data>[\s\S]*?<\/excel_data>\s*/g, '').trim();
                      if (!displayText) return null;
                      return <p key={idx} className="whitespace-pre-wrap">{displayText}</p>;
                    }
                    if (part.type === 'file') {
                      const filePart = part as { type: 'file'; filename?: string; mediaType?: string };
                      return (
                        <div key={idx} className="flex items-center gap-2 text-sm bg-blue-600 rounded px-2 py-1 mt-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{filePart.filename || 'Excel bestand'}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Assistant message with parts */}
            {message.role === 'assistant' && (
              <div className="space-y-4">
                {message.parts?.map((part, index) => {
                  // Text part
                  if (part.type === 'text') {
                    return (
                      <div key={index} className="flex justify-start">
                        <div className="max-w-[70%] rounded-lg px-4 py-2 bg-gray-200 text-gray-900">
                          <p className="whitespace-pre-wrap">{part.text}</p>
                        </div>
                      </div>
                    );
                  }

                  // Bar chart tool
                  if (part.type === 'tool-create_bar_chart') {
                    if (part.state === 'input-available') {
                      return (
                        <div key={index} className="flex justify-start">
                          <div className="rounded-lg px-4 py-2 bg-yellow-100 text-yellow-900">
                            <p>Staafgrafiek aan het maken...</p>
                          </div>
                        </div>
                      );
                    }
                    if (part.state === 'output-available' && part.output) {
                      const output = part.output as any;
                      return (
                        <div key={index} className="w-full">
                          <ChartDisplay data={output} colorScheme={output.colorScheme} />
                        </div>
                      );
                    }
                  }

                  // Line chart tool
                  if (part.type === 'tool-create_line_chart') {
                    if (part.state === 'input-available') {
                      return (
                        <div key={index} className="flex justify-start">
                          <div className="rounded-lg px-4 py-2 bg-yellow-100 text-yellow-900">
                            <p>Lijngrafiek aan het maken...</p>
                          </div>
                        </div>
                      );
                    }
                    if (part.state === 'output-available' && part.output) {
                      const output = part.output as any;
                      return (
                        <div key={index} className="w-full">
                          <ChartDisplay data={output} colorScheme={output.colorScheme} />
                        </div>
                      );
                    }
                  }

                  return null;
                })}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 rounded-lg px-4 py-2">
              <p>Aan het verwerken...</p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="max-w-3xl mx-auto">
        {/* File attachment preview */}
        {hasFiles && (
          <div className="mb-2 flex flex-wrap gap-2">
            {fileNames.map((name, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1 text-sm text-gray-700"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{name}</span>
                <button
                  type="button"
                  onClick={clearFiles}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* File error */}
        {fileError && (
          <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {fileError}
          </div>
        )}

        <div className="flex gap-2">
          {/* File upload button */}
          <label className="flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isLoading}
              ref={fileInputRef}
            />
          </label>

          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={hasFiles ? "Voeg een bericht toe (optioneel)..." : "Typ je bericht..."}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !hasFiles)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Verstuur
          </button>
        </div>
        </div>
      </form>
    </div>
  );
}
