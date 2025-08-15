// Migration Validation Script - Enterprise-grade migration safety checks
import { db } from '../db';
import { sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    tablesChecked: number;
    constraintsChecked: number;
    indexesChecked: number;
    dataIntegrityChecks: number;
  };
}

export class MigrationValidator {
  private errors: string[] = [];
  private warnings: string[] = [];
  private summary = {
    tablesChecked: 0,
    constraintsChecked: 0,
    indexesChecked: 0,
    dataIntegrityChecks: 0
  };

  async validateFashionDomainMigration(): Promise<ValidationResult> {
    console.log('🔍 Starting Fashion Domain Migration Validation...\n');

    try {
      await this.validateSchemaStructure();
      await this.validateConstraints();
      await this.validateIndexes();
      await this.validateDataIntegrity();
      await this.validatePerformance();
      await this.validateSecurity();

      const isValid = this.errors.length === 0;
      
      console.log('\n📊 Validation Summary:');
      console.log(`✅ Tables Checked: ${this.summary.tablesChecked}`);
      console.log(`🔗 Constraints Checked: ${this.summary.constraintsChecked}`);
      console.log(`📈 Indexes Checked: ${this.summary.indexesChecked}`);
      console.log(`🔍 Data Integrity Checks: ${this.summary.dataIntegrityChecks}`);
      
      if (isValid) {
        console.log('\n✅ All validation checks passed!');
      } else {
        console.log('\n❌ Validation failed with errors:');
        this.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (this.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        this.warnings.forEach(warning => console.log(`  - ${warning}`));
      }

      return {
        isValid,
        errors: this.errors,
        warnings: this.warnings,
        summary: this.summary
      };

    } catch (error) {
      this.errors.push(`Validation process failed: ${error.message}`);
      return {
        isValid: false,
        errors: this.errors,
        warnings: this.warnings,
        summary: this.summary
      };
    }
  }

  private async validateSchemaStructure(): Promise<void> {
    console.log('🏗️  Validating schema structure...');

    // Check fashion_category_enum
    await this.checkEnumType();
    
    // Check required tables
    const requiredTables = [
      'fashion_listings',
      'fashion_likes', 
      'fashion_comments',
      'fashion_messages',
      'fashion_transactions'
    ];

    for (const tableName of requiredTables) {
      await this.checkTableStructure(tableName);
      this.summary.tablesChecked++;
    }
  }

  private async checkEnumType(): Promise<void> {
    try {
      const enumResult = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'fashion_category_enum'
        ) as exists
      `);

      if (!enumResult.rows[0].exists) {
        this.errors.push('fashion_category_enum type does not exist');
        return;
      }

      // Check enum values
      const enumValues = await db.execute(sql`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fashion_category_enum')
        ORDER BY enumsortorder
      `);

      const expectedValues = ['women', 'men', 'kids', 'home', 'electronics', 'pets', 'beauty', 'sports', 'accessories'];
      const actualValues = enumValues.rows.map(row => row.enumlabel);

      if (actualValues.length !== expectedValues.length) {
        this.errors.push(`fashion_category_enum has ${actualValues.length} values, expected ${expectedValues.length}`);
      }

      expectedValues.forEach(value => {
        if (!actualValues.includes(value)) {
          this.errors.push(`fashion_category_enum missing value: ${value}`);
        }
      });

    } catch (error) {
      this.errors.push(`Failed to validate fashion_category_enum: ${error.message}`);
    }
  }

  private async checkTableStructure(tableName: string): Promise<void> {
    try {
      // Check table exists
      const tableExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = ${tableName}
        ) as exists
      `);

      if (!tableExists.rows[0].exists) {
        this.errors.push(`Table ${tableName} does not exist`);
        return;
      }

      // Check required columns based on table
      const requiredColumns = this.getRequiredColumns(tableName);
      const actualColumns = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = ${tableName}
      `);

      const columnNames = actualColumns.rows.map(row => row.column_name);

      requiredColumns.forEach(column => {
        if (!columnNames.includes(column)) {
          this.errors.push(`Table ${tableName} missing required column: ${column}`);
        }
      });

      // Check primary key
      const primaryKey = await db.execute(sql`
        SELECT column_name
        FROM information_schema.key_column_usage
        WHERE table_name = ${tableName}
        AND constraint_name = ${tableName + '_pkey'}
      `);

      if (primaryKey.rows.length === 0) {
        this.errors.push(`Table ${tableName} missing primary key`);
      } else if (primaryKey.rows[0].column_name !== 'id') {
        this.warnings.push(`Table ${tableName} primary key is not 'id'`);
      }

    } catch (error) {
      this.errors.push(`Failed to validate table ${tableName}: ${error.message}`);
    }
  }

  private async validateConstraints(): Promise<void> {
    console.log('🔗 Validating constraints...');

    await this.checkForeignKeyConstraints();
    await this.checkUniqueConstraints();
    await this.checkCheckConstraints();
  }

  private async checkForeignKeyConstraints(): Promise<void> {
    const expectedForeignKeys = [
      { table: 'fashion_listings', column: 'seller_id', references: 'users' },
      { table: 'fashion_likes', column: 'user_id', references: 'users' },
      { table: 'fashion_likes', column: 'fashion_listing_id', references: 'fashion_listings' },
      { table: 'fashion_comments', column: 'user_id', references: 'users' },
      { table: 'fashion_comments', column: 'fashion_listing_id', references: 'fashion_listings' },
      { table: 'fashion_comments', column: 'parent_comment_id', references: 'fashion_comments' },
      { table: 'fashion_messages', column: 'sender_id', references: 'users' },
      { table: 'fashion_messages', column: 'receiver_id', references: 'users' },
      { table: 'fashion_messages', column: 'fashion_listing_id', references: 'fashion_listings' },
      { table: 'fashion_transactions', column: 'buyer_id', references: 'users' },
      { table: 'fashion_transactions', column: 'seller_id', references: 'users' },
      { table: 'fashion_transactions', column: 'fashion_listing_id', references: 'fashion_listings' }
    ];

    for (const fk of expectedForeignKeys) {
      const result = await db.execute(sql`
        SELECT 1
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.constraint_column_usage ccu
          ON kcu.constraint_name = ccu.constraint_name
        JOIN information_schema.table_constraints tc
          ON kcu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND kcu.table_name = ${fk.table}
        AND kcu.column_name = ${fk.column}
        AND ccu.table_name = ${fk.references}
      `);

      if (result.rows.length === 0) {
        this.errors.push(`Missing foreign key: ${fk.table}.${fk.column} -> ${fk.references}`);
      }

      this.summary.constraintsChecked++;
    }
  }

  private async checkUniqueConstraints(): Promise<void> {
    // Check fashion_likes unique constraint
    const likesUnique = await db.execute(sql`
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_name = 'fashion_likes'
      AND constraint_type = 'UNIQUE'
      AND constraint_name LIKE '%user_id%fashion_listing_id%'
    `);

    if (likesUnique.rows.length === 0) {
      this.errors.push('Missing unique constraint on fashion_likes (user_id, fashion_listing_id)');
    }

    this.summary.constraintsChecked++;
  }

  private async checkCheckConstraints(): Promise<void> {
    // Check price constraints
    const priceConstraints = await db.execute(sql`
      SELECT 1
      FROM information_schema.check_constraints cc
      JOIN information_schema.constraint_column_usage ccu
        ON cc.constraint_name = ccu.constraint_name
      WHERE ccu.table_name = 'fashion_listings'
      AND ccu.column_name = 'price'
      AND cc.check_clause LIKE '%> 0%'
    `);

    if (priceConstraints.rows.length === 0) {
      this.warnings.push('No check constraint found for positive price values');
    }

    this.summary.constraintsChecked++;
  }

  private async validateIndexes(): Promise<void> {
    console.log('📈 Validating indexes...');

    const expectedIndexes = [
      { table: 'fashion_listings', column: 'fashion_category' },
      { table: 'fashion_listings', column: 'seller_id' },
      { table: 'fashion_listings', column: 'status' },
      { table: 'fashion_listings', column: 'created_at' },
      { table: 'fashion_listings', column: 'price' },
      { table: 'fashion_likes', column: 'fashion_listing_id' },
      { table: 'fashion_comments', column: 'fashion_listing_id' }
    ];

    for (const index of expectedIndexes) {
      const result = await db.execute(sql`
        SELECT 1
        FROM pg_indexes
        WHERE tablename = ${index.table}
        AND indexdef LIKE '%' || ${index.column} || '%'
      `);

      if (result.rows.length === 0) {
        this.warnings.push(`Missing recommended index on ${index.table}.${index.column}`);
      }

      this.summary.indexesChecked++;
    }
  }

  private async validateDataIntegrity(): Promise<void> {
    console.log('🔍 Validating data integrity...');

    // Check for orphaned records
    await this.checkOrphanedRecords();
    
    // Check data consistency
    await this.checkDataConsistency();
    
    // Check enum value usage
    await this.checkEnumUsage();
  }

  private async checkOrphanedRecords(): Promise<void> {
    // Check for fashion_likes without valid fashion_listing_id
    const orphanedLikes = await db.execute(sql`
      SELECT COUNT(*)
      FROM fashion_likes fl
      LEFT JOIN fashion_listings f ON fl.fashion_listing_id = f.id
      WHERE f.id IS NULL
    `);

    if (Number(orphanedLikes.rows[0].count) > 0) {
      this.errors.push(`Found ${orphanedLikes.rows[0].count} orphaned fashion_likes records`);
    }

    // Check for fashion_comments without valid fashion_listing_id
    const orphanedComments = await db.execute(sql`
      SELECT COUNT(*)
      FROM fashion_comments fc
      LEFT JOIN fashion_listings f ON fc.fashion_listing_id = f.id
      WHERE f.id IS NULL
    `);

    if (Number(orphanedComments.rows[0].count) > 0) {
      this.errors.push(`Found ${orphanedComments.rows[0].count} orphaned fashion_comments records`);
    }

    this.summary.dataIntegrityChecks += 2;
  }

  private async checkDataConsistency(): Promise<void> {
    // Check that all fashion_listings have valid status values
    const invalidStatus = await db.execute(sql`
      SELECT COUNT(*)
      FROM fashion_listings
      WHERE status NOT IN ('active', 'sold', 'archived', 'pending', 'draft')
    `);

    if (Number(invalidStatus.rows[0].count) > 0) {
      this.errors.push(`Found ${invalidStatus.rows[0].count} fashion_listings with invalid status`);
    }

    // Check that prices are positive
    const negativePrice = await db.execute(sql`
      SELECT COUNT(*)
      FROM fashion_listings
      WHERE price <= 0
    `);

    if (Number(negativePrice.rows[0].count) > 0) {
      this.errors.push(`Found ${negativePrice.rows[0].count} fashion_listings with non-positive price`);
    }

    this.summary.dataIntegrityChecks += 2;
  }

  private async checkEnumUsage(): Promise<void> {
    // Check that all fashion_category values are valid
    const invalidCategories = await db.execute(sql`
      SELECT DISTINCT fashion_category
      FROM fashion_listings
      WHERE fashion_category NOT IN (
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fashion_category_enum')
      )
    `);

    if (invalidCategories.rows.length > 0) {
      this.errors.push(`Found invalid fashion_category values: ${invalidCategories.rows.map(r => r.fashion_category).join(', ')}`);
    }

    this.summary.dataIntegrityChecks++;
  }

  private async validatePerformance(): Promise<void> {
    console.log('⚡ Validating performance...');

    // Test query performance on indexed columns
    const startTime = Date.now();
    
    await db.execute(sql`
      SELECT COUNT(*)
      FROM fashion_listings
      WHERE fashion_category = 'women'
      AND status = 'active'
      AND price BETWEEN 50 AND 200
    `);
    
    const queryTime = Date.now() - startTime;

    if (queryTime > 1000) {
      this.warnings.push(`Query performance may be suboptimal (${queryTime}ms)`);
    }

    // Check table sizes
    const tableStats = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats
      WHERE tablename LIKE 'fashion_%'
      AND schemaname = 'public'
    `);

    if (tableStats.rows.length === 0) {
      this.warnings.push('No table statistics available - consider running ANALYZE');
    }
  }

  private async validateSecurity(): Promise<void> {
    console.log('🔒 Validating security...');

    // Check for proper column permissions (this would be environment-specific)
    this.warnings.push('Security validation requires environment-specific checks');

    // Check for sensitive data exposure
    const sensitiveColumns = await db.execute(sql`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_name LIKE 'fashion_%'
      AND (column_name LIKE '%password%' OR column_name LIKE '%secret%' OR column_name LIKE '%token%')
    `);

    if (sensitiveColumns.rows.length > 0) {
      this.warnings.push('Found potentially sensitive column names - ensure proper protection');
    }
  }

  private getRequiredColumns(tableName: string): string[] {
    const columnMap: Record<string, string[]> = {
      'fashion_listings': [
        'id', 'seller_id', 'title', 'description', 'fashion_category',
        'condition', 'price', 'status', 'created_at', 'updated_at'
      ],
      'fashion_likes': [
        'id', 'user_id', 'fashion_listing_id', 'created_at'
      ],
      'fashion_comments': [
        'id', 'user_id', 'fashion_listing_id', 'content', 'created_at', 'updated_at'
      ],
      'fashion_messages': [
        'id', 'sender_id', 'receiver_id', 'content', 'created_at'
      ],
      'fashion_transactions': [
        'id', 'buyer_id', 'seller_id', 'fashion_listing_id', 'amount', 'status', 'created_at'
      ]
    };

    return columnMap[tableName] || [];
  }
}

// CLI execution
if (require.main === module) {
  async function main() {
    const validator = new MigrationValidator();
    const result = await validator.validateFashionDomainMigration();
    
    process.exit(result.isValid ? 0 : 1);
  }

  main().catch(error => {
    console.error('Validation script failed:', error);
    process.exit(1);
  });
}

export { MigrationValidator };
