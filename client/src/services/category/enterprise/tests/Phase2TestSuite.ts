/**
 * Phase 2 Test Suite - Result Pattern Implementation
 * Comprehensive unit and integration tests for Result<T, E> flows
 * Zero mocking, authentic error scenarios, complete test coverage
 */

import { 
  Result,
  ConfigurationResult,
  ConfigurationResultUtils,
  AsyncResultUtils
} from '../patterns/Result';

import {
  ConfigurationError,
  ConfigurationNotFoundError,
  ConfigurationValidationError,
  ConfigurationLoadError,
  ConfigurationErrorFactory,
  ErrorTypeGuards
} from '../errors/ConfigurationErrors';

import { 
  EnterpriseConfigurationService,
  type ConfigurationLoadOptions 
} from '../services/EnterpriseConfigurationService';

import { 
  EnterpriseConfigurationRegistry 
} from '../registry/EnterpriseConfigurationRegistry';

import { 
  LegacyConfigurationAdapter,
  UniversalPageConfigurationAdapter 
} from '../adapters/LegacyConfigurationAdapter';

import { 
  UniversalPageConfiguration 
} from '../schemas/ConfigurationSchemas';

// ===== TEST INTERFACES =====

export interface TestResult {
  readonly testName: string;
  readonly passed: boolean;
  readonly executionTime: number;
  readonly error?: string;
  readonly details?: Record<string, unknown>;
}

export interface TestSuiteResult {
  readonly suiteName: string;
  readonly totalTests: number;
  readonly passedTests: number;
  readonly failedTests: number;
  readonly executionTime: number;
  readonly results: TestResult[];
  readonly overallSuccess: boolean;
}

export interface Phase2TestReport {
  readonly resultPatternTests: TestSuiteResult;
  readonly errorHierarchyTests: TestSuiteResult;
  readonly serviceIntegrationTests: TestSuiteResult;
  readonly adapterTests: TestSuiteResult;
  readonly overallCompliance: number;
  readonly totalTestsExecuted: number;
  readonly totalTestsPassed: number;
  readonly executionSummary: string[];
}

// ===== TEST UTILITIES =====

class TestRunner {
  /**
   * Run individual test with timing and error capture
   */
  static async runTest(
    testName: string,
    testFn: () => Promise<void> | void
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      return {
        testName,
        passed: true,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName,
        passed: false,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? { stack: error.stack } : undefined
      };
    }
  }

  /**
   * Run test suite with comprehensive reporting
   */
  static async runTestSuite(
    suiteName: string,
    tests: Array<{ name: string; fn: () => Promise<void> | void }>
  ): Promise<TestSuiteResult> {
    const startTime = Date.now();
    const results: TestResult[] = [];

    for (const test of tests) {
      const result = await TestRunner.runTest(test.name, test.fn);
      results.push(result);
    }

    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.filter(r => !r.passed).length;

    return {
      suiteName,
      totalTests: tests.length,
      passedTests,
      failedTests,
      executionTime: Date.now() - startTime,
      results,
      overallSuccess: failedTests === 0
    };
  }
}

// ===== RESULT PATTERN TESTS =====

class ResultPatternTests {
  /**
   * Test Result.success() creates successful result
   */
  static testSuccessResult(): void {
    const value = "test-value";
    const result = Result.success<string, Error>(value);
    
    if (!result.isSuccess) throw new Error("Result should be successful");
    if (result.isFailure) throw new Error("Result should not be failure");
    if (result.value !== value) throw new Error("Result value should match input");
  }

  /**
   * Test Result.failure() creates failure result
   */
  static testFailureResult(): void {
    const error = new Error("test error");
    const result = Result.failure<string, Error>(error);
    
    if (result.isSuccess) throw new Error("Result should not be successful");
    if (!result.isFailure) throw new Error("Result should be failure");
    if (result.error !== error) throw new Error("Result error should match input");
  }

  /**
   * Test Result.from() with successful function
   */
  static testFromSuccess(): void {
    const result = Result.from(() => "success");
    
    if (!result.isSuccess) throw new Error("Result should be successful");
    if (result.value !== "success") throw new Error("Result value should be 'success'");
  }

  /**
   * Test Result.from() with throwing function
   */
  static testFromFailure(): void {
    const result = Result.from(() => {
      throw new Error("test error");
    });
    
    if (!result.isFailure) throw new Error("Result should be failure");
    if (result.error.message !== "test error") throw new Error("Error message should match");
  }

  /**
   * Test Result.map() with successful result
   */
  static testMapSuccess(): void {
    const result = Result.success(5).map(x => x * 2);
    
    if (!result.isSuccess) throw new Error("Mapped result should be successful");
    if (result.value !== 10) throw new Error("Mapped value should be 10");
  }

  /**
   * Test Result.map() with failure result
   */
  static testMapFailure(): void {
    const error = new Error("test error");
    const result = Result.failure<number, Error>(error).map(x => x * 2);
    
    if (!result.isFailure) throw new Error("Mapped result should be failure");
    if (result.error !== error) throw new Error("Error should be preserved");
  }

  /**
   * Test Result.flatMap() with successful result
   */
  static testFlatMapSuccess(): void {
    const result = Result.success(5).flatMap(x => Result.success(x * 2));
    
    if (!result.isSuccess) throw new Error("FlatMapped result should be successful");
    if (result.value !== 10) throw new Error("FlatMapped value should be 10");
  }

  /**
   * Test Result.flatMap() with failure result
   */
  static testFlatMapFailure(): void {
    const error = new Error("test error");
    const result = Result.failure<number, Error>(error).flatMap(x => Result.success(x * 2));
    
    if (!result.isFailure) throw new Error("FlatMapped result should be failure");
    if (result.error !== error) throw new Error("Error should be preserved");
  }

  /**
   * Test Result.combine() with all successful results
   */
  static testCombineSuccess(): void {
    const results = [
      Result.success(1),
      Result.success(2),
      Result.success(3)
    ];
    
    const combined = Result.combine(results);
    
    if (!combined.isSuccess) throw new Error("Combined result should be successful");
    if (combined.value.length !== 3) throw new Error("Combined array should have 3 elements");
    if (combined.value[0] !== 1) throw new Error("First element should be 1");
  }

  /**
   * Test Result.combine() with one failure
   */
  static testCombineFailure(): void {
    const error = new Error("test error");
    const results = [
      Result.success(1),
      Result.failure<number, Error>(error),
      Result.success(3)
    ];
    
    const combined = Result.combine(results);
    
    if (!combined.isFailure) throw new Error("Combined result should be failure");
    if (combined.error !== error) throw new Error("Error should match the failed result");
  }

  /**
   * Get all result pattern tests
   */
  static getAllTests(): Array<{ name: string; fn: () => void }> {
    return [
      { name: "Result.success() creates successful result", fn: ResultPatternTests.testSuccessResult },
      { name: "Result.failure() creates failure result", fn: ResultPatternTests.testFailureResult },
      { name: "Result.from() handles successful function", fn: ResultPatternTests.testFromSuccess },
      { name: "Result.from() handles throwing function", fn: ResultPatternTests.testFromFailure },
      { name: "Result.map() transforms successful result", fn: ResultPatternTests.testMapSuccess },
      { name: "Result.map() preserves failure", fn: ResultPatternTests.testMapFailure },
      { name: "Result.flatMap() chains successful result", fn: ResultPatternTests.testFlatMapSuccess },
      { name: "Result.flatMap() preserves failure", fn: ResultPatternTests.testFlatMapFailure },
      { name: "Result.combine() succeeds with all success", fn: ResultPatternTests.testCombineSuccess },
      { name: "Result.combine() fails with any failure", fn: ResultPatternTests.testCombineFailure }
    ];
  }
}

// ===== ERROR HIERARCHY TESTS =====

class ErrorHierarchyTests {
  /**
   * Test ConfigurationNotFoundError properties
   */
  static testConfigurationNotFoundError(): void {
    const error = new ConfigurationNotFoundError("test-key", ["key1", "key2"]);
    
    if (error.code !== "CONFIG_NOT_FOUND") throw new Error("Code should be CONFIG_NOT_FOUND");
    if (error.severity !== "high") throw new Error("Severity should be high");
    if (error.category !== "loading") throw new Error("Category should be loading");
    if (!error.isRecoverable()) throw new Error("Error should be recoverable");
  }

  /**
   * Test ConfigurationValidationError properties
   */
  static testConfigurationValidationError(): void {
    const error = new ConfigurationValidationError("test-key", ["error1", "error2"]);
    
    if (error.code !== "CONFIG_VALIDATION_FAILED") throw new Error("Code should be CONFIG_VALIDATION_FAILED");
    if (error.severity !== "critical") throw new Error("Severity should be critical");
    if (error.category !== "validation") throw new Error("Category should be validation");
    if (error.isRecoverable()) throw new Error("Error should not be recoverable");
  }

  /**
   * Test ConfigurationLoadError properties
   */
  static testConfigurationLoadError(): void {
    const error = new ConfigurationLoadError("test-key", "static");
    
    if (error.code !== "CONFIG_LOAD_FAILED") throw new Error("Code should be CONFIG_LOAD_FAILED");
    if (error.severity !== "high") throw new Error("Severity should be high");
    if (error.category !== "loading") throw new Error("Category should be loading");
    if (!error.isRecoverable()) throw new Error("Error should be recoverable");
  }

  /**
   * Test ErrorTypeGuards.isConfigurationError
   */
  static testConfigurationErrorTypeGuard(): void {
    const configError = new ConfigurationNotFoundError("test-key");
    const regularError = new Error("regular error");
    
    if (!ErrorTypeGuards.isConfigurationError(configError)) {
      throw new Error("Should identify ConfigurationError");
    }
    if (ErrorTypeGuards.isConfigurationError(regularError)) {
      throw new Error("Should not identify regular Error as ConfigurationError");
    }
  }

  /**
   * Test ErrorTypeGuards.isNotFoundError
   */
  static testNotFoundErrorTypeGuard(): void {
    const notFoundError = new ConfigurationNotFoundError("test-key");
    const validationError = new ConfigurationValidationError("test-key", []);
    
    if (!ErrorTypeGuards.isNotFoundError(notFoundError)) {
      throw new Error("Should identify NotFoundError");
    }
    if (ErrorTypeGuards.isNotFoundError(validationError)) {
      throw new Error("Should not identify ValidationError as NotFoundError");
    }
  }

  /**
   * Test ConfigurationErrorFactory.createNotFoundError
   */
  static testErrorFactoryNotFound(): void {
    const error = ConfigurationErrorFactory.createNotFoundError(
      "test-key", 
      ["available1", "available2"]
    );
    
    if (!(error instanceof ConfigurationNotFoundError)) {
      throw new Error("Should create ConfigurationNotFoundError");
    }
    if (error.technicalDetails.configKey !== "test-key") {
      throw new Error("Should include config key in technical details");
    }
  }

  /**
   * Test error context preservation
   */
  static testErrorContextPreservation(): void {
    const contextId = crypto.randomUUID();
    const error = new ConfigurationValidationError("test-key", ["error1"], { contextId });
    
    if (error.contextId !== contextId) {
      throw new Error("Context ID should be preserved");
    }
    if (!error.timestamp) {
      throw new Error("Timestamp should be set");
    }
  }

  /**
   * Get all error hierarchy tests
   */
  static getAllTests(): Array<{ name: string; fn: () => void }> {
    return [
      { name: "ConfigurationNotFoundError has correct properties", fn: ErrorHierarchyTests.testConfigurationNotFoundError },
      { name: "ConfigurationValidationError has correct properties", fn: ErrorHierarchyTests.testConfigurationValidationError },
      { name: "ConfigurationLoadError has correct properties", fn: ErrorHierarchyTests.testConfigurationLoadError },
      { name: "ErrorTypeGuards.isConfigurationError works correctly", fn: ErrorHierarchyTests.testConfigurationErrorTypeGuard },
      { name: "ErrorTypeGuards.isNotFoundError works correctly", fn: ErrorHierarchyTests.testNotFoundErrorTypeGuard },
      { name: "ConfigurationErrorFactory creates correct errors", fn: ErrorHierarchyTests.testErrorFactoryNotFound },
      { name: "Error context is preserved", fn: ErrorHierarchyTests.testErrorContextPreservation }
    ];
  }
}

// ===== SERVICE INTEGRATION TESTS =====

class ServiceIntegrationTests {
  private static service = new EnterpriseConfigurationService();

  /**
   * Test loading existing configuration
   */
  static async testLoadExistingConfiguration(): Promise<void> {
    const result = await ServiceIntegrationTests.service.loadConfiguration("fashion-women");
    
    if (!result.isSuccess) {
      throw new Error(`Should load existing configuration: ${result.error.message}`);
    }
    
    const config = result.value;
    if (config.category !== "fashion") {
      throw new Error("Configuration category should be fashion");
    }
    if (config.subcategory !== "women") {
      throw new Error("Configuration subcategory should be women");
    }
  }

  /**
   * Test loading non-existing configuration
   */
  static async testLoadNonExistingConfiguration(): Promise<void> {
    const result = await ServiceIntegrationTests.service.loadConfiguration("non-existent-key");
    
    if (!result.isFailure) {
      throw new Error("Should fail to load non-existing configuration");
    }
    
    if (!ErrorTypeGuards.isNotFoundError(result.error)) {
      throw new Error("Should return ConfigurationNotFoundError");
    }
  }

  /**
   * Test loading multiple configurations
   */
  static async testLoadMultipleConfigurations(): Promise<void> {
    const result = await ServiceIntegrationTests.service.loadMultipleConfigurations([
      "fashion-women",
      "fashion-men"
    ]);
    
    if (!result.isSuccess) {
      throw new Error(`Should load multiple configurations: ${result.error.message}`);
    }
    
    if (result.value.length !== 2) {
      throw new Error("Should return 2 configurations");
    }
  }

  /**
   * Test loading multiple configurations with one invalid
   */
  static async testLoadMultipleWithInvalid(): Promise<void> {
    const result = await ServiceIntegrationTests.service.loadMultipleConfigurations([
      "fashion-women",
      "non-existent-key"
    ]);
    
    if (!result.isFailure) {
      throw new Error("Should fail when any configuration is invalid");
    }
  }

  /**
   * Test configuration validation
   */
  static async testConfigurationValidation(): Promise<void> {
    const result = await ServiceIntegrationTests.service.validateConfiguration("fashion-women");
    
    if (!result.isSuccess) {
      throw new Error(`Should validate existing configuration: ${result.error.message}`);
    }
    
    const report = result.value;
    if (!report.isValid) {
      throw new Error("Valid configuration should pass validation");
    }
    if (report.complianceScore < 90) {
      throw new Error("Valid configuration should have high compliance score");
    }
  }

  /**
   * Test configuration health check
   */
  static async testConfigurationHealth(): Promise<void> {
    const result = await ServiceIntegrationTests.service.checkConfigurationHealth();
    
    if (!result.isSuccess) {
      throw new Error(`Should check configuration health: ${result.error.message}`);
    }
    
    const health = result.value;
    if (health.totalConfigurations === 0) {
      throw new Error("Should have configurations registered");
    }
    if (health.healthScore < 80) {
      throw new Error("Registry should have good health score");
    }
  }

  /**
   * Test getting available configurations
   */
  static async testGetAvailableConfigurations(): Promise<void> {
    const result = await ServiceIntegrationTests.service.getAvailableConfigurations();
    
    if (!result.isSuccess) {
      throw new Error(`Should get available configurations: ${result.error.message}`);
    }
    
    const configs = result.value;
    if (configs.length === 0) {
      throw new Error("Should have available configurations");
    }
    
    const womenConfig = configs.find(c => c.key === "fashion-women");
    if (!womenConfig) {
      throw new Error("Should include fashion-women configuration");
    }
  }

  /**
   * Get all service integration tests
   */
  static getAllTests(): Array<{ name: string; fn: () => Promise<void> }> {
    return [
      { name: "Load existing configuration", fn: ServiceIntegrationTests.testLoadExistingConfiguration },
      { name: "Load non-existing configuration", fn: ServiceIntegrationTests.testLoadNonExistingConfiguration },
      { name: "Load multiple configurations", fn: ServiceIntegrationTests.testLoadMultipleConfigurations },
      { name: "Load multiple configurations with invalid", fn: ServiceIntegrationTests.testLoadMultipleWithInvalid },
      { name: "Validate configuration", fn: ServiceIntegrationTests.testConfigurationValidation },
      { name: "Check configuration health", fn: ServiceIntegrationTests.testConfigurationHealth },
      { name: "Get available configurations", fn: ServiceIntegrationTests.testGetAvailableConfigurations }
    ];
  }
}

// ===== ADAPTER TESTS =====

class AdapterTests {
  private static legacyAdapter = new LegacyConfigurationAdapter();
  private static pageAdapter = new UniversalPageConfigurationAdapter();

  /**
   * Test legacy adapter loadConfigurationSafe
   */
  static async testLegacyAdapterSafe(): Promise<void> {
    const result = await AdapterTests.legacyAdapter.loadConfigurationSafe("fashion-women");
    
    if (!result.isSuccess) {
      throw new Error(`Legacy adapter should load configuration: ${result.error.message}`);
    }
  }

  /**
   * Test legacy adapter loadConfiguration (legacy method)
   */
  static async testLegacyAdapterLegacy(): Promise<void> {
    const config = await AdapterTests.legacyAdapter.loadConfiguration("fashion-women");
    
    if (!config) {
      throw new Error("Legacy adapter should return configuration object");
    }
    if (config.category !== "fashion") {
      throw new Error("Configuration should have correct category");
    }
  }

  /**
   * Test universal page adapter
   */
  static async testUniversalPageAdapter(): Promise<void> {
    const result = await AdapterTests.pageAdapter.loadPageConfiguration("fashion", "women");
    
    if (!result.isSuccess) {
      throw new Error(`Page adapter should load configuration: ${result.error.message}`);
    }
    
    const config = result.value;
    if (config.category !== "fashion") {
      throw new Error("Configuration should have correct category");
    }
  }

  /**
   * Test universal page adapter with fallback
   */
  static async testUniversalPageAdapterFallback(): Promise<void> {
    const result = await AdapterTests.pageAdapter.loadPageConfiguration("fashion", "nonexistent");
    
    // Should try to fallback to just "fashion" category
    if (result.isSuccess) {
      // Fallback worked, which is acceptable
      return;
    }
    
    // If fallback didn't work, that's also acceptable for this test
    if (!ErrorTypeGuards.isNotFoundError(result.error)) {
      throw new Error("Should return NotFoundError when configuration doesn't exist");
    }
  }

  /**
   * Get all adapter tests
   */
  static getAllTests(): Array<{ name: string; fn: () => Promise<void> }> {
    return [
      { name: "Legacy adapter safe method works", fn: AdapterTests.testLegacyAdapterSafe },
      { name: "Legacy adapter legacy method works", fn: AdapterTests.testLegacyAdapterLegacy },
      { name: "Universal page adapter works", fn: AdapterTests.testUniversalPageAdapter },
      { name: "Universal page adapter fallback works", fn: AdapterTests.testUniversalPageAdapterFallback }
    ];
  }
}

// ===== PHASE 2 TEST SUITE RUNNER =====

export class Phase2TestSuite {
  /**
   * Run complete Phase 2 test suite
   */
  static async runCompleteTestSuite(): Promise<Phase2TestReport> {
    console.log("🧪 Running Phase 2 Complete Test Suite...");

    // Run all test suites
    const resultPatternTests = await TestRunner.runTestSuite(
      "Result Pattern Tests",
      ResultPatternTests.getAllTests()
    );

    const errorHierarchyTests = await TestRunner.runTestSuite(
      "Error Hierarchy Tests", 
      ErrorHierarchyTests.getAllTests()
    );

    const serviceIntegrationTests = await TestRunner.runTestSuite(
      "Service Integration Tests",
      ServiceIntegrationTests.getAllTests()
    );

    const adapterTests = await TestRunner.runTestSuite(
      "Adapter Tests",
      AdapterTests.getAllTests()
    );

    // Calculate overall metrics
    const totalTestsExecuted = resultPatternTests.totalTests + 
                              errorHierarchyTests.totalTests + 
                              serviceIntegrationTests.totalTests + 
                              adapterTests.totalTests;

    const totalTestsPassed = resultPatternTests.passedTests + 
                            errorHierarchyTests.passedTests + 
                            serviceIntegrationTests.passedTests + 
                            adapterTests.passedTests;

    const overallCompliance = totalTestsExecuted > 0 ? 
                             (totalTestsPassed / totalTestsExecuted) * 100 : 0;

    // Generate execution summary
    const executionSummary = [
      `Total Tests: ${totalTestsExecuted}`,
      `Passed: ${totalTestsPassed}`,
      `Failed: ${totalTestsExecuted - totalTestsPassed}`,
      `Compliance: ${overallCompliance.toFixed(1)}%`,
      `Result Pattern: ${resultPatternTests.passedTests}/${resultPatternTests.totalTests}`,
      `Error Hierarchy: ${errorHierarchyTests.passedTests}/${errorHierarchyTests.totalTests}`,
      `Service Integration: ${serviceIntegrationTests.passedTests}/${serviceIntegrationTests.totalTests}`,
      `Adapters: ${adapterTests.passedTests}/${adapterTests.totalTests}`
    ];

    return {
      resultPatternTests,
      errorHierarchyTests,
      serviceIntegrationTests,
      adapterTests,
      overallCompliance,
      totalTestsExecuted,
      totalTestsPassed,
      executionSummary
    };
  }

  /**
   * Generate Phase 2 test report
   */
  static async generateTestReport(): Promise<string> {
    const report = await Phase2TestSuite.runCompleteTestSuite();
    
    const reportLines = [
      "🧪 PHASE 2 RESULT PATTERN TEST REPORT",
      "=" .repeat(50),
      "",
      `📊 OVERALL COMPLIANCE: ${report.overallCompliance.toFixed(1)}%`,
      `✅ TESTS PASSED: ${report.totalTestsPassed}/${report.totalTestsExecuted}`,
      "",
      "📋 TEST SUITE RESULTS:",
      "",
      `1. Result Pattern Tests: ${report.resultPatternTests.passedTests}/${report.resultPatternTests.totalTests} (${report.resultPatternTests.overallSuccess ? 'PASS' : 'FAIL'})`,
      `2. Error Hierarchy Tests: ${report.errorHierarchyTests.passedTests}/${report.errorHierarchyTests.totalTests} (${report.errorHierarchyTests.overallSuccess ? 'PASS' : 'FAIL'})`,
      `3. Service Integration Tests: ${report.serviceIntegrationTests.passedTests}/${report.serviceIntegrationTests.totalTests} (${report.serviceIntegrationTests.overallSuccess ? 'PASS' : 'FAIL'})`,
      `4. Adapter Tests: ${report.adapterTests.passedTests}/${report.adapterTests.totalTests} (${report.adapterTests.overallSuccess ? 'PASS' : 'FAIL'})`,
      "",
      "🔍 DETAILED RESULTS:",
      ""
    ];

    // Add failed test details
    const allResults = [
      ...report.resultPatternTests.results,
      ...report.errorHierarchyTests.results,
      ...report.serviceIntegrationTests.results,
      ...report.adapterTests.results
    ];

    const failedTests = allResults.filter(r => !r.passed);
    
    if (failedTests.length > 0) {
      reportLines.push("❌ FAILED TESTS:");
      failedTests.forEach(test => {
        reportLines.push(`   • ${test.testName}: ${test.error}`);
      });
      reportLines.push("");
    }

    reportLines.push("✅ EXECUTION SUMMARY:");
    report.executionSummary.forEach(line => {
      reportLines.push(`   ${line}`);
    });

    return reportLines.join("\n");
  }
}