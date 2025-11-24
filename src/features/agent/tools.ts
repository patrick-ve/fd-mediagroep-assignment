// AI SDK tool definitions for chart generation

import { tool } from 'ai';
import { z } from 'zod';
import { ChartEngine } from '../charts/chart-engine';

export function getAgentTools(chartEngine: ChartEngine) {
  return {
    create_bar_chart: tool({
      description: 'Maak een staafgrafiek met de opgegeven data in FD- of BNR-kleuren',
      parameters: z.object({
        labels: z.array(z.string()).describe('X-as labels'),
        values: z.array(z.number()).describe('Y-as waarden'),
        title: z.string().describe('Grafiek titel'),
        unit: z.string().optional().describe('Meeteenheid'),
        colorScheme: z.enum(['fd', 'bnr']).describe('Kleurenschema (FD of BNR)')
      }).strict(),
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
      parameters: z.object({
        labels: z.array(z.string()).describe('X-as labels'),
        values: z.array(z.number()).describe('Y-as waarden'),
        title: z.string().describe('Grafiek titel'),
        unit: z.string().optional().describe('Meeteenheid'),
        colorScheme: z.enum(['fd', 'bnr']).describe('Kleurenschema (FD of BNR)')
      }).strict(),
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
