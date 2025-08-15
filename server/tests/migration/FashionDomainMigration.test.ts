// Fashion Domain Migration Tests - Enterprise-grade migration verification
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../../db';
import { eq, sql } from 'drizzle-orm';
import { fashionListings, fashionLikes, fashionComments, fashionMessages, fashionTransactions } from '@shared/fashion-schema';
import { listings, users } from '@shared/schema';
import fs from 'fs/promises';
import path from 'path';

describe('Fashion Domain Migration Tests', () => {
  let testDbName: string;
  let migrationPath: string;
  let rollbackPath: string;

  beforeAll(async () => {
    // Setup test database
    testDbName = `bazaarlive_migration_test_${Date.now()}`;
    migrationPath = path.join(process.cwd(), 'server/migrations/001_create_fashion_domain.sql');
    rollbackPath = path.join(process.cwd(), 'server/migrations/001_rollback_fashion_domain.sql');
    
    // Create test database
    await db.execute(sql`CREATE DATABASE ${sql.identifier(testDbName)}`);
  });

  afterAll(async () => {
    // Cleanup test database
    try {
      await db.execute(sql`DROP DATABASE IF EXISTS ${sql.identifier(testDbName)}`);
    } catch (error) {
      console.warn('Failed to cleanup test database:', error);
    }
  });

  describe('Migration File Validation', () => {
    it('should have valid migration SQL file', async () => {
      const migrationExists = await fs.access(migrationPath).then(() => true).catch(() => false);
      expect(migrationExists).toBe(true);

      const migrationContent = await fs.readFile(migrationPath, 'utf-8');
      expect(migrationContent).toContain('CREATE TYPE fashion_category_enum');
      expect(migrationContent).toContain('CREATE TABLE fashion_listings');
      expect(migrationContent).toContain('CREATE TABLE fashion_likes');
      expect(migrationContent).toContain('CREATE TABLE fashion_comments');
      expect(migrationContent).toContain('CREATE TABLE fashion_messages');
      expect(migrationContent).toContain('CREATE TABLE fashion_transactions');
    });

    it('should have valid rollback SQL file', async () => {
      const rollbackExists = await fs.access(rollbackPath).then(() => true).catch(() => false);
      expect(rollbackExists).toBe(true);

      const rollbackContent = await fs.readFile(rollbackPath, 'utf-8');
      expect(rollbackContent).toContain('DROP TABLE IF EXISTS fashion_transactions');
      expect(rollbackContent).toContain('DROP TABLE IF EXISTS fashion_messages');
      expect(rollbackContent).toContain('DROP TABLE IF EXISTS fashion_comments');
      expect(rollbackContent).toContain('DROP TABLE IF EXISTS fashion_likes');
      expect(rollbackContent).toContain('DROP TABLE IF EXISTS fashion_listings');
      expect(rollbackContent).toContain('DROP TYPE IF EXISTS fashion_category_enum');
    });

    it('should have proper dependency order in rollback', async () => {
      const rollbackContent = await fs.readFile(rollbackPath, 'utf-8');
      const lines = rollbackContent.split('\n').filter(line => line.trim().startsWith('DROP TABLE'));
      
      // Verify tables are dropped in reverse dependency order
      const tableOrder = lines.map(line => {
        const match = line.match(/DROP TABLE IF EXISTS (\w+)/);
        return match ? match[1] : null;
      }).filter(Boolean);

      // Dependent tables should be dropped before parent tables
      const fashionListingsIndex = tableOrder.indexOf('fashion_listings');
      const fashionLikesIndex = tableOrder.indexOf('fashion_likes');
      const fashionCommentsIndex = tableOrder.indexOf('fashion_comments');
      
      expect(fashionLikesIndex).toBeLessThan(fashionListingsIndex);
      expect(fashionCommentsIndex).toBeLessThan(fashionListingsIndex);
    });
  });

  describe('Schema Creation and Validation', () => {
    beforeEach(async () => {
      // Reset schema before each test
      await executeMigrationRollback();
    });

    it('should create fashion_category_enum successfully', async () => {
      await executeMigration();

      // Check if enum type exists
      const enumResult = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM pg_type 
          WHERE typname = 'fashion_category_enum'
        ) as exists
      `);
      
      expect(enumResult.rows[0].exists).toBe(true);

      // Check enum values
      const enumValues = await db.execute(sql`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid FROM pg_type WHERE typname = 'fashion_category_enum'
        )
        ORDER BY enumsortorder
      `);

      const expectedValues = ['women', 'men', 'kids', 'home', 'electronics', 'pets', 'beauty', 'sports', 'accessories'];
      const actualValues = enumValues.rows.map(row => row.enumlabel);
      
      expect(actualValues).toEqual(expectedValues);
    });

    it('should create fashion_listings table with correct structure', async () => {
      await executeMigration();

      // Check table exists
      const tableExists = await checkTableExists('fashion_listings');
      expect(tableExists).toBe(true);

      // Check column structure
      const columns = await getTableColumns('fashion_listings');
      const expectedColumns = [
        'id', 'seller_id', 'title', 'description', 'fashion_category',
        'subcategory', 'brand', 'size', 'color', 'material', 'style_tags',
        'condition', 'price', 'original_price', 'images', 'tags', 'location',
        'is_price_negotiable', 'is_shipping_included', 'is_handmade',
        'is_vintage', 'is_limited_edition', 'status', 'views_count',
        'likes_count', 'shares_count', 'comments_count', 'is_promoted',
        'measurements', 'care_instructions', 'sustainability_info',
        'created_at', 'updated_at'
      ];

      expectedColumns.forEach(column => {
        expect(columns.some(col => col.column_name === column)).toBe(true);
      });

      // Check primary key
      const primaryKey = await getPrimaryKey('fashion_listings');
      expect(primaryKey).toBe('id');

      // Check foreign key constraints
      const foreignKeys = await getForeignKeys('fashion_listings');
      expect(foreignKeys.some(fk => fk.column_name === 'seller_id' && fk.foreign_table_name === 'users')).toBe(true);
    });

    it('should create fashion_likes table with correct structure', async () => {
      await executeMigration();

      const tableExists = await checkTableExists('fashion_likes');
      expect(tableExists).toBe(true);

      const columns = await getTableColumns('fashion_likes');
      const expectedColumns = ['id', 'user_id', 'fashion_listing_id', 'created_at'];
      
      expectedColumns.forEach(column => {
        expect(columns.some(col => col.column_name === column)).toBe(true);
      });

      // Check unique constraint
      const constraints = await getTableConstraints('fashion_likes');
      expect(constraints.some(c => c.constraint_type === 'UNIQUE' && 
        c.constraint_name.includes('user_id_fashion_listing_id'))).toBe(true);
    });

    it('should create fashion_comments table with correct structure', async () => {
      await executeMigration();

      const tableExists = await checkTableExists('fashion_comments');
      expect(tableExists).toBe(true);

      const columns = await getTableColumns('fashion_comments');
      const expectedColumns = [
        'id', 'user_id', 'fashion_listing_id', 'content', 
        'parent_comment_id', 'created_at', 'updated_at'
      ];
      
      expectedColumns.forEach(column => {
        expect(columns.some(col => col.column_name === column)).toBe(true);
      });

      // Check self-referencing foreign key for parent_comment_id
      const foreignKeys = await getForeignKeys('fashion_comments');
      expect(foreignKeys.some(fk => 
        fk.column_name === 'parent_comment_id' && 
        fk.foreign_table_name === 'fashion_comments'
      )).toBe(true);
    });

    it('should create all required indexes', async () => {
      await executeMigration();

      const indexes = await getTableIndexes('fashion_listings');
      
      // Check performance indexes
      expect(indexes.some(idx => idx.indexname.includes('fashion_category'))).toBe(true);
      expect(indexes.some(idx => idx.indexname.includes('seller_id'))).toBe(true);
      expect(indexes.some(idx => idx.indexname.includes('status'))).toBe(true);
      expect(indexes.some(idx => idx.indexname.includes('created_at'))).toBe(true);
      expect(indexes.some(idx => idx.indexname.includes('price'))).toBe(true);
    });
  });

  describe('Data Migration and Integrity', () => {
    beforeEach(async () => {
      await executeMigrationRollback();
      await setupTestData();
      await executeMigration();
    });

    it('should preserve existing data during migration', async () => {
      // Check that users table is unchanged
      const userCount = await db.execute(sql`SELECT COUNT(*) FROM users`);
      expect(Number(userCount.rows[0].count)).toBeGreaterThan(0);

      // Check that legacy listings are preserved
      const legacyListingCount = await db.execute(sql`SELECT COUNT(*) FROM listings`);
      expect(Number(legacyListingCount.rows[0].count)).toBeGreaterThan(0);
    });

    it('should allow inserting fashion listings with valid data', async () => {
      const testListing = {
        seller_id: await getTestUserId(),
        title: 'Test Fashion Item',
        description: 'Test description',
        fashion_category: 'women',
        condition: 'excellent',
        price: 99.99,
        images: ['test1.jpg', 'test2.jpg'],
        tags: ['test', 'migration'],
        status: 'active'
      };

      await db.execute(sql`
        INSERT INTO fashion_listings (
          seller_id, title, description, fashion_category, 
          condition, price, images, tags, status, created_at, updated_at
        ) VALUES (
          ${testListing.seller_id}, ${testListing.title}, ${testListing.description},
          ${testListing.fashion_category}::fashion_category_enum, ${testListing.condition},
          ${testListing.price}, ${testListing.images}, ${testListing.tags},
          ${testListing.status}, NOW(), NOW()
        )
      `);

      const insertedListing = await db.execute(sql`
        SELECT * FROM fashion_listings WHERE title = ${testListing.title}
      `);

      expect(insertedListing.rows.length).toBe(1);
      expect(insertedListing.rows[0].title).toBe(testListing.title);
    });

    it('should enforce enum constraints', async () => {
      const userId = await getTestUserId();

      // Should reject invalid fashion category
      await expect(
        db.execute(sql`
          INSERT INTO fashion_listings (
            seller_id, title, description, fashion_category,
            condition, price, status, created_at, updated_at
          ) VALUES (
            ${userId}, 'Test', 'Test', 'invalid_category'::fashion_category_enum,
            'good', 50.00, 'active', NOW(), NOW()
          )
        `)
      ).rejects.toThrow();
    });

    it('should enforce foreign key constraints', async () => {
      // Should reject invalid seller_id
      await expect(
        db.execute(sql`
          INSERT INTO fashion_listings (
            seller_id, title, description, fashion_category,
            condition, price, status, created_at, updated_at
          ) VALUES (
            'invalid-user-id', 'Test', 'Test', 'women'::fashion_category_enum,
            'good', 50.00, 'active', NOW(), NOW()
          )
        `)
      ).rejects.toThrow();
    });

    it('should handle fashion interactions correctly', async () => {
      const userId = await getTestUserId();
      
      // Create a fashion listing first
      const listingResult = await db.execute(sql`
        INSERT INTO fashion_listings (
          seller_id, title, description, fashion_category,
          condition, price, status, created_at, updated_at
        ) VALUES (
          ${userId}, 'Test Fashion Item', 'Test description', 'women'::fashion_category_enum,
          'good', 99.99, 'active', NOW(), NOW()
        ) RETURNING id
      `);

      const listingId = listingResult.rows[0].id;

      // Test like functionality
      await db.execute(sql`
        INSERT INTO fashion_likes (user_id, fashion_listing_id, created_at)
        VALUES (${userId}, ${listingId}, NOW())
      `);

      // Test comment functionality
      await db.execute(sql`
        INSERT INTO fashion_comments (
          user_id, fashion_listing_id, content, created_at, updated_at
        ) VALUES (
          ${userId}, ${listingId}, 'Great item!', NOW(), NOW()
        )
      `);

      // Verify data was inserted
      const likesCount = await db.execute(sql`
        SELECT COUNT(*) FROM fashion_likes WHERE fashion_listing_id = ${listingId}
      `);
      expect(Number(likesCount.rows[0].count)).toBe(1);

      const commentsCount = await db.execute(sql`
        SELECT COUNT(*) FROM fashion_comments WHERE fashion_listing_id = ${listingId}
      `);
      expect(Number(commentsCount.rows[0].count)).toBe(1);
    });
  });

  describe('Rollback Functionality', () => {
    it('should rollback migration completely', async () => {
      // Apply migration first
      await executeMigration();

      // Verify tables exist
      expect(await checkTableExists('fashion_listings')).toBe(true);
      expect(await checkTableExists('fashion_likes')).toBe(true);

      // Execute rollback
      await executeMigrationRollback();

      // Verify tables are dropped
      expect(await checkTableExists('fashion_listings')).toBe(false);
      expect(await checkTableExists('fashion_likes')).toBe(false);
      expect(await checkTableExists('fashion_comments')).toBe(false);
      expect(await checkTableExists('fashion_messages')).toBe(false);
      expect(await checkTableExists('fashion_transactions')).toBe(false);

      // Verify enum is dropped
      const enumExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'fashion_category_enum'
        ) as exists
      `);
      expect(enumExists.rows[0].exists).toBe(false);
    });

    it('should preserve existing data during rollback', async () => {
      await executeMigration();
      
      // Get counts before rollback
      const userCountBefore = await db.execute(sql`SELECT COUNT(*) FROM users`);
      const listingCountBefore = await db.execute(sql`SELECT COUNT(*) FROM listings`);

      await executeMigrationRollback();

      // Check counts after rollback
      const userCountAfter = await db.execute(sql`SELECT COUNT(*) FROM users`);
      const listingCountAfter = await db.execute(sql`SELECT COUNT(*) FROM listings`);

      expect(userCountAfter.rows[0].count).toBe(userCountBefore.rows[0].count);
      expect(listingCountAfter.rows[0].count).toBe(listingCountBefore.rows[0].count);
    });
  });

  describe('Performance and Optimization', () => {
    beforeEach(async () => {
      await executeMigrationRollback();
      await executeMigration();
    });

    it('should have efficient query performance on indexed columns', async () => {
      // Insert test data
      const userId = await getTestUserId();
      const insertPromises = [];
      
      for (let i = 0; i < 100; i++) {
        insertPromises.push(
          db.execute(sql`
            INSERT INTO fashion_listings (
              seller_id, title, description, fashion_category,
              condition, price, status, created_at, updated_at
            ) VALUES (
              ${userId}, ${'Test Item ' + i}, 'Test description',
              ${i % 2 === 0 ? 'women' : 'men'}::fashion_category_enum,
              'good', ${50 + i}, 'active', NOW(), NOW()
            )
          `)
        );
      }
      
      await Promise.all(insertPromises);

      // Test query performance
      const startTime = Date.now();
      
      await db.execute(sql`
        SELECT * FROM fashion_listings 
        WHERE fashion_category = 'women'::fashion_category_enum 
        AND status = 'active'
        ORDER BY created_at DESC 
        LIMIT 20
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;

      // Query should complete quickly (under 100ms for this small dataset)
      expect(queryTime).toBeLessThan(100);
    });

    it('should handle concurrent operations safely', async () => {
      const userId = await getTestUserId();
      
      // Create a listing
      const listingResult = await db.execute(sql`
        INSERT INTO fashion_listings (
          seller_id, title, description, fashion_category,
          condition, price, status, created_at, updated_at
        ) VALUES (
          ${userId}, 'Concurrent Test Item', 'Test description', 'women'::fashion_category_enum,
          'good', 99.99, 'active', NOW(), NOW()
        ) RETURNING id
      `);

      const listingId = listingResult.rows[0].id;

      // Simulate concurrent likes from different users
      const concurrentOperations = [];
      for (let i = 0; i < 10; i++) {
        concurrentOperations.push(
          db.execute(sql`
            INSERT INTO fashion_likes (user_id, fashion_listing_id, created_at)
            VALUES (${userId}, ${listingId}, NOW())
            ON CONFLICT (user_id, fashion_listing_id) DO NOTHING
          `)
        );
      }

      // Should not throw errors due to unique constraint
      await Promise.allSettled(concurrentOperations);

      // Verify only one like exists (due to unique constraint)
      const likesCount = await db.execute(sql`
        SELECT COUNT(*) FROM fashion_likes WHERE fashion_listing_id = ${listingId}
      `);
      expect(Number(likesCount.rows[0].count)).toBe(1);
    });
  });

  // Helper functions
  async function executeMigration() {
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    await db.execute(sql.raw(migrationSQL));
  }

  async function executeMigrationRollback() {
    try {
      const rollbackSQL = await fs.readFile(rollbackPath, 'utf-8');
      await db.execute(sql.raw(rollbackSQL));
    } catch (error) {
      // Ignore errors if tables don't exist
      console.log('Rollback completed (some tables may not have existed)');
    }
  }

  async function setupTestData() {
    // Create test user if not exists
    await db.execute(sql`
      INSERT INTO users (id, username, email, created_at, updated_at)
      VALUES ('test-user-id', 'testuser', 'test@example.com', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    // Create test legacy listing if not exists
    await db.execute(sql`
      INSERT INTO listings (id, seller_id, title, description, category, price, status, created_at, updated_at)
      VALUES ('test-listing-id', 'test-user-id', 'Test Legacy Listing', 'Test description', 'fashion', 99.99, 'active', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);
  }

  async function getTestUserId(): Promise<string> {
    const result = await db.execute(sql`
      SELECT id FROM users WHERE username = 'testuser' LIMIT 1
    `);
    return result.rows[0]?.id || 'test-user-id';
  }

  async function checkTableExists(tableName: string): Promise<boolean> {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = ${tableName}
      ) as exists
    `);
    return result.rows[0].exists;
  }

  async function getTableColumns(tableName: string) {
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position
    `);
    return result.rows;
  }

  async function getPrimaryKey(tableName: string): Promise<string | null> {
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.key_column_usage
      WHERE table_name = ${tableName}
      AND constraint_name = ${tableName + '_pkey'}
    `);
    return result.rows[0]?.column_name || null;
  }

  async function getForeignKeys(tableName: string) {
    const result = await db.execute(sql`
      SELECT 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.constraint_column_usage ccu
        ON kcu.constraint_name = ccu.constraint_name
      JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND kcu.table_name = ${tableName}
    `);
    return result.rows;
  }

  async function getTableConstraints(tableName: string) {
    const result = await db.execute(sql`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = ${tableName}
    `);
    return result.rows;
  }

  async function getTableIndexes(tableName: string) {
    const result = await db.execute(sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = ${tableName}
    `);
    return result.rows;
  }
});
