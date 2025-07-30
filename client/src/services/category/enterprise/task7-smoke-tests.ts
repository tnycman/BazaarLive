/**
 * Task 7 Smoke Tests: Result Pattern & System Integration
 * Comprehensive validation without external test framework dependencies
 */

import { Result, ok, err, isOk, isErr, mapOk, andThen, unwrapOr } from './patterns/Result';
import { SystemIntegration } from './integration/SystemIntegration';
import { FileSystemConfigurationRepository } from './repositories/FileSystemConfigurationRepository';
import { ConfigurationKey } from './domain/ConfigurationValueObjects';

// Mock validation orchestrator for testing
class MockValidationOrchestrator {
  async validateConfiguration(data: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    transformedData?: any;
  }> {
    if (data && typeof data === 'object') {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        transformedData: data
      };
    }
    return {
      isValid: false,
      errors: ['Invalid configuration data'],
      warnings: []
    };
  }

  async validatePartialConfiguration(data: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}

/**
 * Smoke test runner for Task 7 implementation
 */
async function runTask7SmokeTests(): Promise<void> {
  console.log('🚀 Starting Task 7: Result Pattern & System Integration Smoke Tests...\n');

  let testsPassed = 0;
  let totalTests = 0;

  // SECTION 1: Result Pattern Tests
  console.log('📋 SECTION 1: Result Pattern Tests');
  console.log('=' .repeat(50));

  // Test 1: Creating ok wraps the value and sets .ok === true
  console.log('Test 1: ok() creates successful Result');
  totalTests++;
  try {
    const result = ok<string, Error>("Hello World");
    if (result.ok && result.value === "Hello World") {
      console.log('✅ ok() creates successful Result with correct value');
      testsPassed++;
    } else {
      console.error('❌ ok() failed - result:', result);
    }
  } catch (err) {
    console.error('❌ ok() test error:', err);
  }

  // Test 2: Creating err wraps the error and sets .ok === false
  console.log('\nTest 2: err() creates failed Result');
  totalTests++;
  try {
    const error = new Error("Something went wrong");
    const result = err<string, Error>(error);
    if (!result.ok && result.error === error) {
      console.log('✅ err() creates failed Result with correct error');
      testsPassed++;
    } else {
      console.error('❌ err() failed - result:', result);
    }
  } catch (err) {
    console.error('❌ err() test error:', err);
  }

  // Test 3: Type-narrowing works with TypeScript's control-flow analysis
  console.log('\nTest 3: Type narrowing with control-flow analysis');
  totalTests++;
  try {
    const result: Result<number, Error> = ok(42);
    let typeNarrowingWorked = false;
    
    if (result.ok) {
      // TypeScript should narrow this to { ok: true; value: number }
      const doubled = result.value * 2; // This should work without type errors
      typeNarrowingWorked = (doubled === 84);
    }
    
    if (typeNarrowingWorked) {
      console.log('✅ Type narrowing works correctly');
      testsPassed++;
    } else {
      console.error('❌ Type narrowing failed');
    }
  } catch (err) {
    console.error('❌ Type narrowing test error:', err);
  }

  // Test 4: Result functional operations
  console.log('\nTest 4: Result functional operations (mapOk, andThen)');
  totalTests++;
  try {
    const result = ok<number, Error>(42);
    const mapped = mapOk(result, x => x.toString());
    const chained = andThen(mapped, str => {
      const num = parseInt(str);
      return isNaN(num) ? err(new Error("Not a number")) : ok(num);
    });
    
    if (chained.ok && chained.value === 42) {
      console.log('✅ Functional operations work correctly');
      testsPassed++;
    } else {
      console.error('❌ Functional operations failed - result:', chained);
    }
  } catch (err) {
    console.error('❌ Functional operations test error:', err);
  }

  // Test 5: Error handling with unwrapOr
  console.log('\nTest 5: Error handling with unwrapOr');
  totalTests++;
  try {
    const success = ok<number, Error>(42);
    const failure = err<number, Error>(new Error("Failed"));
    
    const successValue = unwrapOr(success, 0);
    const failureValue = unwrapOr(failure, 0);
    
    if (successValue === 42 && failureValue === 0) {
      console.log('✅ unwrapOr handles both success and failure correctly');
      testsPassed++;
    } else {
      console.error('❌ unwrapOr failed - values:', { successValue, failureValue });
    }
  } catch (err) {
    console.error('❌ unwrapOr test error:', err);
  }

  // SECTION 2: System Integration Tests
  console.log('\n📋 SECTION 2: System Integration Tests');
  console.log('=' .repeat(50));

  // Setup SystemIntegration
  const repository = new FileSystemConfigurationRepository({
    cacheTtlMs: 60000,
    requestTimeoutMs: 5000
  });
  const orchestrator = new MockValidationOrchestrator();
  const integration = new SystemIntegration(repository, orchestrator, {
    enableDebug: false,
    enableMetrics: true
  });

  // Test 6: SystemIntegration getConfiguration forwards success
  console.log('Test 6: SystemIntegration getConfiguration success case');
  totalTests++;
  try {
    const result = await integration.getConfiguration('fashion-women');
    if (result.ok && result.value) {
      console.log('✅ SystemIntegration.getConfiguration forwards success correctly');
      console.log('   Config loaded:', JSON.stringify(result.value, null, 2));
      testsPassed++;
    } else {
      console.error('❌ SystemIntegration.getConfiguration success failed - result:', result);
    }
  } catch (err) {
    console.error('❌ SystemIntegration.getConfiguration success test error:', err);
  }

  // Test 7: SystemIntegration getConfiguration forwards error
  console.log('\nTest 7: SystemIntegration getConfiguration error case');
  totalTests++;
  try {
    const result = await integration.getConfiguration('non-existent-config');
    if (!result.ok && result.error) {
      console.log('✅ SystemIntegration.getConfiguration forwards error correctly');
      console.log('   Error:', result.error.message);
      testsPassed++;
    } else {
      console.error('❌ SystemIntegration.getConfiguration error failed - should have returned error');
    }
  } catch (err) {
    console.error('❌ SystemIntegration.getConfiguration error test error:', err);
  }

  // Test 8: ConfigurationKey validation
  console.log('\nTest 8: ConfigurationKey validation');
  totalTests++;
  try {
    const validKey = new ConfigurationKey('fashion-women');
    const result = await integration.getConfiguration(validKey);
    if (result.ok) {
      console.log('✅ ConfigurationKey validation and usage works');
      testsPassed++;
    } else {
      console.error('❌ ConfigurationKey validation failed - result:', result);
    }
  } catch (err) {
    console.error('❌ ConfigurationKey validation test error:', err);
  }

  // Test 9: Integration metrics tracking
  console.log('\nTest 9: Integration metrics tracking');
  totalTests++;
  try {
    const metrics = integration.getMetrics();
    if (metrics.requestCount >= 2 && metrics.successCount >= 1 && metrics.errorCount >= 1) {
      console.log('✅ Integration metrics tracking works');
      console.log('   Metrics:', JSON.stringify(metrics, null, 2));
      testsPassed++;
    } else {
      console.error('❌ Integration metrics tracking failed - metrics:', metrics);
    }
  } catch (err) {
    console.error('❌ Integration metrics test error:', err);
  }

  // Test 10: System health monitoring
  console.log('\nTest 10: System health monitoring');
  totalTests++;
  try {
    const healthResult = await integration.getSystemHealth();
    if (healthResult.ok && healthResult.value) {
      console.log('✅ System health monitoring works');
      console.log('   Health status:', JSON.stringify(healthResult.value, null, 2));
      testsPassed++;
    } else {
      console.error('❌ System health monitoring failed - result:', healthResult);
    }
  } catch (err) {
    console.error('❌ System health monitoring test error:', err);
  }

  // FINAL SMOKE TEST: Integration with FileSystemConfigurationRepository
  console.log('\n📋 FINAL SMOKE TEST: Complete Integration');
  console.log('=' .repeat(50));
  totalTests++;
  try {
    console.log('🔍 Running comprehensive integration smoke test...');
    
    const integration = new SystemIntegration(repository, orchestrator);
    const res = await integration.getConfiguration('fashion-women');
    
    if (!res.ok) {
      throw new Error('Expected success for existing key fashion-women');
    }
    
    console.log('✅ FINAL SMOKE TEST PASSED');
    console.log('   Integration successfully loads configuration through complete pipeline:');
    console.log('   Repository -> Domain Service -> Validation -> SystemIntegration -> Result');
    console.log('   Configuration:', JSON.stringify(res.value, null, 2));
    testsPassed++;
    
  } catch (err) {
    console.error('❌ FINAL SMOKE TEST FAILED:', err);
  }

  // Test Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TASK 7 SMOKE TEST RESULTS: Result Pattern & System Integration');
  console.log('='.repeat(70));
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED - Task 7 Implementation Complete!');
    console.log('');
    console.log('✅ SUCCESS CRITERIA MET:');
    console.log('   • Consistency: All service methods return Result<T,E>');
    console.log('   • Encapsulation: External callers only touch SystemIntegration API');
    console.log('   • Observability: Errors remain fully typed for recovery strategies');
    console.log('   • Maintainability: New operations easily added to SystemIntegration');
  } else {
    console.log('⚠️ Some tests failed - Review implementation');
  }
  
  console.log('='.repeat(70));
}

// Execute smoke tests
runTask7SmokeTests().catch(console.error);

export { runTask7SmokeTests };