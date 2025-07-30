/**
 * Design Standards Enforcer
 * Enterprise AOP-compliant design enforcement with comprehensive validation
 * 100% best practices, zero shortcuts, enterprise-grade compliance
 */

import { enterpriseDesignStandardsManager } from '@/services/design/EnterpriseDesignStandardsManager';
import { productCardStandardizationAspect } from '@/services/aop/ProductCardStandardizationAspect';

// ===== ENTERPRISE TYPE DEFINITIONS =====

interface EnforcementResult {
  readonly componentName: string;
  readonly violations: readonly string[];
  readonly correctionsMade: readonly string[];
  readonly isCompliant: boolean;
  readonly enforcementTimestamp: string;
}

interface ComplianceReport {
  readonly totalComponentsAudited: number;
  readonly compliantComponents: number;
  readonly nonCompliantComponents: number;
  readonly compliancePercentage: number;
  readonly standardsApplied: readonly string[];
  readonly enforcementResults: readonly EnforcementResult[];
  readonly reportTimestamp: string;
}

// ===== ENTERPRISE DESIGN STANDARDS ENFORCER =====

/**
 * Enterprise Design Standards Enforcer
 * Central enforcement engine for design standards across all components
 */
export class DesignStandardsEnforcer {
  private static instance: DesignStandardsEnforcer | null = null;
  private readonly enforcementHistory: EnforcementResult[] = [];
  private readonly enforcedComponents = new Set<string>();

  private constructor() {
    console.log('[DesignStandardsEnforcer] Initialized enterprise design enforcement');
  }

  /**
   * Singleton instance getter
   */
  public static getInstance(): DesignStandardsEnforcer {
    if (!DesignStandardsEnforcer.instance) {
      DesignStandardsEnforcer.instance = new DesignStandardsEnforcer();
    }
    return DesignStandardsEnforcer.instance;
  }

  /**
   * Enforce standards on a specific component with comprehensive validation
   */
  public enforceComponentStandards(componentName: string): EnforcementResult {
    const violations: string[] = [];
    const correctionsMade: string[] = [];

    console.log(`[DesignStandardsEnforcer] Enforcing standards on ${componentName}`);

    try {
      // Apply product card standardization
      if (this.isProductCardComponent(componentName)) {
        const paddingStandard = enterpriseDesignStandardsManager.getProductCardPaddingClass();
        
        // Check if component uses correct padding
        if (!this.enforcedComponents.has(componentName)) {
          productCardStandardizationAspect.applyStandardization(componentName);
          correctionsMade.push(`Applied padding standard: ${paddingStandard}`);
          
          // Mark as enforced
          this.enforcedComponents.add(componentName);
        }

        // Validate compliance
        const isCompliant = productCardStandardizationAspect.validateCompliance(componentName);
        if (!isCompliant) {
          violations.push('Product card padding not standardized');
        }
      }

      const result: EnforcementResult = {
        componentName,
        violations,
        correctionsMade,
        isCompliant: violations.length === 0,
        enforcementTimestamp: new Date().toISOString()
      };

      this.enforcementHistory.push(result);

      console.log(
        `[DesignStandardsEnforcer] Component ${componentName}: ${violations.length} violations, ${correctionsMade.length} corrections`
      );

      return result;
      
    } catch (error) {
      const errorResult: EnforcementResult = {
        componentName,
        violations: [`Enforcement failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        correctionsMade: [],
        isCompliant: false,
        enforcementTimestamp: new Date().toISOString()
      };

      this.enforcementHistory.push(errorResult);
      return errorResult;
    }
  }

  /**
   * Enforce standards across multiple components
   */
  public enforceBulkStandards(componentNames: readonly string[]): ComplianceReport {
    const enforcementResults: EnforcementResult[] = [];
    const standardsApplied: string[] = [];

    console.log(`[DesignStandardsEnforcer] Bulk enforcing standards on ${componentNames.length} components`);

    // Enforce standards on each component
    for (const componentName of componentNames) {
      const result = this.enforceComponentStandards(componentName);
      enforcementResults.push(result);
      
      // Collect applied standards
      result.correctionsMade.forEach(correction => {
        if (!standardsApplied.includes(correction)) {
          standardsApplied.push(correction);
        }
      });
    }

    // Calculate compliance metrics
    const compliantComponents = enforcementResults.filter(r => r.isCompliant).length;
    const nonCompliantComponents = enforcementResults.length - compliantComponents;
    const compliancePercentage = enforcementResults.length > 0 
      ? (compliantComponents / enforcementResults.length) * 100 
      : 100;

    const complianceReport: ComplianceReport = {
      totalComponentsAudited: enforcementResults.length,
      compliantComponents,
      nonCompliantComponents,
      compliancePercentage,
      standardsApplied,
      enforcementResults,
      reportTimestamp: new Date().toISOString()
    };

    console.log(
      `[DesignStandardsEnforcer] Bulk enforcement complete: ${compliancePercentage.toFixed(1)}% compliance`
    );

    return complianceReport;
  }

  /**
   * Determine if component is a product card type
   */
  private isProductCardComponent(componentName: string): boolean {
    const productCardPatterns = [
      'ProductCard',
      'ListingCard', 
      'ItemCard',
      'EnterpriseProductCard',
      'SimpleProductCard',
      'UniversalProductCard',
      'FeedCard',
      'MarketplaceCard'
    ];

    return productCardPatterns.some(pattern => 
      componentName.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Generate comprehensive enforcement report
   */
  public generateEnforcementReport(): string {
    const totalEnforcements = this.enforcementHistory.length;
    const successfulEnforcements = this.enforcementHistory.filter(r => r.isCompliant).length;
    const totalViolations = this.enforcementHistory.reduce(
      (sum, result) => sum + result.violations.length, 
      0
    );
    const totalCorrections = this.enforcementHistory.reduce(
      (sum, result) => sum + result.correctionsMade.length, 
      0
    );

    return `
=== DESIGN STANDARDS ENFORCEMENT REPORT ===
Generated: ${new Date().toISOString()}

ENFORCEMENT OVERVIEW:
- Total Enforcements: ${totalEnforcements}
- Successful Enforcements: ${successfulEnforcements}
- Total Violations Detected: ${totalViolations}
- Total Corrections Applied: ${totalCorrections}
- Enforcement Success Rate: ${totalEnforcements > 0 ? (successfulEnforcements / totalEnforcements * 100).toFixed(1) : 100}%

ENFORCED COMPONENTS:
${Array.from(this.enforcedComponents).map(name => `- ${name}`).join('\n')}

RECENT ENFORCEMENT ACTIONS:
${this.enforcementHistory.slice(-10).map(result => 
  `- ${result.componentName}: ${result.violations.length} violations, ${result.correctionsMade.length} corrections (${result.enforcementTimestamp})`
).join('\n')}

DESIGN STANDARD COMPLIANCE:
- Product Card Padding: ${enterpriseDesignStandardsManager.getProductCardPaddingClass()}
- Components Standardized: ${this.enforcedComponents.size}
- Enforcement Mode: Enterprise Strict Compliance

STANDARDIZATION METRICS:
${productCardStandardizationAspect.generateComplianceReport()}
    `.trim();
  }

  /**
   * Apply enterprise standardization to all known product card components
   */
  public standardizeAllProductCards(): ComplianceReport {
    const knownProductCardComponents = [
      'EnterpriseProductCard',
      'SimpleCategoryPage',
      'UniversalCategoryPage', 
      'ListingCard',
      'FeedCard',
      'MarketplaceCard'
    ];

    console.log('[DesignStandardsEnforcer] Standardizing all product card components');
    
    return this.enforceBulkStandards(knownProductCardComponents);
  }

  /**
   * Get enforcement history for audit purposes
   */
  public getEnforcementHistory(): readonly EnforcementResult[] {
    return [...this.enforcementHistory];
  }

  /**
   * Check if component is already enforced
   */
  public isComponentEnforced(componentName: string): boolean {
    return this.enforcedComponents.has(componentName);
  }

  /**
   * Mark component as manually enforced (for legacy components)
   */
  public markComponentEnforced(componentName: string): void {
    this.enforcedComponents.add(componentName);
    console.log(`[DesignStandardsEnforcer] Manually marked ${componentName} as enforced`);
  }
}

// ===== ENTERPRISE DESIGN ENFORCEMENT SINGLETON =====
export const designStandardsEnforcer = DesignStandardsEnforcer.getInstance();

// ===== UTILITY FUNCTIONS FOR IMMEDIATE ENFORCEMENT =====

/**
 * Enterprise utility to enforce standards on component immediately
 */
export function enforceDesignStandards(componentName: string): EnforcementResult {
  return designStandardsEnforcer.enforceComponentStandards(componentName);
}

/**
 * Enterprise utility to standardize all product cards immediately
 */
export function standardizeAllProductCards(): ComplianceReport {
  return designStandardsEnforcer.standardizeAllProductCards();
}

/**
 * Enterprise utility to generate immediate compliance report
 */
export function generateComplianceReport(): string {
  return designStandardsEnforcer.generateEnforcementReport();
}

// ===== TYPE EXPORTS =====
export type {
  EnforcementResult,
  ComplianceReport
};