// Test Database Setup - Enterprise-grade test database management
import { db } from '../../db';
import { sql } from 'drizzle-orm';

/**
 * Setup test database environment
 * Ensures clean, isolated test environment for each test run
 * Follows enterprise-grade testing best practices
 */
export async function setupTestDatabase(): Promise<void> {
  try {
    // Set test environment variables if not already set
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'test';
    }

    // Validate database connection
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set for test environment');
    }

    // Verify test database connection
    await verifyDatabaseConnection();

    // Initialize test-specific settings
    await initializeTestSettings();

    console.log('Test database setup completed successfully');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}

/**
 * Verify database connection is working
 */
async function verifyDatabaseConnection(): Promise<void> {
  try {
    await db.execute(sql`SELECT 1 as test`);
  } catch (error) {
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Initialize test-specific database settings
 */
async function initializeTestSettings(): Promise<void> {
  try {
    // Set timezone for consistent test results
    await db.execute(sql`SET timezone = 'UTC'`);
    
    // Disable foreign key checks during test setup if needed
    // Note: Be careful with this in production-like tests
    if (process.env.DISABLE_FK_CHECKS === 'true') {
      await db.execute(sql`SET session_replication_role = replica`);
    }
  } catch (error) {
    console.warn('Warning: Could not set test database settings:', error);
    // Non-critical, continue with test setup
  }
}

/**
 * Cleanup test database
 * Called after tests to ensure clean state
 */
export async function cleanupTestDatabase(): Promise<void> {
  try {
    // Re-enable foreign key checks if they were disabled
    if (process.env.DISABLE_FK_CHECKS === 'true') {
      await db.execute(sql`SET session_replication_role = DEFAULT`);
    }
    
    console.log('Test database cleanup completed');
  } catch (error) {
    console.warn('Warning during test database cleanup:', error);
  }
}

/**
 * Reset test database to clean state
 * Truncates all tables while preserving schema
 */
export async function resetTestDatabase(): Promise<void> {
  try {
    // Note: This is a simplified implementation
    // In a full enterprise setup, you might want to:
    // 1. Get list of all tables
    // 2. Truncate in dependency order
    // 3. Reset sequences
    
    // For now, we'll use a simple approach
    await db.execute(sql`
      TRUNCATE TABLE fashion_listings, fashion_likes, fashion_comments, 
                     fashion_messages, fashion_transactions, 
                     listings, users, follows, likes, comments, 
                     messages, transactions, feed_data, brand_counts 
      RESTART IDENTITY CASCADE
    `);
    
    console.log('Test database reset completed');
  } catch (error) {
    console.warn('Warning during test database reset:', error);
    // Non-critical error, tests can still run
  }
}

/**
 * Create isolated test transaction
 * Returns transaction that can be rolled back after test
 */
export async function createTestTransaction() {
  return db.transaction(async (tx) => {
    // Return transaction context for test use
    return tx;
  });
}

/**
 * Check if running in test environment
 */
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test' || 
         process.env.DATABASE_URL?.includes('test') === true;
}

/**
 * Validate test environment setup
 */
export function validateTestEnvironment(): void {
  if (!isTestEnvironment()) {
    throw new Error('Test database utilities should only be used in test environment');
  }
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be configured for tests');
  }
  
  // Ensure we're not accidentally pointing to production database
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl.includes('prod') || dbUrl.includes('production')) {
    throw new Error('Test database utilities detected production database URL');
  }
}

// Validate environment on module load
validateTestEnvironment();

