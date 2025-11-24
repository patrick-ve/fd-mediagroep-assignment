// Evaluation for request filtering (accept/refuse)

import { processAgentRequest } from '../features/agent/agent-core';
import { ChartEngine } from '../features/charts/chart-engine';

interface FilteringTestCase {
  input: string;
  expected: 'accept' | 'refuse';
  description: string;
}

interface TestCaseResult {
  testCase: FilteringTestCase;
  passed: boolean;
  actualBehavior: string;
  reason?: string;
}

export interface EvalResult {
  testName: string;
  passed: number;
  failed: number;
  total: number;
  details: TestCaseResult[];
}

const testCases: FilteringTestCase[] = [
  {
    input: "Maak een staafgrafiek met verkoopcijfers: Jan=100, Feb=150, Mrt=120",
    expected: "accept",
    description: "Valid bar chart request in Dutch"
  },
  {
    input: "Wat is het weer vandaag?",
    expected: "refuse",
    description: "Weather question (non-chart request)"
  },
  {
    input: "Maak een taartdiagram van de verkoop",
    expected: "refuse",
    description: "Pie chart request (unsupported chart type)"
  },
  {
    input: "Laat me een lijngrafiek zien van de groei over tijd: 2020=50, 2021=75, 2022=90, 2023=120",
    expected: "accept",
    description: "Valid line chart request with data"
  },
  {
    input: "Schrijf een gedicht over data",
    expected: "refuse",
    description: "Poem request (completely unrelated)"
  },
  {
    input: "Kun je een scatter plot maken?",
    expected: "refuse",
    description: "Scatter plot request (unsupported chart type)"
  },
  {
    input: "Geef me een grafiek met OV check-ins per dag: Maandag=4100, Dinsdag=4200, Woensdag=4400",
    expected: "accept",
    description: "Valid chart request with data (type not specified)"
  },
  {
    input: "Wat zijn de beste restaurants in Amsterdam?",
    expected: "refuse",
    description: "Restaurant question (non-chart request)"
  },
  {
    input: "Maak een lijn grafiek met studieschuld data: 2020=25, 2021=26, 2022=27, 2023=28",
    expected: "accept",
    description: "Valid line chart request with data"
  }
];

export async function runFilteringEval(): Promise<EvalResult> {
  console.log('🧪 Running Filtering Evaluation...\n');
  
  const chartEngine = new ChartEngine();
  const results: TestCaseResult[] = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.description}`);
    console.log(`Input: "${testCase.input}"`);

    try {
      const response = await processAgentRequest(
        testCase.input,
        [],
        chartEngine
      );

      // Determine if request was accepted or refused
      const wasAccepted = response.success && response.chartPath !== undefined;
      const wasRefused = response.message.toLowerCase().includes('weiger') ||
                        response.message.toLowerCase().includes('kan niet') ||
                        response.message.toLowerCase().includes('alleen') ||
                        response.message.toLowerCase().includes('refuse') ||
                        (!wasAccepted && !response.chartPath);

      const actualBehavior = wasAccepted ? 'accept' : 'refuse';
      const testPassed = actualBehavior === testCase.expected;

      console.log(`Expected: ${testCase.expected}, Received: ${actualBehavior}`);
      if (testPassed) {
        passed++;
        console.log(`✅ PASSED\n`);
      } else {
        failed++;
        console.log(`❌ FAILED\n`);
      }

      results.push({
        testCase,
        passed: testPassed,
        actualBehavior,
        reason: response.message.substring(0, 100)
      });
    } catch (error) {
      failed++;
      console.log(`❌ FAILED - Error: ${error instanceof Error ? error.message : 'Unknown'}\n`);
      
      results.push({
        testCase,
        passed: false,
        actualBehavior: 'error',
        reason: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return {
    testName: 'Request Filtering Evaluation',
    passed,
    failed,
    total: testCases.length,
    details: results
  };
}
