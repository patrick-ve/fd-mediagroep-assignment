// API route for chat interactions using AI SDK UI pattern

import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { getAgentTools } from '@/features/agent/tools';
import { getSystemPrompt } from '@/features/agent/prompts';
import { ChartEngine } from '@/features/charts/chart-engine';
import { ExcelParser } from '@/features/parsers/excel-parser';

const chartEngine = new ChartEngine('./public/charts');
const excelParser = new ExcelParser();

// Excel MIME types
const EXCEL_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
];

function isExcelMimeType(mimeType: string | undefined): boolean {
  return !!mimeType && EXCEL_MIME_TYPES.includes(mimeType);
}

// Process messages to extract and parse Excel file attachments
async function processExcelAttachments(messages: UIMessage[]): Promise<UIMessage[]> {
  return Promise.all(
    messages.map(async (message) => {
      if (message.role !== 'user' || !message.parts) return message;

      // Find Excel file parts
      const fileParts = message.parts.filter(
        (part): part is { type: 'file'; mediaType: string; url: string; filename?: string } =>
          part.type === 'file' && isExcelMimeType((part as any).mediaType)
      );

      if (fileParts.length === 0) return message;

      // Parse Excel files
      const excelDataResults = await Promise.all(
        fileParts.map(async (part) => {
          try {
            // Extract base64 data from data URL
            const base64Data = part.url.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            return await excelParser.parseExcelBuffer(buffer);
          } catch (error) {
            console.error('Error parsing Excel file:', error);
            return null;
          }
        })
      );

      // Filter out failed parses
      const excelData = excelDataResults.filter((d) => d !== null);

      if (excelData.length === 0) return message;

      // Create structured text from Excel data
      const dataText = excelData
        .map(
          (d) =>
            `<excel_data>
  <title>${d.title}</title>
  <labels>${JSON.stringify(d.labels)}</labels>
  <values>${JSON.stringify(d.values)}</values>
</excel_data>`
        )
        .join('\n');

      // Get existing text parts
      const textParts = message.parts.filter((p) => p.type === 'text');
      const existingText = textParts.map((p) => (p as { text: string }).text).join('\n');

      // Combine Excel data with existing text
      const combinedText = dataText + (existingText ? '\n\n' + existingText : '');

      return {
        ...message,
        parts: [{ type: 'text' as const, text: combinedText }],
      };
    })
  );
}

export async function POST(request: Request) {
  const { messages } = await request.json();

  // Process Excel attachments before sending to AI
  const processedMessages = await processExcelAttachments(messages);

  const result = streamText({
    model: openai('gpt-5'),
    system: getSystemPrompt(),
    messages: convertToModelMessages(processedMessages),
    tools: getAgentTools(chartEngine),
  });

  return result.toUIMessageStreamResponse();
}
