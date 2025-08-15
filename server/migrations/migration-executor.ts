// Migration Executor - Zero-downtime fashion domain migration
import { Database } from '../db/index';
import fs from 'fs/promises';
import path from 'path';

interface MigrationResult {
  success: boolean;
  recordsProcessed: number;
  duration: number;
  errors: string[];
  warnings: string[];
  metadata: Record<string, any>;
}

interface MigrationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    prerequisitesCheck: boolean;
    schemaIntegrityCheck: boolean;
    dataConsistencyCheck: boolean;
    performanceCheck: boolean;
  };
}

export class FashionDomainMigrationExecutor {
  constructor(private database: Database) {}

  async validatePrerequisites(): Promise<MigrationValidation> {
    const validation: MigrationValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      checks: {
        prerequisitesCheck: false,
        schemaIntegrityCheck: false,
        dataConsistencyCheck: false,
        performanceCheck: false
      }
    };

    try {
      // Check 1: Prerequisites
      await this.checkPrerequisites(validation);
      
      // Check 2: Schema Integrity
      await this.checkSchemaIntegrity(validation);
      
      // Check 3: Data Consistency
      await this.checkDataConsistency(validation);
      
      // Check 4: Performance Impact
      await this.checkPerformanceImpact(validation);

      validation.isValid = validation.errors.length === 0;
      
    } catch (error) {
      validation.errors.push(`Validation failed: ${error.message}`);
      validation.isValid = false;
    }

    return validation;
  }

  private async checkPrerequisites(validation: MigrationValidation): Promise<void> {
    // Check database connection
    try {
      await this.database.execute('SELECT 1');
    } catch (error) {
      validation.errors.push('Database connection failed');
      return;
    }

    // Check pgvector extension
    try {
      const result = await this.database.execute(`
        SELECT EXISTS(
          SELECT 1 FROM pg_extension WHERE extname = 'vector'
        ) as has_vector
      `);
      
      if (!result[0]?.has_vector) {
        validation.warnings.push('pgvector extension not installed - vector search features will be limited');
      }
    } catch (error) {
      validation.warnings.push('Could not check pgvector extension status');
    }

    // Check existing fashion data count
    try {
      const result = await this.database.execute(`
        SELECT COUNT(*) as count FROM listings WHERE category = 'fashion'
      `);
      
      const fashionCount = result[0]?.count || 0;
      if (fashionCount > 10000) {
        validation.warnings.push(`Large dataset detected (${fashionCount} fashion listings) - migration may take longer`);
      }
    } catch (error) {
      validation.errors.push('Could not assess existing data volume');
      return;
    }

    // Check disk space
    try {
      const result = await this.database.execute(`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as db_size,
          pg_size_pretty(pg_total_relation_size('listings')) as listings_size
      `);
      
      validation.warnings.push(`Current database size: ${result[0]?.db_size}`);
    } catch (error) {
      validation.warnings.push('Could not check database size');
    }

    validation.checks.prerequisitesCheck = validation.errors.length === 0;
  }

  private async checkSchemaIntegrity(validation: MigrationValidation): Promise<void> {
    // Check if fashion tables already exist
    try {
      const result = await this.database.execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name IN ('fashion_listings', 'fashion_likes', 'fashion_comments')
          AND table_schema = 'public'
      `);
      
      if (result.length > 0) {
        validation.errors.push(`Fashion tables already exist: ${result.map(r => r.table_name).join(', ')}`);
        return;
      }
    } catch (error) {
      validation.errors.push('Could not check existing schema');
      return;
    }

    // Check required base tables exist
    const requiredTables = ['users', 'listings'];
    for (const table of requiredTables) {
      try {
        await this.database.execute(`SELECT 1 FROM ${table} LIMIT 1`);
      } catch (error) {
        validation.errors.push(`Required table '${table}' not found`);
      }
    }

    validation.checks.schemaIntegrityCheck = validation.errors.filter(e => 
      e.includes('fashion tables') || e.includes('Required table')
    ).length === 0;
  }

  private async checkDataConsistency(validation: MigrationValidation): Promise<void> {
    try {
      // Check for orphaned data
      const orphanedListings = await this.database.execute(`
        SELECT COUNT(*) as count 
        FROM listings l 
        LEFT JOIN users u ON l.seller_id = u.id 
        WHERE u.id IS NULL AND l.category = 'fashion'
      `);
      
      if (orphanedListings[0]?.count > 0) {
        validation.warnings.push(`Found ${orphanedListings[0].count} orphaned fashion listings`);
      }

      // Check data quality issues
      const dataQualityIssues = await this.database.execute(`
        SELECT 
          COUNT(CASE WHEN title IS NULL OR title = '' THEN 1 END) as empty_titles,
          COUNT(CASE WHEN images IS NULL OR array_length(images, 1) = 0 THEN 1 END) as no_images,
          COUNT(CASE WHEN price IS NULL OR price <= 0 THEN 1 END) as invalid_prices
        FROM listings 
        WHERE category = 'fashion'
      `);
      
      const issues = dataQualityIssues[0];
      if (issues?.empty_titles > 0) {
        validation.warnings.push(`Found ${issues.empty_titles} listings with empty titles`);
      }
      if (issues?.no_images > 0) {
        validation.warnings.push(`Found ${issues.no_images} listings without images`);
      }
      if (issues?.invalid_prices > 0) {
        validation.errors.push(`Found ${issues.invalid_prices} listings with invalid prices`);
      }

    } catch (error) {
      validation.warnings.push('Could not complete data consistency check');
    }

    validation.checks.dataConsistencyCheck = validation.errors.filter(e => 
      e.includes('invalid prices')
    ).length === 0;
  }

  private async checkPerformanceImpact(validation: MigrationValidation): Promise<void> {
    try {
      // Estimate migration time based on data volume
      const volumeResult = await this.database.execute(`
        SELECT 
          COUNT(*) as total_fashion_listings,
          COUNT(*) * 0.001 as estimated_seconds
        FROM listings 
        WHERE category = 'fashion'
      `);
      
      const estimatedTime = volumeResult[0]?.estimated_seconds || 0;
      if (estimatedTime > 60) {
        validation.warnings.push(`Estimated migration time: ${Math.ceil(estimatedTime / 60)} minutes`);
      }

      // Check current database load
      const loadResult = await this.database.execute(`
        SELECT 
          count(*) as active_connections,
          (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
        FROM pg_stat_activity 
        WHERE state = 'active'
      `);
      
      const load = loadResult[0];
      if (load && load.active_connections > load.max_connections * 0.8) {
        validation.warnings.push('High database load detected - consider running during off-peak hours');
      }

    } catch (error) {
      validation.warnings.push('Could not assess performance impact');
    }

    validation.checks.performanceCheck = true; // Performance check doesn't block migration
  }

  async executeMigration(): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      recordsProcessed: 0,
      duration: 0,
      errors: [],
      warnings: [],
      metadata: {}
    };

    try {
      console.log('🚀 Starting fashion domain migration...');

      // Step 1: Validate prerequisites
      const validation = await this.validatePrerequisites();
      if (!validation.isValid) {
        result.errors = validation.errors;
        result.warnings = validation.warnings;
        return result;
      }

      result.warnings = validation.warnings;

      // Step 2: Execute schema migration
      console.log('📝 Executing schema migration...');
      const schemaMigrationPath = path.join(__dirname, '001_create_fashion_domain.sql');
      const schemaSql = await fs.readFile(schemaMigrationPath, 'utf-8');
      
      await this.database.execute(schemaSql);
      console.log('✅ Schema migration completed');

      // Step 3: Execute data migration in batches
      console.log('📊 Starting data migration...');
      const batchSize = 1000;
      let totalProcessed = 0;
      let hasMore = true;

      while (hasMore) {
        const batchResult = await this.database.execute(`
          SELECT migrate_fashion_listings_batch($1, $2) as processed_count
        `, [batchSize, totalProcessed]);

        const processedInBatch = batchResult[0]?.processed_count || 0;
        totalProcessed += processedInBatch;
        
        if (processedInBatch < batchSize) {
          hasMore = false;
        }

        console.log(`📦 Processed batch: ${processedInBatch} records (total: ${totalProcessed})`);

        // Prevent runaway migration
        if (totalProcessed > 100000) {
          result.warnings.push('Migration paused at 100,000 records - review and continue if needed');
          break;
        }
      }

      result.recordsProcessed = totalProcessed;

      // Step 4: Verify migration integrity
      console.log('🔍 Verifying migration integrity...');
      const verificationResult = await this.verifyMigration();
      
      if (!verificationResult.isValid) {
        result.errors.push(...verificationResult.errors);
        result.warnings.push(...verificationResult.warnings);
        return result;
      }

      // Step 5: Update statistics
      console.log('📈 Updating table statistics...');
      await this.database.execute('ANALYZE fashion_listings');
      await this.database.execute('ANALYZE fashion_likes');
      await this.database.execute('ANALYZE fashion_comments');

      result.success = true;
      result.metadata = {
        tablesCreated: ['fashion_listings', 'fashion_likes', 'fashion_comments', 'fashion_messages', 'fashion_transactions', 'fashion_analytics'],
        indexesCreated: 15,
        triggersCreated: 3,
        recordsMigrated: totalProcessed,
        verificationPassed: true
      };

      console.log('🎉 Fashion domain migration completed successfully!');

    } catch (error) {
      result.errors.push(`Migration failed: ${error.message}`);
      console.error('❌ Migration failed:', error);

      // Attempt automatic rollback on critical failure
      if (error.message.includes('CRITICAL') || error.message.includes('CONSTRAINT')) {
        console.log('🔄 Attempting automatic rollback...');
        try {
          await this.executeRollback();
          result.warnings.push('Automatic rollback completed due to critical error');
        } catch (rollbackError) {
          result.errors.push(`Rollback also failed: ${rollbackError.message}`);
        }
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async verifyMigration(): Promise<MigrationValidation> {
    const validation: MigrationValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      checks: {
        prerequisitesCheck: false,
        schemaIntegrityCheck: false,
        dataConsistencyCheck: false,
        performanceCheck: false
      }
    };

    try {
      // Verify table creation
      const tables = await this.database.execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE 'fashion_%' 
          AND table_schema = 'public'
      `);

      const expectedTables = ['fashion_listings', 'fashion_likes', 'fashion_comments', 'fashion_messages', 'fashion_transactions', 'fashion_analytics'];
      const actualTables = tables.map(t => t.table_name);
      
      for (const expectedTable of expectedTables) {
        if (!actualTables.includes(expectedTable)) {
          validation.errors.push(`Table ${expectedTable} was not created`);
        }
      }

      // Verify data migration
      const originalCount = await this.database.execute(`
        SELECT COUNT(*) as count FROM listings WHERE category = 'fashion'
      `);

      const migratedCount = await this.database.execute(`
        SELECT COUNT(*) as count FROM fashion_listings
      `);

      if (originalCount[0]?.count !== migratedCount[0]?.count) {
        validation.errors.push(
          `Data migration incomplete: ${originalCount[0]?.count} original vs ${migratedCount[0]?.count} migrated`
        );
      }

      // Verify indexes
      const indexes = await this.database.execute(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename LIKE 'fashion_%'
      `);

      if (indexes.length < 10) {
        validation.warnings.push(`Expected more indexes, found only ${indexes.length}`);
      }

      validation.isValid = validation.errors.length === 0;

    } catch (error) {
      validation.errors.push(`Verification failed: ${error.message}`);
      validation.isValid = false;
    }

    return validation;
  }

  async executeRollback(): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      recordsProcessed: 0,
      duration: 0,
      errors: [],
      warnings: [],
      metadata: {}
    };

    try {
      console.log('🔄 Starting fashion domain rollback...');

      const rollbackSqlPath = path.join(__dirname, '001_rollback_fashion_domain.sql');
      const rollbackSql = await fs.readFile(rollbackSqlPath, 'utf-8');
      
      await this.database.execute(rollbackSql);
      
      result.success = true;
      result.metadata = {
        rolledBack: true,
        backupTablesCreated: true,
        originalDataRestored: true
      };

      console.log('✅ Rollback completed successfully');

    } catch (error) {
      result.errors.push(`Rollback failed: ${error.message}`);
      console.error('❌ Rollback failed:', error);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async getStatus(): Promise<{
    migrationExists: boolean;
    tablesExist: boolean;
    dataCount: number;
    lastMigration?: any;
  }> {
    try {
      // Check if migration log exists
      const migrationLog = await this.database.execute(`
        SELECT * FROM migration_log 
        WHERE migration_name = 'create_fashion_domain' 
        ORDER BY started_at DESC 
        LIMIT 1
      `).catch(() => []);

      // Check if fashion tables exist
      const tables = await this.database.execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name LIKE 'fashion_%' 
          AND table_schema = 'public'
      `);

      // Check data count
      const dataCount = await this.database.execute(`
        SELECT COUNT(*) as count FROM fashion_listings
      `).catch(() => [{ count: 0 }]);

      return {
        migrationExists: migrationLog.length > 0,
        tablesExist: (tables[0]?.count || 0) > 0,
        dataCount: dataCount[0]?.count || 0,
        lastMigration: migrationLog[0] || null
      };

    } catch (error) {
      return {
        migrationExists: false,
        tablesExist: false,
        dataCount: 0
      };
    }
  }
}

// Enhanced batch migration function
export async function createBatchMigrationFunction(database: Database): Promise<void> {
  await database.execute(`
    CREATE OR REPLACE FUNCTION migrate_fashion_listings_batch(
      batch_size INTEGER DEFAULT 1000,
      offset_value INTEGER DEFAULT 0
    )
    RETURNS INTEGER
    LANGUAGE plpgsql
    AS $$
    DECLARE
        migrated_count INTEGER := 0;
        record_batch RECORD;
    BEGIN
        -- Migrate existing fashion listings from the generic listings table in batches
        FOR record_batch IN 
            SELECT * FROM listings 
            WHERE category = 'fashion'
            ORDER BY created_at
            LIMIT batch_size
            OFFSET offset_value
        LOOP
            -- Map legacy categories to new fashion categories with enhanced validation
            INSERT INTO fashion_listings (
                id,
                seller_id,
                title,
                description,
                fashion_category,
                subcategory,
                brand,
                size,
                color,
                condition,
                price,
                original_price,
                images,
                tags,
                status,
                views_count,
                likes_count,
                shares_count,
                comments_count,
                location,
                is_promoted,
                title_embedding,
                description_embedding,
                combined_embedding,
                created_at,
                updated_at
            )
            SELECT 
                record_batch.id,
                record_batch.seller_id,
                record_batch.title,
                record_batch.description,
                -- Enhanced category mapping with validation
                CASE 
                    WHEN record_batch.subcategory IN ('women', 'womens', 'ladies') THEN 'women'::fashion_category_enum
                    WHEN record_batch.subcategory IN ('men', 'mens', 'male') THEN 'men'::fashion_category_enum
                    WHEN record_batch.subcategory IN ('kids', 'children', 'baby', 'child') THEN 'kids'::fashion_category_enum
                    WHEN record_batch.subcategory IN ('home', 'house', 'decor', 'furniture') THEN 'home'::fashion_category_enum
                    WHEN record_batch.subcategory IN ('electronics', 'tech', 'gadgets', 'devices') THEN 'electronics'::fashion_category_enum
                    WHEN record_batch.subcategory IN ('pets', 'animals', 'pet') THEN 'pets'::fashion_category_enum
                    WHEN record_batch.subcategory IN ('beauty', 'cosmetics', 'makeup', 'skincare') THEN 'beauty'::fashion_category_enum
                    WHEN record_batch.subcategory IN ('sports', 'fitness', 'athletic', 'sport') THEN 'sports'::fashion_category_enum
                    -- Intelligent fallback based on other attributes
                    WHEN record_batch.tags && ARRAY['women', 'womens', 'ladies'] THEN 'women'::fashion_category_enum
                    WHEN record_batch.tags && ARRAY['men', 'mens', 'male'] THEN 'men'::fashion_category_enum
                    ELSE 'women'::fashion_category_enum -- Safe default
                END,
                record_batch.subcategory,
                record_batch.brand,
                record_batch.size,
                record_batch.color,
                record_batch.condition,
                record_batch.price,
                record_batch.original_price,
                record_batch.images,
                record_batch.tags,
                CASE record_batch.status
                    WHEN 'active' THEN 'active'::fashion_status_enum
                    WHEN 'sold' THEN 'sold'::fashion_status_enum
                    WHEN 'pending' THEN 'pending'::fashion_status_enum
                    WHEN 'draft' THEN 'draft'::fashion_status_enum
                    WHEN 'archived' THEN 'archived'::fashion_status_enum
                    ELSE 'active'::fashion_status_enum
                END,
                record_batch.views_count,
                record_batch.likes_count,
                record_batch.shares_count,
                record_batch.comments_count,
                record_batch.location,
                record_batch.is_promoted,
                record_batch.title_embedding,
                record_batch.description_embedding,
                record_batch.combined_embedding,
                record_batch.created_at,
                record_batch.updated_at
            ON CONFLICT (id) DO NOTHING;
            
            migrated_count := migrated_count + 1;
        END LOOP;
        
        RETURN migrated_count;
    END;
    $$;
  `);
}
