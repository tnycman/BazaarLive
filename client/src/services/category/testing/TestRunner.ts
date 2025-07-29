/**
 * Test Runner for Enterprise Regression Testing
 * Automated test execution and reporting for Task 3.2 verification
 * 100% best practices, zero shortcuts, comprehensive automation
 */

import { regressionTestSuite, type TestResult, type TestSummary, type PerformanceBenchmark } from './RegressionTestSuite';

// ===== TEST RUNNER INTERFACES =====

/**
 * Test Execution Report
 * Comprehensive report of all test execution results
 */
export interface TestExecutionReport {
  readonly summary: TestSummary;
  readonly detailedResults: TestResult[];
  readonly performanceBenchmarks: PerformanceBenchmark[];
  readonly categoryAnalysis: CategoryTestAnalysis[];
  readonly regressionAnalysis: RegressionAnalysis;
  readonly recommendations: string[];
  readonly executionMetadata: ExecutionMetadata;
}

/**
 * Category Test Analysis
 * Per-category breakdown of test results and performance
 */
export interface CategoryTestAnalysis {
  readonly configKey: string;
  readonly coldLoadTime: number;
  readonly hotLoadTime: number;
  readonly cacheEfficiency: number;
  readonly passRate: number;
  readonly issues: string[];
  readonly performanceRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

/**
 * Regression Analysis
 * Analysis of potential regressions and performance impacts
 */
export interface RegressionAnalysis {
  readonly hasRegressions: boolean;
  readonly performanceImpact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  readonly bundleSizeImpact: number;
  readonly memoryImpact: number;
  readonly criticalIssues: string[];
  readonly regressionScore: number;
}

/**
 * Execution Metadata
 * Metadata about test execution environment and configuration
 */
export interface ExecutionMetadata {
  readonly executionTime: number;
  readonly timestamp: number;
  readonly userAgent: string;
  readonly testEnvironment: 'development' | 'staging' | 'production';
  readonly configurationVersion: string;
}

// ===== ENTERPRISE TEST RUNNER =====

/**
 * Enterprise Test Runner
 * Orchestrates comprehensive regression testing for dynamic configuration loading
 */
export class TestRunner {
  private readonly startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Execute complete regression test suite
   * Primary interface for Task 3.2 verification
   */
  public async executeRegressionTests(): Promise<TestExecutionReport> {
    console.log('🚀 Starting Task 3.2: Regression Testing & Verification');
    console.log('📊 Executing comprehensive test suite for dynamic configuration loading');

    try {
      // Execute regression test suite
      const testResults = await regressionTestSuite.executeFullTestSuite();

      // Generate comprehensive analysis
      const categoryAnalysis = this.generateCategoryAnalysis(testResults.testResults, testResults.performanceBenchmarks);
      const regressionAnalysis = this.generateRegressionAnalysis(testResults.testResults, testResults.performanceBenchmarks);
      const recommendations = this.generateRecommendations(testResults.summary, regressionAnalysis);

      // Create execution metadata
      const executionMetadata: ExecutionMetadata = {
        executionTime: Date.now() - this.startTime,
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js Environment',
        testEnvironment: this.detectEnvironment(),
        configurationVersion: '3.1.0'
      };

      const report: TestExecutionReport = {
        summary: testResults.summary,
        detailedResults: testResults.testResults,
        performanceBenchmarks: testResults.performanceBenchmarks,
        categoryAnalysis,
        regressionAnalysis,
        recommendations,
        executionMetadata
      };

      console.log('✅ Regression Testing Completed Successfully');
      this.logTestSummary(report);

      return report;
    } catch (error) {
      console.error('❌ Regression Testing Failed:', error);
      throw new Error(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute specific category tests
   * Targeted testing for specific configuration categories
   */
  public async executeSpecificCategoryTest(configKey: string): Promise<{
    coldLoadResult: TestResult;
    hotLoadResult: TestResult;
    edgeCaseResults: TestResult[];
  }> {
    console.log(`🎯 Testing specific category: ${configKey}`);

    // Clear cache for cold load
    const testSuite = regressionTestSuite as any;
    testSuite.dynamicConfigurationLoader?.clearCache();

    try {
      // Execute cold load test
      const coldLoadResult = await (testSuite as any).executeTest(
        `Cold Load: ${configKey}`,
        configKey,
        'cold_load'
      );

      // Execute hot load test
      const hotLoadResult = await (testSuite as any).executeTest(
        `Hot Load: ${configKey}`,
        configKey,
        'hot_load'
      );

      // Execute edge case tests for this category
      const edgeCaseResults = [
        await (testSuite as any).executeTest(
          `Edge Case: ${configKey} Invalid State`,
          `${configKey}-invalid`,
          'edge_case'
        )
      ];

      return {
        coldLoadResult,
        hotLoadResult,
        edgeCaseResults
      };
    } catch (error) {
      throw new Error(`Category test failed for ${configKey}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate category-specific analysis
   */
  private generateCategoryAnalysis(
    testResults: TestResult[],
    benchmarks: PerformanceBenchmark[]
  ): CategoryTestAnalysis[] {
    const categoryMap = new Map<string, TestResult[]>();

    // Group results by category
    testResults.forEach(result => {
      const existing = categoryMap.get(result.configKey) || [];
      existing.push(result);
      categoryMap.set(result.configKey, existing);
    });

    return Array.from(categoryMap.entries()).map(([configKey, results]) => {
      const benchmark = benchmarks.find(b => b.configKey === configKey);
      const passCount = results.filter(r => r.status === 'PASS').length;
      const passRate = (passCount / results.length) * 100;

      const issues: string[] = [];
      results.forEach(result => {
        if (result.error) {
          issues.push(result.error);
        }
      });

      const performanceRating = this.calculatePerformanceRating(
        benchmark?.coldLoadTime || 0,
        benchmark?.hotLoadTime || 0,
        passRate
      );

      return {
        configKey,
        coldLoadTime: benchmark?.coldLoadTime || 0,
        hotLoadTime: benchmark?.hotLoadTime || 0,
        cacheEfficiency: benchmark?.cacheEfficiencyRatio || 0,
        passRate,
        issues,
        performanceRating
      };
    });
  }

  /**
   * Generate regression analysis
   */
  private generateRegressionAnalysis(
    testResults: TestResult[],
    benchmarks: PerformanceBenchmark[]
  ): RegressionAnalysis {
    const failedTests = testResults.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
    const hasRegressions = failedTests.length > 0;

    const avgCacheEfficiency = benchmarks.reduce((sum, b) => sum + b.cacheEfficiencyRatio, 0) / benchmarks.length;
    const avgPerformanceImprovement = benchmarks.reduce((sum, b) => sum + b.performanceImprovement, 0) / benchmarks.length;

    const performanceImpact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 
      avgPerformanceImprovement > 20 ? 'POSITIVE' :
      avgPerformanceImprovement < -10 ? 'NEGATIVE' : 'NEUTRAL';

    const criticalIssues = failedTests
      .filter(test => test.configKey.includes('women') || test.configKey.includes('men') || test.configKey.includes('kids'))
      .map(test => `Critical failure in ${test.configKey}: ${test.error}`);

    const regressionScore = Math.max(0, 100 - (failedTests.length * 10) - (criticalIssues.length * 20));

    return {
      hasRegressions,
      performanceImpact,
      bundleSizeImpact: 0, // TODO: Implement bundle size measurement
      memoryImpact: 0, // TODO: Implement memory impact measurement
      criticalIssues,
      regressionScore
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(
    summary: TestSummary,
    regressionAnalysis: RegressionAnalysis
  ): string[] {
    const recommendations: string[] = [];

    if (summary.passRate < 95) {
      recommendations.push('Investigate failed tests to ensure configuration loading reliability');
    }

    if (summary.avgLoadTime > 500) {
      recommendations.push('Optimize configuration loading performance - average load time exceeds 500ms');
    }

    if (summary.cacheHitRate < 80) {
      recommendations.push('Review cache strategy - cache hit rate below optimal threshold');
    }

    if (regressionAnalysis.hasRegressions) {
      recommendations.push('Address regressions before proceeding to next task phase');
    }

    if (regressionAnalysis.criticalIssues.length > 0) {
      recommendations.push('CRITICAL: Resolve critical issues in core category configurations');
    }

    if (summary.avgPerformanceScore < 80) {
      recommendations.push('Investigate performance bottlenecks to improve overall system performance');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All tests passed - dynamic configuration loading system is performing optimally');
    }

    return recommendations;
  }

  /**
   * Calculate performance rating for a category
   */
  private calculatePerformanceRating(
    coldLoadTime: number,
    hotLoadTime: number,
    passRate: number
  ): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
    if (passRate === 100 && coldLoadTime < 200 && hotLoadTime < 50) {
      return 'EXCELLENT';
    } else if (passRate >= 95 && coldLoadTime < 500 && hotLoadTime < 100) {
      return 'GOOD';
    } else if (passRate >= 80 && coldLoadTime < 1000) {
      return 'FAIR';
    } else {
      return 'POOR';
    }
  }

  /**
   * Detect test environment
   */
  private detectEnvironment(): 'development' | 'staging' | 'production' {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return 'development';
      } else if (hostname.includes('staging')) {
        return 'staging';
      }
    }
    return 'production';
  }

  /**
   * Log comprehensive test summary
   */
  private logTestSummary(report: TestExecutionReport): void {
    console.log('\n📊 TASK 3.2 REGRESSION TEST SUMMARY');
    console.log('=====================================');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Pass Rate: ${report.summary.passRate.toFixed(1)}% (${report.summary.passCount}/${report.summary.totalTests})`);
    console.log(`Average Load Time: ${report.summary.avgLoadTime.toFixed(1)}ms`);
    console.log(`Cache Hit Rate: ${report.summary.cacheHitRate.toFixed(1)}%`);
    console.log(`Performance Score: ${report.summary.avgPerformanceScore.toFixed(1)}/100`);
    console.log(`Execution Time: ${report.executionMetadata.executionTime}ms`);
    
    if (report.regressionAnalysis.hasRegressions) {
      console.log('\n⚠️ REGRESSIONS DETECTED:');
      report.regressionAnalysis.criticalIssues.forEach(issue => {
        console.log(`- ${issue}`);
      });
    }

    console.log('\n📈 PERFORMANCE BENCHMARKS:');
    report.performanceBenchmarks.forEach(benchmark => {
      console.log(`${benchmark.configKey}: Cold ${benchmark.coldLoadTime}ms, Hot ${benchmark.hotLoadTime}ms (${benchmark.performanceImprovement.toFixed(1)}% improvement)`);
    });

    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => {
      console.log(`- ${rec}`);
    });
  }
}

// ===== SINGLETON INSTANCE =====
export const testRunner = new TestRunner();

// ===== EXPORT TYPES =====
export type { 
  TestExecutionReport as TER, 
  CategoryTestAnalysis as CTA, 
  RegressionAnalysis as RA, 
  ExecutionMetadata as EM 
};