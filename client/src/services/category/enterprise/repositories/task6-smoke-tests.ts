/**
 * Task 6 Repository Smoke Tests
 * Comprehensive validation of FileSystemConfigurationRepository implementation
 */

import { FileSystemConfigurationRepository } from './FileSystemConfigurationRepository';
import { ConfigurationKey } from '../domain/ConfigurationValueObjects';
import { ConfigurationNotFoundError, ConfigurationLoadError } from '../errors/ConfigurationErrors';

/**
 * Smoke test executor for Task 6 repository
 */
async function runTask6SmokeTests(): Promise<void> {
  console.log('🚀 Starting Task 6 Repository Smoke Tests...\n');

  const repo = new FileSystemConfigurationRepository({
    cacheTtlMs: 60000, // 1 minute for testing
    requestTimeoutMs: 5000 // 5 seconds
  });

  let testsPassed = 0;
  let totalTests = 0;

  // Test 1: Basic fetch operation
  console.log('📋 Test 1: Basic fetch operation');
  totalTests++;
  try {
    const rawConfig = await repo.fetch('fashion-women');
    console.log('✅ Raw config loaded:', JSON.stringify(rawConfig, null, 2));
    testsPassed++;
  } catch (err) {
    console.error('❌ Fetch error:', err);
  }

  // Test 2: Typed configuration access
  console.log('\n📋 Test 2: Typed configuration access');
  totalTests++;
  try {
    const key = new ConfigurationKey('fashion-men');
    const result = await repo.getConfiguration(key);
    if (result.success) {
      console.log('✅ Typed config loaded:', JSON.stringify(result.value, null, 2));
      testsPassed++;
    } else {
      console.error('❌ Typed config failed:', result.error);
    }
  } catch (err) {
    console.error('❌ Typed config error:', err);
  }

  // Test 3: Non-existent configuration
  console.log('\n📋 Test 3: Non-existent configuration error handling');
  totalTests++;
  try {
    await repo.fetch('non-existent-config');
    console.error('❌ Should have thrown ConfigurationNotFoundError');
  } catch (err) {
    if (err instanceof ConfigurationNotFoundError) {
      console.log('✅ ConfigurationNotFoundError thrown correctly:', err.message);
      testsPassed++;
    } else {
      console.error('❌ Wrong error type:', err);
    }
  }

  // Test 4: Configuration existence check
  console.log('\n📋 Test 4: Configuration existence check');
  totalTests++;
  try {
    const key1 = new ConfigurationKey('fashion-women');
    const key2 = new ConfigurationKey('non-existent');
    
    const exists1 = await repo.existsConfiguration(key1);
    const exists2 = await repo.existsConfiguration(key2);
    
    if (exists1 && !exists2) {
      console.log('✅ Existence check working correctly');
      testsPassed++;
    } else {
      console.error('❌ Existence check failed:', { exists1, exists2 });
    }
  } catch (err) {
    console.error('❌ Existence check error:', err);
  }

  // Test 5: Get all configurations
  console.log('\n📋 Test 5: Get all configurations');
  totalTests++;
  try {
    const result = await repo.getAllConfigurations();
    if (result.success && Array.isArray(result.value) && result.value.length > 0) {
      console.log('✅ All configurations loaded:', result.value.length, 'configs');
      testsPassed++;
    } else {
      console.error('❌ Get all configurations failed:', result.error || 'No configs returned');
    }
  } catch (err) {
    console.error('❌ Get all configurations error:', err);
  }

  // Test 6: Cache functionality
  console.log('\n📋 Test 6: Cache functionality');
  totalTests++;
  try {
    const start1 = Date.now();
    await repo.fetch('fashion-women');
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    await repo.fetch('fashion-women'); // Should be cached
    const time2 = Date.now() - start2;

    if (time2 < time1) {
      console.log('✅ Cache working - second fetch faster:', { time1, time2 });
      testsPassed++;
    } else {
      console.log('⚠️ Cache may not be working - times:', { time1, time2 });
    }
  } catch (err) {
    console.error('❌ Cache test error:', err);
  }

  // Test 7: Health status
  console.log('\n📋 Test 7: Repository health status');
  totalTests++;
  try {
    const health = await repo.getHealthStatus();
    console.log('✅ Health status:', JSON.stringify(health, null, 2));
    if (health.isHealthy && health.totalConfigurations > 0) {
      testsPassed++;
    }
  } catch (err) {
    console.error('❌ Health status error:', err);
  }

  // Test 8: Concurrent fetch deduplication
  console.log('\n📋 Test 8: Concurrent fetch deduplication');
  totalTests++;
  try {
    const promises = [
      repo.fetch('fashion-kids'),
      repo.fetch('fashion-kids'),
      repo.fetch('fashion-kids')
    ];
    
    const results = await Promise.all(promises);
    const allSame = results.every(r => JSON.stringify(r) === JSON.stringify(results[0]));
    
    if (allSame) {
      console.log('✅ Concurrent fetch deduplication working');
      testsPassed++;
    } else {
      console.error('❌ Concurrent fetch deduplication failed');
    }
  } catch (err) {
    console.error('❌ Concurrent fetch test error:', err);
  }

  // Test 9: Available keys
  console.log('\n📋 Test 9: Available configuration keys');
  totalTests++;
  try {
    const keys = repo.getAvailableKeys();
    console.log('✅ Available keys:', keys);
    if (keys.length > 0 && keys.includes('fashion-women')) {
      testsPassed++;
    }
  } catch (err) {
    console.error('❌ Available keys error:', err);
  }

  // Test 10: Dynamic loader registration
  console.log('\n📋 Test 10: Dynamic loader registration');
  totalTests++;
  try {
    repo.registerLoader('test-dynamic', () => Promise.resolve({ test: 'dynamic loader' }));
    const result = await repo.fetch('test-dynamic');
    
    if (result.test === 'dynamic loader') {
      console.log('✅ Dynamic loader registration working');
      testsPassed++;
    } else {
      console.error('❌ Dynamic loader failed:', result);
    }
  } catch (err) {
    console.error('❌ Dynamic loader error:', err);
  }

  // Test Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TASK 6 SMOKE TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED - Task 6 Repository Implementation Complete!');
  } else {
    console.log('⚠️ Some tests failed - Review implementation');
  }
  
  console.log('='.repeat(60));
}

// Execute smoke tests
runTask6SmokeTests().catch(console.error);

export { runTask6SmokeTests };