// AI SDK tool definitions for chart generation

import { tool, jsonSchema } from 'ai';
import { ChartEngine } from '../charts/chart-engine';

export function getAgentTools(chartEngine: ChartEngine, saveToDisk: boolean = true) {
  // For CLI mode, use different tools with terminal-specific descriptions
  if (!saveToDisk) {
    return getCLITools(chartEngine);
  }

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
            colorScheme,
            saveToDisk
          );
          return {
            labels,
            values,
            title,
            unit,
            chartType: 'bar' as const,
            colorScheme,
            filePath: result.filePath,
            echartsOptions: result.echartsOptions
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Onbekende fout');
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
            colorScheme,
            saveToDisk
          );
          return {
            labels,
            values,
            title,
            unit,
            chartType: 'line' as const,
            colorScheme,
            filePath: result.filePath,
            echartsOptions: result.echartsOptions
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Onbekende fout');
        }
      }
    })
  };
}

// CLI-specific tools that render charts in the terminal
function getCLITools(chartEngine: ChartEngine) {
  return {
    create_bar_chart_cli: tool({
      description: 'Maak een staafgrafiek die in de CLI/terminal wordt getoond met ASCII karakters. Gebruikt FD- of BNR-kleuren (alleen voor metadata).',
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
          // Don't save to disk for CLI
          const result = await chartEngine.createBarChart(
            { labels, values, title, unit, chartType: 'bar' },
            colorScheme,
            false
          );
          return {
            labels,
            values,
            title,
            unit,
            chartType: 'bar' as const,
            colorScheme,
            filePath: result.filePath,
            echartsOptions: result.echartsOptions
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Onbekende fout');
        }
      }
    }),

    create_line_chart_cli: tool({
      description: 'Maak een lijngrafiek die in de CLI/terminal wordt getoond met ASCII karakters. Gebruikt FD- of BNR-kleuren (alleen voor metadata).',
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
          // Don't save to disk for CLI
          const result = await chartEngine.createLineChart(
            { labels, values, title, unit, chartType: 'line' },
            colorScheme,
            false
          );
          return {
            labels,
            values,
            title,
            unit,
            chartType: 'line' as const,
            colorScheme,
            filePath: result.filePath,
            echartsOptions: result.echartsOptions
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Onbekende fout');
        }
      }
    })
  };
}
