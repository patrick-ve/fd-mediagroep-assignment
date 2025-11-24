// Core type definitions for the Chart Agent MVP

export type ColorScheme = 'fd' | 'bnr';

export interface BrandColors {
  primary: string;
  content: string;
  background: string;
}

export interface ChartData {
  labels: string[];
  values: number[];
  title: string;
  unit?: string;
  chartType: 'bar' | 'line';
}

export interface AgentResponse {
  message: string;
  chartData?: ChartData;
  chartPath?: string;
  success: boolean;
  error?: string;
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
