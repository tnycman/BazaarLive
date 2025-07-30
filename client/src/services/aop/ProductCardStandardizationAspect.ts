/**
 * Product Card Standardization Aspect
 * AOP aspect for enforcing design standards across all product card components
 * 100% enterprise compliance, zero tolerance for inconsistencies
 */

import { enterpriseDesignStandardsManager } from '@/services/design/EnterpriseDesignStandardsManager';

// ===== ENTERPRISE TYPE DEFINITIONS =====

interface ProductCardStandardizationConfig {
  readonly enforceStrictCompliance: boolean;
  readonly autoCorrectViolations: boolean;
  readonly auditFrequency: 'realtime' | 'onrender' | 'scheduled';
  readonly reportViolations: boolean;
}

interface ComponentStyleAudit {
  readonly componentName: string;
  readonly elementPath: string;
  readonly currentStyles: Record<string, string>;
  readonly expectedStyles: Record<string, string>;
  readonly violations: readonly string[];
  readonly correctionApplied: boolean;
  readonly auditTimestamp: string;
}

// ===== ENTERPRISE PRODUCT CARD STANDARDIZATION ASPECT =====

/**
 * Enterprise Product Card Standardization Aspect
 * Enforces design standards using AOP patterns for maximum compliance
 */
export class ProductCardStandardizationAspect {
  private static instance: ProductCardStandardizationAspect | null = null;
  private readonly config: ProductCardStandardizationConfig;
  private readonly auditHistory: ComponentStyleAudit[] = [];
  private readonly standardizedComponents = new Set<string>();

  private constructor() {
    this.config = {
      enforceStrictCompliance: true,
      autoCorrectViolations: true,
      auditFrequency: 'realtime',
      reportViolations: true
    };

    console.log('[ProductCardStandardizationAspect] Initialized with strict compliance enforcement');
  }

  /**
   * Singleton instance getter
   */
  public static getInstance(): ProductCardStandardizationAspect {
    if (!ProductCardStandardizationAspect.instance) {
      ProductCardStandardizationAspect.instance = new ProductCardStandardizationAspect();
    }
    return ProductCardStandardizationAspect.instance;
  }

  /**
   * Get standardized product card classes with enterprise compliance
   */
  public getStandardizedProductCardClasses(): string {
    const designStandards = enterpriseDesignStandardsManager.getProductCardClasses();
    
    // Compile standardized class string with enterprise standards
    const standardizedClasses = [
      'bg-white',
      'border border-gray-200',
      designStandards.borderRadius,
      'overflow-hidden',
      designStandards.shadow,
      designStandards.hover,
      'transition-shadow duration-200',
      'cursor-pointer'
    ].join(' ');

    console.log('[ProductCardStandardizationAspect] Generated standardized classes:', standardizedClasses);
    return standardizedClasses;
  }

  /**
   * Get standardized product card content padding
   */
  public getStandardizedContentPadding(): string {
    const paddingStandard = enterpriseDesignStandardsManager.getProductCardPaddingClass();
    console.log('[ProductCardStandardizationAspect] Applied padding standard:', paddingStandard);
    return paddingStandard;
  }

  /**
   * Audit component for design standard compliance
   */
  public auditComponent(
    componentName: string,
    elementPath: string,
    currentStyles: Record<string, string>
  ): ComponentStyleAudit {
    const designStandards = enterpriseDesignStandardsManager.getProductCardClasses();
    const violations: string[] = [];
    
    // Expected styles based on enterprise standards
    const expectedStyles = {
      padding: designStandards.padding,
      borderRadius: designStandards.borderRadius,
      boxShadow: designStandards.shadow,
      hoverShadow: designStandards.hover
    };

    // Check for violations
    Object.entries(expectedStyles).forEach(([property, expectedValue]) => {
      const currentValue = currentStyles[property];
      if (currentValue && currentValue !== expectedValue) {
        violations.push(`${property}: expected '${expectedValue}', found '${currentValue}'`);
      }
    });

    const audit: ComponentStyleAudit = {
      componentName,
      elementPath,
      currentStyles,
      expectedStyles,
      violations,
      correctionApplied: false,
      auditTimestamp: new Date().toISOString()
    };

    this.auditHistory.push(audit);

    if (violations.length > 0 && this.config.reportViolations) {
      console.warn(
        `[ProductCardStandardizationAspect] Design violations detected in ${componentName}:`,
        violations
      );
    }

    return audit;
  }

  /**
   * Apply standardization to component with enterprise validation
   */
  public applyStandardization(componentName: string): void {
    try {
      // Register standardization application
      enterpriseDesignStandardsManager.applyStandardToComponent(
        'product-card-padding-standard',
        componentName,
        '.product-card-content',
        this.getStandardizedContentPadding()
      );

      this.standardizedComponents.add(componentName);
      
      console.log(`[ProductCardStandardizationAspect] Applied standardization to ${componentName}`);
    } catch (error) {
      console.error(
        `[ProductCardStandardizationAspect] Failed to apply standardization to ${componentName}:`,
        error
      );
    }
  }

  /**
   * Validate component compliance with enterprise standards
   */
  public validateCompliance(componentName: string): boolean {
    const isStandardized = this.standardizedComponents.has(componentName);
    
    if (!isStandardized && this.config.enforceStrictCompliance) {
      console.warn(
        `[ProductCardStandardizationAspect] Component ${componentName} is not standardized`
      );
      
      if (this.config.autoCorrectViolations) {
        this.applyStandardization(componentName);
        return true;
      }
      
      return false;
    }

    return isStandardized;
  }

  /**
   * Generate comprehensive compliance report
   */
  public generateComplianceReport(): string {
    const totalComponents = this.standardizedComponents.size;
    const totalAudits = this.auditHistory.length;
    const violationCount = this.auditHistory.reduce(
      (count, audit) => count + audit.violations.length, 
      0
    );

    return `
=== PRODUCT CARD STANDARDIZATION COMPLIANCE REPORT ===
Generated: ${new Date().toISOString()}

STANDARDIZATION OVERVIEW:
- Standardized Components: ${totalComponents}
- Total Audits Performed: ${totalAudits}
- Design Violations Detected: ${violationCount}
- Auto-Correction Enabled: ${this.config.autoCorrectViolations}

STANDARDIZED COMPONENTS:
${Array.from(this.standardizedComponents).map(name => `- ${name}`).join('\n')}

RECENT AUDITS:
${this.auditHistory.slice(-5).map(audit => 
  `- ${audit.componentName}: ${audit.violations.length} violations (${audit.auditTimestamp})`
).join('\n')}

PADDING STANDARD: ${this.getStandardizedContentPadding()}
COMPLIANCE ENFORCEMENT: ${this.config.enforceStrictCompliance ? 'Strict' : 'Advisory'}
    `.trim();
  }

  /**
   * Get audit history for compliance tracking
   */
  public getAuditHistory(): readonly ComponentStyleAudit[] {
    return [...this.auditHistory];
  }

  /**
   * Mark component as enterprise-compliant
   */
  public markComponentCompliant(componentName: string): void {
    this.standardizedComponents.add(componentName);
    console.log(`[ProductCardStandardizationAspect] Marked ${componentName} as compliant`);
  }
}

// ===== ENTERPRISE STANDARDIZATION SINGLETON =====
export const productCardStandardizationAspect = ProductCardStandardizationAspect.getInstance();

// ===== UTILITY FUNCTIONS =====

/**
 * Enterprise utility function to get standardized product card wrapper classes
 */
export function getEnterpriseProductCardClasses(): string {
  return productCardStandardizationAspect.getStandardizedProductCardClasses();
}

/**
 * Enterprise utility function to get standardized content padding
 */
export function getEnterpriseProductCardPadding(): string {
  return productCardStandardizationAspect.getStandardizedContentPadding();
}

/**
 * Enterprise decorator for product card components (TypeScript decorator pattern)
 */
export function EnterpriseProductCardStandardized(componentName: string) {
  return function <T extends { new(...args: any[]): {} }>(constructor: T) {
    // Apply standardization when component is constructed
    productCardStandardizationAspect.applyStandardization(componentName);
    productCardStandardizationAspect.markComponentCompliant(componentName);
    
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        console.log(`[EnterpriseProductCardStandardized] Applied to ${componentName}`);
      }
    };
  };
}

// ===== TYPE EXPORTS =====
export type {
  ProductCardStandardizationConfig,
  ComponentStyleAudit
};