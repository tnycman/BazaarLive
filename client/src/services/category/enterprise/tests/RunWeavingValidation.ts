/**
 * Weaving Infrastructure Validation Runner
 * Command-line interface for running comprehensive validation tests
 */

import WeavingInfrastructureValidator from './WeavingInfrastructureValidation';

/**
 * Main execution function for validation tests
 */
async function runValidation(): Promise<void> {
  console.log('🧪 Starting Weaving Infrastructure Validation...\n');
  
  try {
    const results = await WeavingInfrastructureValidator.runCompleteValidation();
    
    // Display results
    console.log('\n📊 FINAL VALIDATION REPORT');
    console.log('=' .repeat(50));
    console.log(`✅ Tests Passed: ${results.passedTests}/${results.totalTests}`);
    console.log(`❌ Tests Failed: ${results.failedTests}`);
    console.log(`⏱️  Total Time: ${results.executionTime}ms`);
    console.log(`🎯 Success Rate: ${(results.passedTests / results.totalTests * 100).toFixed(1)}%`);
    
    if (results.overallSuccess) {
      console.log('\n🎉 ALL TESTS PASSED! Infrastructure is ready for production.');
      console.log('🚀 Proceed to Task 3: Domain Service AOP Integration');
    } else {
      console.log('\n⚠️  Some tests failed. Review and fix issues before proceeding.');
      
      // Show failed test details
      console.log('\n📋 Failed Test Details:');
      for (const suite of results.suiteResults) {
        const failedTests = suite.results.filter((test: any) => !test.passed);
        if (failedTests.length > 0) {
          console.log(`\n${suite.suiteName}:`);
          for (const test of failedTests) {
            console.log(`  ❌ ${test.name}`);
            if (test.errors.length > 0) {
              console.log(`     Errors: ${test.errors.join(', ')}`);
            }
          }
        }
      }
    }
    
    process.exit(results.overallSuccess ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Validation execution failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runValidation();
}

export { runValidation };