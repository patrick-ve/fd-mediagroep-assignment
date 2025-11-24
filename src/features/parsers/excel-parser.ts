// Excel file parser using xlsx library

import * as XLSX from 'xlsx';
import { ChartData } from '@/lib/types';

export class ExcelParser {
  async parseExcelFile(filePath: string): Promise<ChartData> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (data.length < 2) {
        throw new Error('Excel bestand moet minimaal 2 rijen bevatten');
      }

      // Check if first row is headers
      const hasHeaders = typeof data[0][0] === 'string' && typeof data[0][1] === 'string';
      const startRow = hasHeaders ? 1 : 0;
      
      const labels: string[] = [];
      const values: number[] = [];
      
      for (let i = startRow; i < data.length; i++) {
        const row = data[i];
        if (row.length >= 2) {
          const label = String(row[0]);
          const value = parseFloat(String(row[1]));
          
          if (label && !isNaN(value)) {
            labels.push(label);
            values.push(value);
          }
        }
      }
      
      if (labels.length === 0 || values.length === 0) {
        throw new Error('Geen geldige data gevonden in Excel bestand');
      }
      
      // Generate title from sheet name or use default
      const title = sheetName || 'Grafiek';
      
      return {
        labels,
        values,
        title,
        chartType: 'bar' // Default, agent will decide
      };
    } catch (error) {
      throw new Error(`Fout bij het lezen van Excel bestand: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    }
  }

  async parseExcelBuffer(buffer: Buffer): Promise<ChartData> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (data.length < 2) {
        throw new Error('Excel bestand moet minimaal 2 rijen bevatten');
      }

      const hasHeaders = typeof data[0][0] === 'string' && typeof data[0][1] === 'string';
      const startRow = hasHeaders ? 1 : 0;
      
      const labels: string[] = [];
      const values: number[] = [];
      
      for (let i = startRow; i < data.length; i++) {
        const row = data[i];
        if (row.length >= 2) {
          const label = String(row[0]);
          const value = parseFloat(String(row[1]));
          
          if (label && !isNaN(value)) {
            labels.push(label);
            values.push(value);
          }
        }
      }
      
      if (labels.length === 0 || values.length === 0) {
        throw new Error('Geen geldige data gevonden in Excel bestand');
      }
      
      const title = sheetName || 'Grafiek';
      
      return {
        labels,
        values,
        title,
        chartType: 'bar'
      };
    } catch (error) {
      throw new Error(`Fout bij het lezen van Excel bestand: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    }
  }
}
