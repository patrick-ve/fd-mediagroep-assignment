'use client';

// Chat interface component with tool parts rendering

import { UIMessage } from 'ai';
import { ChartDisplay } from './ChartDisplay';

interface ChatInterfaceProps {
  messages: UIMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInterface({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading
}: ChatInterfaceProps) {

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      return <p key={idx} className="whitespace-pre-wrap">{part.text}</p>;
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

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Typ je bericht..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Verstuur
          </button>
        </div>
      </form>
    </div>
  );
}
