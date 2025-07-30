/**
 * Enterprise Validation Schemas
 * Runtime validation schemas for configuration integrity and compliance
 * Zero assumptions, comprehensive validation coverage
 */

import { z } from 'zod';
import { 
  UniversalPageConfigurationSchema,
  FilterConfigurationSchema,
  CategoryMetadataSchema 
} from './ConfigurationSchemas';

// ===== VALIDATION CONTEXT SCHEMAS =====

export const ValidationContextSchema = z.object({
  validationType: z.enum(['runtime', 'compile-time', 'integration', 'compliance']),
  validationLevel: z.enum(['basic', 'standard', 'strict', 'enterprise']),
  enforceStrictTypes: z.boolean().default(true),
  allowLegacySupport: z.boolean().default(false),
  validationEnvironment: z.enum(['development', 'staging', 'production']),
  validatorVersion: z.string().default('1.0.0'),
  validationTimestamp: z.string().datetime(),
  contextId: z.string().uuid()
});

// ===== VALIDATION RESULT SCHEMAS =====

export const ValidationErrorSchema = z.object({
  errorCode: z.string().min(1),
  errorMessage: z.string().min(1),
  fieldPath: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['type', 'business-rule', 'constraint', 'format', 'security']),
  suggestedFix: z.string().optional(),
  relatedErrors: z.array(z.string()).default([]),
  validationContext: z.string().optional()
});

export const ValidationWarningSchema = z.object({
  warningCode: z.string().min(1),
  warningMessage: z.string().min(1),
  fieldPath: z.string().min(1),
  severity: z.enum(['info', 'notice', 'warning']),
  recommendation: z.string().optional(),
  impact: z.enum(['none', 'performance', 'usability', 'maintenance']).default('none')
});

export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  validationId: z.string().uuid(),
  validatedAt: z.string().datetime(),
  validationContext: ValidationContextSchema,
  errors: z.array(ValidationErrorSchema).default([]),
  warnings: z.array(ValidationWarningSchema).default([]),
  complianceScore: z.number().min(0).max(100),
  performanceMetrics: z.object({
    validationTime: z.number().min(0),
    memoryUsage: z.number().min(0),
    complexityScore: z.number().min(0).max(100)
  }),
  summary: z.object({
    totalChecks: z.number().int().min(0),
    passedChecks: z.number().int().min(0),
    failedChecks: z.number().int().min(0),
    skippedChecks: z.number().int().min(0)
  })
});

// ===== BUSINESS RULE SCHEMAS =====

export const BusinessRuleSchema = z.object({
  ruleId: z.string().min(1),
  ruleName: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['data-integrity', 'business-logic', 'security', 'performance', 'usability']),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  isActive: z.boolean().default(true),
  validator: z.function().args(z.unknown()).returns(z.boolean()),
  errorMessage: z.string().min(1),
  dependencies: z.array(z.string()).default([]),
  applicableEnvironments: z.array(z.enum(['development', 'staging', 'production'])).default(['development', 'staging', 'production'])
});

export const BusinessRuleViolationSchema = z.object({
  violationId: z.string().uuid(),
  ruleId: z.string().min(1),
  violatedAt: z.string().datetime(),
  violationData: z.record(z.string(), z.unknown()),
  impact: z.enum(['none', 'low', 'medium', 'high', 'critical']),
  autoResolvable: z.boolean().default(false),
  resolutionSteps: z.array(z.string()).default([]),
  relatedViolations: z.array(z.string()).default([])
});

// ===== SCHEMA COMPLIANCE SCHEMAS =====

export const SchemaComplianceCheckSchema = z.object({
  checkId: z.string().min(1),
  checkName: z.string().min(1),
  description: z.string().min(1),
  targetSchema: z.string().min(1), // Schema name being validated
  complianceLevel: z.enum(['basic', 'standard', 'strict', 'enterprise']),
  validator: z.function().args(z.unknown()).returns(ValidationResultSchema),
  isRequired: z.boolean().default(true),
  weight: z.number().min(0).max(100).default(10) // Weight in overall compliance score
});

export const SchemaComplianceReportSchema = z.object({
  reportId: z.string().uuid(),
  generatedAt: z.string().datetime(),
  targetConfiguration: z.string().min(1),
  overallComplianceScore: z.number().min(0).max(100),
  complianceLevel: z.enum(['failing', 'poor', 'acceptable', 'good', 'excellent']),
  checksPerformed: z.array(SchemaComplianceCheckSchema),
  violations: z.array(BusinessRuleViolationSchema),
  recommendations: z.array(z.object({
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    category: z.string().min(1),
    description: z.string().min(1),
    actionRequired: z.string().min(1),
    estimatedEffort: z.enum(['trivial', 'low', 'medium', 'high', 'very-high'])
  })),
  nextReviewDate: z.string().datetime()
});

// ===== INTEGRITY CHECK SCHEMAS =====

export const DataIntegrityCheckSchema = z.object({
  checkType: z.enum(['referential', 'constraint', 'format', 'business-rule', 'cross-field']),
  fieldPath: z.string().min(1),
  expectedValue: z.unknown().optional(),
  actualValue: z.unknown().optional(),
  constraint: z.string().min(1),
  isValid: z.boolean(),
  violationSeverity: z.enum(['info', 'warning', 'error', 'critical']).default('error')
});

export const IntegrityValidationResultSchema = z.object({
  validationId: z.string().uuid(),
  validatedAt: z.string().datetime(),
  configurationId: z.string().min(1),
  checks: z.array(DataIntegrityCheckSchema),
  overallIntegrity: z.enum(['intact', 'minor-issues', 'major-issues', 'corrupted']),
  integrityScore: z.number().min(0).max(100),
  criticalIssues: z.number().int().min(0),
  repairability: z.enum(['auto-repairable', 'manual-repair', 'non-repairable'])
});

// ===== MIGRATION VALIDATION SCHEMAS =====

export const MigrationValidationSchema = z.object({
  migrationId: z.string().uuid(),
  fromVersion: z.string().min(1),
  toVersion: z.string().min(1),
  migratedAt: z.string().datetime(),
  configurationsBefore: z.number().int().min(0),
  configurationsAfter: z.number().int().min(0),
  migrationSuccess: z.boolean(),
  dataLossOccurred: z.boolean(),
  backupCreated: z.boolean(),
  rollbackAvailable: z.boolean(),
  migrationLog: z.array(z.object({
    timestamp: z.string().datetime(),
    level: z.enum(['debug', 'info', 'warning', 'error', 'critical']),
    message: z.string().min(1),
    context: z.record(z.string(), z.unknown()).optional()
  })),
  validationResults: ValidationResultSchema
});

// ===== TYPE EXPORTS =====

export type ValidationContext = z.infer<typeof ValidationContextSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type ValidationWarning = z.infer<typeof ValidationWarningSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type BusinessRule = z.infer<typeof BusinessRuleSchema>;
export type BusinessRuleViolation = z.infer<typeof BusinessRuleViolationSchema>;
export type SchemaComplianceCheck = z.infer<typeof SchemaComplianceCheckSchema>;
export type SchemaComplianceReport = z.infer<typeof SchemaComplianceReportSchema>;
export type DataIntegrityCheck = z.infer<typeof DataIntegrityCheckSchema>;
export type IntegrityValidationResult = z.infer<typeof IntegrityValidationResultSchema>;
export type MigrationValidation = z.infer<typeof MigrationValidationSchema>;

// ===== VALIDATION UTILITIES =====

export const ValidationUtilities = {
  /**
   * Create validation context with defaults
   */
  createValidationContext: (overrides: Partial<ValidationContext> = {}): ValidationContext => {
    const defaults: ValidationContext = {
      validationType: 'runtime',
      validationLevel: 'strict',
      enforceStrictTypes: true,
      allowLegacySupport: false,
      validationEnvironment: 'development',
      validatorVersion: '1.0.0',
      validationTimestamp: new Date().toISOString(),
      contextId: crypto.randomUUID()
    };

    return { ...defaults, ...overrides };
  },

  /**
   * Generate compliance score based on validation results
   */
  calculateComplianceScore: (result: ValidationResult): number => {
    const { errors, warnings, summary } = result;
    
    if (summary.totalChecks === 0) return 0;
    
    const errorPenalty = errors.reduce((penalty, error) => {
      switch (error.severity) {
        case 'critical': return penalty + 25;
        case 'high': return penalty + 15;
        case 'medium': return penalty + 10;
        case 'low': return penalty + 5;
        default: return penalty;
      }
    }, 0);
    
    const warningPenalty = warnings.reduce((penalty, warning) => {
      switch (warning.severity) {
        case 'warning': return penalty + 3;
        case 'notice': return penalty + 1;
        default: return penalty;
      }
    }, 0);
    
    const baseScore = (summary.passedChecks / summary.totalChecks) * 100;
    const finalScore = Math.max(0, baseScore - errorPenalty - warningPenalty);
    
    return Math.round(finalScore);
  },

  /**
   * Determine compliance level based on score
   */
  getComplianceLevel: (score: number): 'failing' | 'poor' | 'acceptable' | 'good' | 'excellent' => {
    if (score >= 95) return 'excellent';
    if (score >= 85) return 'good';
    if (score >= 70) return 'acceptable';
    if (score >= 50) return 'poor';
    return 'failing';
  }
};