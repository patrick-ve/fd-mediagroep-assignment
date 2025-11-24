// AI SDK tool definitions for chart generation

import { tool, jsonSchema } from 'ai';
import { ChartEngine } from '../charts/chart-engine';

export function getAgentTools(chartEngine: ChartEngine) {
  return {
    create_bar_chart: tool({
      description: 'Maak een staafgrafiek met de opgegeven data in FD- of BNR-kleuren',
      inputSchema: jsonSchema<{
        labels: string[];
        values: number[];
        title: string;
        unit?: string;
        colorScheme: 'fd' | 'bnr';
      }>({
        type: 'object',
        properties: {
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'X-as labels'
          },
          values: {
            type: 'array',
            items: { type: 'number' },
            description: 'Y-as waarden'
          },
          title: {
            type: 'string',
            description: 'Grafiek titel'
          },
          unit: {
            type: 'string',
            description: 'Meeteenheid'
          },
          colorScheme: {
            type: 'string',
            enum: ['fd', 'bnr'],
            description: 'Kleurenschema (FD of BNR)'
          }
        },
        required: ['labels', 'values', 'title', 'colorScheme'],
        additionalProperties: false
      }),
      execute: async ({ labels, values, title, unit, colorScheme }) => {
        try {
          const result = await chartEngine.createBarChart(
            { labels, values, title, unit, chartType: 'bar' },
            colorScheme
          );
          return { 
            success: true, 
            filePath: result.filePath,
            message: `Staafgrafiek succesvol aangemaakt: ${result.filePath}`
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Onbekende fout'
          };
        }
      }
    }),

    create_line_chart: tool({
      description: 'Maak een lijngrafiek met de opgegeven data in FD- of BNR-kleuren',
      inputSchema: jsonSchema<{
        labels: string[];
        values: number[];
        title: string;
        unit?: string;
        colorScheme: 'fd' | 'bnr';
      }>({
        type: 'object',
        properties: {
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'X-as labels'
          },
          values: {
            type: 'array',
            items: { type: 'number' },
            description: 'Y-as waarden'
          },
          title: {
            type: 'string',
            description: 'Grafiek titel'
          },
          unit: {
            type: 'string',
            description: 'Meeteenheid'
          },
          colorScheme: {
            type: 'string',
            enum: ['fd', 'bnr'],
            description: 'Kleurenschema (FD of BNR)'
          }
        },
        required: ['labels', 'values', 'title', 'colorScheme'],
        additionalProperties: false
      }),
      execute: async ({ labels, values, title, unit, colorScheme }) => {
        try {
          const result = await chartEngine.createLineChart(
            { labels, values, title, unit, chartType: 'line' },
            colorScheme
          );
          return { 
            success: true, 
            filePath: result.filePath,
            message: `Lijngrafiek succesvol aangemaakt: ${result.filePath}`
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Onbekende fout'
          };
        }
      }
    })
  };
}
