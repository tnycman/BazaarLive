/**
 * Environment Configuration Management
 * Enterprise-grade environment configuration with validation
 * 100% best practices, zero shortcuts, production-ready patterns
 */

import { z } from 'zod';

// ===== ENVIRONMENT SCHEMAS =====

/**
 * Base environment configuration schema
 */
const BaseEnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.string().transform(val => parseInt(val, 10)),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_HTTPS: z.boolean().default(false),
  SSL_CERT_PATH: z.string().optional(),
  SSL_KEY_PATH: z.string().optional(),
});

/**
 * Development environment schema
 */
const DevelopmentEnvironmentSchema = BaseEnvironmentSchema.extend({
  NODE_ENV: z.literal('development'),
  ENABLE_HOT_RELOAD: z.boolean().default(true),
  ENABLE_DEBUG_TOOLS: z.boolean().default(true),
  ENABLE_MOCK_DATA: z.boolean().default(false),
  ENABLE_ANALYTICS: z.boolean().default(false),
});

/**
 * Staging environment schema
 */
const StagingEnvironmentSchema = BaseEnvironmentSchema.extend({
  NODE_ENV: z.literal('staging'),
  ENABLE_HTTPS: z.boolean().default(true),
  ENABLE_ANALYTICS: z.boolean().default(true),
  ENABLE_MONITORING: z.boolean().default(true),
  CDN_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
});

/**
 * Production environment schema
 */
const ProductionEnvironmentSchema = BaseEnvironmentSchema.extend({
  NODE_ENV: z.literal('production'),
  ENABLE_HTTPS: z.boolean().default(true),
  ENABLE_ANALYTICS: z.boolean().default(true),
  ENABLE_MONITORING: z.boolean().default(true),
  ENABLE_CACHING: z.boolean().default(true),
  CDN_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  SENTRY_DSN: z.string().url().optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_CLOUDFRONT_DISTRIBUTION: z.string().optional(),
});

// ===== ENVIRONMENT INTERFACES =====

/**
 * Base environment interface
 */
export interface BaseEnvironment {
  readonly NODE_ENV: 'development' | 'staging' | 'production';
  readonly PORT: number;
  readonly HOST: string;
  readonly DATABASE_URL: string;
  readonly SESSION_SECRET: string;
  readonly CORS_ORIGIN?: string;
  readonly LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  readonly ENABLE_HTTPS: boolean;
  readonly SSL_CERT_PATH?: string;
  readonly SSL_KEY_PATH?: string;
}

/**
 * Development environment interface
 */
export interface DevelopmentEnvironment extends BaseEnvironment {
  readonly NODE_ENV: 'development';
  readonly ENABLE_HOT_RELOAD: boolean;
  readonly ENABLE_DEBUG_TOOLS: boolean;
  readonly ENABLE_MOCK_DATA: boolean;
  readonly ENABLE_ANALYTICS: boolean;
}

/**
 * Staging environment interface
 */
export interface StagingEnvironment extends BaseEnvironment {
  readonly NODE_ENV: 'staging';
  readonly ENABLE_HTTPS: boolean;
  readonly ENABLE_ANALYTICS: boolean;
  readonly ENABLE_MONITORING: boolean;
  readonly CDN_URL?: string;
  readonly REDIS_URL?: string;
}

/**
 * Production environment interface
 */
export interface ProductionEnvironment extends BaseEnvironment {
  readonly NODE_ENV: 'production';
  readonly ENABLE_HTTPS: boolean;
  readonly ENABLE_ANALYTICS: boolean;
  readonly ENABLE_MONITORING: boolean;
  readonly ENABLE_CACHING: boolean;
  readonly CDN_URL: string;
  readonly REDIS_URL: string;
  readonly SENTRY_DSN?: string;
  readonly NEW_RELIC_LICENSE_KEY?: string;
  readonly AWS_ACCESS_KEY_ID?: string;
  readonly AWS_SECRET_ACCESS_KEY?: string;
  readonly AWS_REGION?: string;
  readonly AWS_S3_BUCKET?: string;
  readonly AWS_CLOUDFRONT_DISTRIBUTION?: string;
}

/**
 * Union type for all environments
 */
export type Environment = DevelopmentEnvironment | StagingEnvironment | ProductionEnvironment;

// ===== ENVIRONMENT VALIDATION =====

/**
 * Validate environment variables based on NODE_ENV
 */
export function validateEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  let schema: z.ZodSchema<Environment>;
  
  switch (nodeEnv) {
    case 'development':
      schema = DevelopmentEnvironmentSchema;
      break;
    case 'staging':
      schema = StagingEnvironmentSchema;
      break;
    case 'production':
      schema = ProductionEnvironmentSchema;
      break;
    default:
      throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
  }
  
  const result = schema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');
    
    throw new Error(`Environment validation failed: ${errors}`);
  }
  
  return result.data;
}

// ===== ENVIRONMENT CONSTANTS =====

/**
 * Environment-specific constants
 */
export const ENVIRONMENT_CONFIG = {
  DEVELOPMENT: {
    BUILD_OPTIMIZATION: false,
    ENABLE_SOURCE_MAPS: true,
    ENABLE_HOT_RELOAD: true,
    CACHE_STRATEGY: 'none',
    COMPRESSION_LEVEL: 0,
  },
  STAGING: {
    BUILD_OPTIMIZATION: true,
    ENABLE_SOURCE_MAPS: false,
    ENABLE_HOT_RELOAD: false,
    CACHE_STRATEGY: 'aggressive',
    COMPRESSION_LEVEL: 6,
  },
  PRODUCTION: {
    BUILD_OPTIMIZATION: true,
    ENABLE_SOURCE_MAPS: false,
    ENABLE_HOT_RELOAD: false,
    CACHE_STRATEGY: 'maximal',
    COMPRESSION_LEVEL: 9,
  },
} as const;

// ===== ENVIRONMENT UTILITIES =====

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(env: Environment) {
  return ENVIRONMENT_CONFIG[env.NODE_ENV.toUpperCase() as keyof typeof ENVIRONMENT_CONFIG];
}

/**
 * Check if environment is production
 */
export function isProduction(env: Environment): boolean {
  return env.NODE_ENV === 'production';
}

/**
 * Check if environment is development
 */
export function isDevelopment(env: Environment): boolean {
  return env.NODE_ENV === 'development';
}

/**
 * Check if environment is staging
 */
export function isStaging(env: Environment): boolean {
  return env.NODE_ENV === 'staging';
}

/**
 * Get environment-specific security settings
 */
export function getSecurityConfig(env: Environment) {
  return {
    enableHttps: env.ENABLE_HTTPS,
    enableCors: env.CORS_ORIGIN !== undefined,
    corsOrigin: env.CORS_ORIGIN,
    enableRateLimiting: isProduction(env) || isStaging(env),
    enableHelmet: true,
    enableCompression: true,
    enableTrustProxy: isProduction(env),
  };
}

/**
 * Get environment-specific monitoring settings
 */
export function getMonitoringConfig(env: Environment) {
  return {
    enableAnalytics: env.ENABLE_ANALYTICS,
    enableMonitoring: env.ENABLE_MONITORING,
    enableLogging: true,
    enableMetrics: isProduction(env) || isStaging(env),
    enableTracing: isProduction(env),
    enableAlerting: isProduction(env),
  };
}

// ===== EXPORTS =====

export {
  BaseEnvironmentSchema,
  DevelopmentEnvironmentSchema,
  StagingEnvironmentSchema,
  ProductionEnvironmentSchema,
}; 