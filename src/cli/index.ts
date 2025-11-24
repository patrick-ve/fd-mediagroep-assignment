#!/usr/bin/env node

// CLI interface for Chart Agent MVP

import dotenv from 'dotenv';
dotenv.config({
  path: '.env.local'
})

import readline from 'readline';
import { processAgentRequest } from '../features/agent/agent-core';
import { ChartEngine } from '../features/charts/chart-engine';
import { ExcelParser } from '../features/parsers/excel-parser';
import { ConversationMessage, ChartData, ColorScheme } from '@/lib/types';
import { isValidExcelFile } from '@/lib/utils';
import fs from 'fs';

class CLIInterface {
  private chartEngine: ChartEngine;
  private excelParser: ExcelParser;
  private conversationHistory: ConversationMessage[] = [];
  private rl: readline.Interface;

  constructor() {
    this.chartEngine = new ChartEngine();
    this.excelParser = new ExcelParser();
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'chart-agent> '
    });
  }

  async run(): Promise<void> {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║        Welkom bij Chart Agent MVP!                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log('Ik kan staaf- en lijngrafieken maken in FD- of BNR-kleuren.');
    console.log('Je kunt ook een Excel-bestand opgeven door het pad in te voeren.');
    console.log('Typ "/exit" om af te sluiten.\n');
    
    this.rl.prompt();
    
    this.rl.on('line', async (input) => {
      await this.processCommand(input.trim());
      this.rl.prompt();
    });
    
    this.rl.on('close', () => {
      console.log('\nTot ziens!');
      process.exit(0);
    });
  }

  private async processCommand(command: string): Promise<void> {
    if (command === '/exit') {
      this.rl.close();
      return;
    }

    if (!command) {
      return;
    }

    try {
      // Check if input is a file path
      let excelData: string | undefined;
      
      if (command.endsWith('.xlsx') || command.endsWith('.xls')) {
        if (fs.existsSync(command)) {
          console.log('📊 Excel-bestand gevonden, aan het verwerken...\n');
          const parsedData = await this.excelParser.parseExcelFile(command);
          excelData = JSON.stringify(parsedData);
          command = `Maak een grafiek met deze data uit het Excel-bestand`;
        } else {
          console.log(`❌ Fout: Bestand niet gevonden: ${command}\n`);
          return;
        }
      }

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: command
      });

      console.log('🤖 Aan het verwerken...\n');

      const response = await processAgentRequest(
        command,
        this.conversationHistory,
        this.chartEngine,
        excelData,
        false // Don't save to disk for CLI
      );

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.message
      });

      console.log(`💬 ${response.message}\n`);

      // Render chart in terminal if chart data is available
      if (response.chartData) {
        console.log('📊 Grafiek in terminal:\n');
        this.renderChartInTerminal(response.chartData);
      }

      // Show file path if chart was saved to disk
      if (response.chartPath) {
        console.log(`📁 Grafiek opgeslagen in: ${response.chartPath}\n`);
      }

      if (!response.success && response.error) {
        console.log(`⚠️  Details: ${response.error}\n`);
      }
    } catch (error) {
      console.error(`❌ Fout: ${error instanceof Error ? error.message : 'Onbekende fout'}\n`);
    }
  }

  private renderChartInTerminal(chartData: ChartData): void {
    const { labels, values, title, unit, chartType } = chartData;

    // Print title
    console.log(`\n${title}\n${'─'.repeat(title.length)}\n`);

    // Find max value for scaling
    const maxValue = Math.max(...values);
    const maxBarWidth = 50; // Max width in characters

    if (chartType === 'bar') {
      // Render bar chart
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const value = values[i];
        const barWidth = Math.round((value / maxValue) * maxBarWidth);
        const bar = '█'.repeat(barWidth);

        // Format: Label: ████████ Value
        const displayValue = unit ? `${value} ${unit}` : value;
        console.log(`${label.padEnd(15)} ${bar} ${displayValue}`);
      }
    } else if (chartType === 'line') {
      // Render simple line chart using sparkline-like visualization
      const height = 10;
      const width = Math.min(labels.length * 3, 60);

      // Normalize values to fit in height
      const normalizedValues = values.map(v => Math.round((v / maxValue) * (height - 1)));

      // Create 2D grid
      const grid: string[][] = Array(height).fill(0).map(() => Array(width).fill(' '));

      // Plot points and lines
      for (let i = 0; i < values.length; i++) {
        const x = Math.round((i / (values.length - 1)) * (width - 1));
        const y = height - 1 - normalizedValues[i];

        if (y >= 0 && y < height && x >= 0 && x < width) {
          grid[y][x] = '●';

          // Draw line to next point
          if (i < values.length - 1) {
            const nextX = Math.round(((i + 1) / (values.length - 1)) * (width - 1));
            const nextY = height - 1 - normalizedValues[i + 1];

            // Simple line drawing
            const steps = Math.abs(nextX - x);
            for (let step = 0; step <= steps; step++) {
              const interpX = x + Math.round((nextX - x) * (step / steps));
              const interpY = y + Math.round((nextY - y) * (step / steps));
              if (interpY >= 0 && interpY < height && interpX >= 0 && interpX < width) {
                if (grid[interpY][interpX] === ' ') {
                  grid[interpY][interpX] = '─';
                }
              }
            }
          }
        }
      }

      // Print grid with Y-axis labels
      for (let y = 0; y < height; y++) {
        const value = Math.round((1 - y / (height - 1)) * maxValue);
        const label = String(value).padStart(6);
        console.log(`${label} │ ${grid[y].join('')}`);
      }

      // Print X-axis
      console.log(`${''.padStart(6)} └${'─'.repeat(width)}`);

      // Print X-axis labels
      const labelStep = Math.max(1, Math.floor(labels.length / 5));
      let xAxisLabels = '       ';
      for (let i = 0; i < labels.length; i += labelStep) {
        const x = Math.round((i / (labels.length - 1)) * (width - 1));
        const label = labels[i].substring(0, 8);
        xAxisLabels += label.padEnd(width / 5, ' ');
      }
      console.log(xAxisLabels.substring(0, width + 8));

      if (unit) {
        console.log(`\n(${unit})`);
      }
    }

    console.log('');
  }
}

// Check for API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Fout: OPENAI_API_KEY omgevingsvariabele is niet ingesteld');
  console.error('Stel deze in via: export OPENAI_API_KEY=your-api-key');
  process.exit(1);
}

// Start CLI
const cli = new CLIInterface();
cli.run().catch(error => {
  console.error('Fatale fout:', error);
  process.exit(1);
});
