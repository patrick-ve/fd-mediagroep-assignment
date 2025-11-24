#!/usr/bin/env node

// Evaluation runner

import { config } from 'dotenv';
import { runFilteringEval, EvalResult as FilteringResult } from './eval-filtering';
import { runAccuracyEval, EvalResult as AccuracyResult } from './eval-accuracy';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

interface AllEvalResults {
  timestamp: string;
  evaluations: {
    filtering: FilteringResult;
    accuracy: AccuracyResult;
  };
  summary: {
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    passRate: string;
  };
}

async function runAllEvals(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        Chart Agent MVP - Evaluation Suite             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
    console.error('Set it with: export OPENAI_API_KEY=your-api-key');
    process.exit(1);
  }

  try {
    // Run filtering eval
    console.log('═══════════════════════════════════════════════════════\n');
    const filteringResult = await runFilteringEval();
    
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📊 Filtering Eval Results:');
    console.log(`   Total: ${filteringResult.total}`);
    console.log(`   Passed: ${filteringResult.passed} ✅`);
    console.log(`   Failed: ${filteringResult.failed} ❌`);
    console.log(`   Pass Rate: ${((filteringResult.passed / filteringResult.total) * 100).toFixed(1)}%\n`);

    // Run accuracy eval
    console.log('═══════════════════════════════════════════════════════\n');
    const accuracyResult = await runAccuracyEval();
    
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📊 Accuracy Eval Results:');
    console.log(`   Total: ${accuracyResult.total}`);
    console.log(`   Passed: ${accuracyResult.passed} ✅`);
    console.log(`   Failed: ${accuracyResult.failed} ❌`);
    console.log(`   Pass Rate: ${((accuracyResult.passed / accuracyResult.total) * 100).toFixed(1)}%\n`);

    // Calculate overall summary
    const totalTests = filteringResult.total + accuracyResult.total;
    const totalPassed = filteringResult.passed + accuracyResult.passed;
    const totalFailed = filteringResult.failed + accuracyResult.failed;
    const passRate = ((totalPassed / totalTests) * 100).toFixed(1);

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📈 Overall Summary:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Total Passed: ${totalPassed} ✅`);
    console.log(`   Total Failed: ${totalFailed} ❌`);
    console.log(`   Overall Pass Rate: ${passRate}%\n`);

    // Prepare results object
    const results: AllEvalResults = {
      timestamp: new Date().toISOString(),
      evaluations: {
        filtering: filteringResult,
        accuracy: accuracyResult
      },
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        passRate: `${passRate}%`
      }
    };

    // Save results to file
    const resultsDir = './eval-results';
    await fs.mkdir(resultsDir, { recursive: true });
    
    const resultsFile = path.join(resultsDir, `eval-results-${Date.now()}.json`);
    await fs.writeFile(resultsFile, JSON.stringify(results, null, 2));
    
    console.log(`💾 Results saved to: ${resultsFile}\n`);

    // Exit with appropriate code
    if (totalFailed > 0) {
      console.log('⚠️  Some tests failed. Review the results above.\n');
      process.exit(1);
    } else {
      console.log('🎉 All tests passed!\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Fatal error running evaluations:', error);
    process.exit(1);
  }
}

// Run evaluations
runAllEvals();
