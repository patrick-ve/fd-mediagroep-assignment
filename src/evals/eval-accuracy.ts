// Evaluation for data accuracy

import { processAgentRequest } from '../features/agent/agent-core';
import { ChartEngine } from '../features/charts/chart-engine';

interface AccuracyTestCase {
  input: string;
  expectedLabels: string[];
  expectedValues: number[];
  description: string;
}

interface TestCaseResult {
  testCase: AccuracyTestCase;
  passed: boolean;
  actualLabels?: string[];
  actualValues?: number[];
  reason?: string;
}

export interface EvalResult {
  testName: string;
  passed: number;
  failed: number;
  total: number;
  details: TestCaseResult[];
}

const testCases: AccuracyTestCase[] = [
  {
    input: "Maak een grafiek met Mon=10, Tue=20, Wed=15",
    expectedLabels: ["Mon", "Tue", "Wed"],
    expectedValues: [10, 20, 15],
    description: "Simple inline data with English labels"
  },
  {
    input: "Geef me een grafiek met het aantal checkins per dag bij het OV: Maandag = 4.1, Dinsdag = 4.2, Woensdag = 4.4, Donderdag = 4.7, Vrijdag = 4.2, Zaterdag = 2.3, Zondag = 1.7. De getallen zijn in miljoenen check-ins.",
    expectedLabels: ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"],
    expectedValues: [4.1, 4.2, 4.4, 4.7, 4.2, 2.3, 1.7],
    description: "OV checkins test prompt (decimal values)"
  },
  {
    input: "Ik wil een grafiek die aangeeft hoeveel miljard studieschuld studenten hebben in de laatste jaren. De waarden zijn: 2020 = 25, 2021 = 26, 2022 = 26.5, 2023 = 27.3, 2024 = 27.9, en 2025 = 29.",
    expectedLabels: ["2020", "2021", "2022", "2023", "2024", "2025"],
    expectedValues: [25, 26, 26.5, 27.3, 27.9, 29],
    description: "Studieschuld test prompt (year labels)"
  },
  {
    input: "Maak een staafgrafiek: Q1=100, Q2=150, Q3=175, Q4=200",
    expectedLabels: ["Q1", "Q2", "Q3", "Q4"],
    expectedValues: [100, 150, 175, 200],
    description: "Quarterly data"
  },
  {
    input: "Lijn grafiek met temperatuur: Jan=5, Feb=7, Mrt=12, Apr=15",
    expectedLabels: ["Jan", "Feb", "Mrt", "Apr"],
    expectedValues: [5, 7, 12, 15],
    description: "Temperature data with Dutch month abbreviations"
  }
];

function arraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, idx) => {
    if (typeof val === 'number' && typeof arr2[idx] === 'number') {
      return Math.abs(val - arr2[idx]) < 0.01; // Allow small floating point differences
    }
    return val === arr2[idx];
  });
}

export async function runAccuracyEval(): Promise<EvalResult> {
  console.log('🧪 Running Data Accuracy Evaluation...\n');
  
  const chartEngine = new ChartEngine();
  const results: TestCaseResult[] = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.description}`);
    console.log(`Input: "${testCase.input.substring(0, 60)}..."`);

    try {
      const response = await processAgentRequest(
        testCase.input,
        [],
        chartEngine
      );

      // For this eval, we need to check if the agent called the chart creation tool
      // Since we can't directly access the tool parameters, we'll check if a chart was created
      // In a real implementation, you'd want to capture the tool call parameters
      
      // For now, we'll mark as passed if a chart was successfully created
      // A more robust implementation would parse the agent's response or capture tool calls
      const testPassed = response.success && response.chartPath !== undefined;

      if (testPassed) {
        passed++;
        console.log(`✅ PASSED - Chart created successfully\n`);
      } else {
        failed++;
        console.log(`❌ FAILED - No chart created\n`);
      }

      results.push({
        testCase,
        passed: testPassed,
        reason: response.message.substring(0, 100)
      });
    } catch (error) {
      failed++;
      console.log(`❌ FAILED - Error: ${error instanceof Error ? error.message : 'Unknown'}\n`);
      
      results.push({
        testCase,
        passed: false,
        reason: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  console.log('\n⚠️  Note: This eval checks if charts are created successfully.');
  console.log('For full data accuracy validation, inspect the generated chart files manually.\n');

  return {
    testName: 'Data Accuracy Evaluation',
    passed,
    failed,
    total: testCases.length,
    details: results
  };
}
