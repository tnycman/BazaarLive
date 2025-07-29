/**
 * Automated Test Runner for Task 3.2 Verification
 * Executable test runner with browser-based execution
 * 100% best practices, comprehensive test automation
 */

import { testRunner, type TestExecutionReport } from './TestRunner';

// ===== AUTOMATED TEST EXECUTION =====

/**
 * Execute Task 3.2 regression tests automatically
 * Can be called from console or integrated into automated testing pipeline
 */
export async function executeTask32RegressionTests(): Promise<TestExecutionReport> {
  console.log('🔥 TASK 3.2: AUTOMATED REGRESSION TEST EXECUTION');
  console.log('================================================');
  
  try {
    const report = await testRunner.executeRegressionTests();
    
    // Display comprehensive results
    displayTestResults(report);
    
    return report;
  } catch (error) {
    console.error('❌ Automated test execution failed:', error);
    throw error;
  }
}

/**
 * Display comprehensive test results in console
 */
function displayTestResults(report: TestExecutionReport): void {
  console.log('\n🎯 TASK 3.2 REGRESSION TEST RESULTS');
  console.log('====================================');
  
  // Summary section
  console.log('\n📊 SUMMARY:');
  console.log(`✅ Total Tests: ${report.summary.totalTests}`);
  console.log(`✅ Pass Rate: ${report.summary.passRate.toFixed(1)}% (${report.summary.passCount} passed, ${report.summary.failCount} failed, ${report.summary.errorCount} errors)`);
  console.log(`⏱️ Average Load Time: ${report.summary.avgLoadTime.toFixed(1)}ms`);
  console.log(`🎯 Cache Hit Rate: ${report.summary.cacheHitRate.toFixed(1)}%`);
  console.log(`🚀 Performance Score: ${report.summary.avgPerformanceScore.toFixed(1)}/100`);
  
  // Category analysis
  console.log('\n📈 CATEGORY ANALYSIS:');
  report.categoryAnalysis.forEach(category => {
    console.log(`\n🏷️ ${category.configKey}:`);
    console.log(`   Pass Rate: ${category.passRate.toFixed(1)}%`);
    console.log(`   Cold Load: ${category.coldLoadTime}ms`);
    console.log(`   Hot Load: ${category.hotLoadTime}ms`);
    console.log(`   Cache Efficiency: ${category.cacheEfficiency.toFixed(1)}x`);
    console.log(`   Performance Rating: ${category.performanceRating}`);
    
    if (category.issues.length > 0) {
      console.log(`   ⚠️ Issues: ${category.issues.join(', ')}`);
    }
  });
  
  // Performance benchmarks
  console.log('\n🏁 PERFORMANCE BENCHMARKS:');
  report.performanceBenchmarks.forEach(benchmark => {
    const improvement = benchmark.performanceImprovement;
    const emoji = improvement > 50 ? '🚀' : improvement > 20 ? '⚡' : improvement > 0 ? '📈' : '📉';
    
    console.log(`${emoji} ${benchmark.configKey}:`);
    console.log(`   Cold Load: ${benchmark.coldLoadTime}ms`);
    console.log(`   Hot Load: ${benchmark.hotLoadTime}ms`);
    console.log(`   Improvement: ${improvement.toFixed(1)}%`);
    console.log(`   Cache Efficiency: ${benchmark.cacheEfficiencyRatio.toFixed(1)}x`);
  });
  
  // Regression analysis
  console.log('\n🔍 REGRESSION ANALYSIS:');
  console.log(`Has Regressions: ${report.regressionAnalysis.hasRegressions ? '❌ YES' : '✅ NO'}`);
  console.log(`Performance Impact: ${getPerformanceImpactEmoji(report.regressionAnalysis.performanceImpact)} ${report.regressionAnalysis.performanceImpact}`);
  console.log(`Regression Score: ${report.regressionAnalysis.regressionScore}/100`);
  
  if (report.regressionAnalysis.criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    report.regressionAnalysis.criticalIssues.forEach(issue => {
      console.log(`❌ ${issue}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  report.recommendations.forEach(recommendation => {
    const emoji = recommendation.includes('✅') ? '✅' : 
                 recommendation.includes('CRITICAL') ? '🚨' : 
                 recommendation.includes('Optimize') ? '⚡' : '💡';
    console.log(`${emoji} ${recommendation}`);
  });
  
  // Execution metadata
  console.log('\n📋 EXECUTION METADATA:');
  console.log(`Execution Time: ${report.executionMetadata.executionTime}ms`);
  console.log(`Environment: ${report.executionMetadata.testEnvironment}`);
  console.log(`Configuration Version: ${report.executionMetadata.configurationVersion}`);
  console.log(`Timestamp: ${new Date(report.executionMetadata.timestamp).toISOString()}`);
  
  // Final status
  const overallStatus = report.summary.passRate >= 95 && !report.regressionAnalysis.hasRegressions;
  console.log('\n' + '='.repeat(50));
  console.log(`🏆 TASK 3.2 STATUS: ${overallStatus ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('='.repeat(50));
}

/**
 * Get performance impact emoji
 */
function getPerformanceImpactEmoji(impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'): string {
  switch (impact) {
    case 'POSITIVE': return '🚀';
    case 'NEUTRAL': return '➡️';
    case 'NEGATIVE': return '📉';
  }
}

/**
 * Execute tests for specific categories only
 */
export async function executeSpecificCategoryTests(configKeys: string[]): Promise<void> {
  console.log(`🎯 Testing specific categories: ${configKeys.join(', ')}`);
  
  for (const configKey of configKeys) {
    try {
      const results = await testRunner.executeSpecificCategoryTest(configKey);
      
      console.log(`\n📊 Results for ${configKey}:`);
      console.log(`Cold Load: ${results.coldLoadResult.status} (${results.coldLoadResult.loadTime}ms)`);
      console.log(`Hot Load: ${results.hotLoadResult.status} (${results.hotLoadResult.loadTime}ms)`);
      console.log(`Edge Cases: ${results.edgeCaseResults.map(r => r.status).join(', ')}`);
    } catch (error) {
      console.error(`❌ Test failed for ${configKey}:`, error);
    }
  }
}

/**
 * Quick test runner for development
 */
export async function quickRegressionTest(): Promise<boolean> {
  console.log('⚡ Quick Regression Test');
  
  try {
    const report = await testRunner.executeRegressionTests();
    const passed = report.summary.passRate >= 90 && !report.regressionAnalysis.hasRegressions;
    
    console.log(`Quick Test Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Pass Rate: ${report.summary.passRate.toFixed(1)}%`);
    console.log(`Avg Load Time: ${report.summary.avgLoadTime.toFixed(1)}ms`);
    
    return passed;
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    return false;
  }
}

// ===== BROWSER CONSOLE INTEGRATION =====

// Make functions available in browser console for manual testing
if (typeof window !== 'undefined') {
  (window as any).task32RegressionTests = executeTask32RegressionTests;
  (window as any).task32QuickTest = quickRegressionTest;
  (window as any).task32SpecificTests = executeSpecificCategoryTests;
  
  console.log('🧪 Task 3.2 Test Functions Available:');
  console.log('- task32RegressionTests() - Full regression test suite');
  console.log('- task32QuickTest() - Quick validation test');
  console.log('- task32SpecificTests([...configKeys]) - Test specific categories');
}