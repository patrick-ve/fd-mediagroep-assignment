#!/usr/bin/env node

// CLI interface for Chart Agent MVP

import readline from 'readline';
import { processAgentRequest } from '../features/agent/agent-core';
import { ChartEngine } from '../features/charts/chart-engine';
import { ExcelParser } from '../features/parsers/excel-parser';
import { ConversationMessage } from '@/lib/types';
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
        excelData
      );

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.message
      });

      console.log(`💬 ${response.message}\n`);

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
