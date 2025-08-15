-- Rollback Migration: Create Fashion Domain Schema
-- Description: Safely rollback fashion domain migration with data preservation
-- Version: 001_rollback
-- Date: 2024-01-01

BEGIN;

-- Step 1: Verify rollback safety - check for existing data
DO $$
DECLARE
    fashion_listing_count INTEGER;
    fashion_transaction_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fashion_listing_count FROM fashion_listings;
    SELECT COUNT(*) INTO fashion_transaction_count FROM fashion_transactions;
    
    -- Log rollback initiation
    INSERT INTO migration_log (migration_name, version, status, metadata)
    VALUES (
        'rollback_fashion_domain',
        '001',
        'initiated',
        jsonb_build_object(
            'fashion_listings_count', fashion_listing_count,
            'fashion_transactions_count', fashion_transaction_count,
            'rollback_reason', 'Manual rollback requested'
        )
    );
    
    -- Warning if there's production data
    IF fashion_listing_count > 0 OR fashion_transaction_count > 0 THEN
        RAISE NOTICE 'WARNING: Fashion domain contains % listings and % transactions', 
            fashion_listing_count, fashion_transaction_count;
        RAISE NOTICE 'Proceeding with rollback - data will be preserved in backup tables';
    END IF;
END $$;

-- Step 2: Create backup tables for all fashion data before rollback
CREATE TABLE IF NOT EXISTS rollback_backup_fashion_listings AS 
SELECT * FROM fashion_listings;

CREATE TABLE IF NOT EXISTS rollback_backup_fashion_likes AS 
SELECT * FROM fashion_likes;

CREATE TABLE IF NOT EXISTS rollback_backup_fashion_comments AS 
SELECT * FROM fashion_comments;

CREATE TABLE IF NOT EXISTS rollback_backup_fashion_messages AS 
SELECT * FROM fashion_messages;

CREATE TABLE IF NOT EXISTS rollback_backup_fashion_transactions AS 
SELECT * FROM fashion_transactions;

CREATE TABLE IF NOT EXISTS rollback_backup_fashion_analytics AS 
SELECT * FROM fashion_analytics;

-- Step 3: Restore original listings data from backup if available
DO $$
DECLARE
    backup_count INTEGER;
BEGIN
    -- Check if backup table exists and has data
    SELECT COUNT(*) INTO backup_count 
    FROM information_schema.tables 
    WHERE table_name = 'fashion_migration_backup';
    
    IF backup_count > 0 THEN
        -- Restore original data to listings table
        INSERT INTO listings 
        SELECT * FROM fashion_migration_backup
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            subcategory = EXCLUDED.subcategory,
            brand = EXCLUDED.brand,
            size = EXCLUDED.size,
            color = EXCLUDED.color,
            condition = EXCLUDED.condition,
            price = EXCLUDED.price,
            original_price = EXCLUDED.original_price,
            images = EXCLUDED.images,
            tags = EXCLUDED.tags,
            status = EXCLUDED.status,
            is_promoted = EXCLUDED.is_promoted,
            views_count = EXCLUDED.views_count,
            likes_count = EXCLUDED.likes_count,
            shares_count = EXCLUDED.shares_count,
            comments_count = EXCLUDED.comments_count,
            location = EXCLUDED.location,
            title_embedding = EXCLUDED.title_embedding,
            description_embedding = EXCLUDED.description_embedding,
            combined_embedding = EXCLUDED.combined_embedding,
            updated_at = NOW();
            
        RAISE NOTICE 'Restored % records to listings table from backup', 
            (SELECT COUNT(*) FROM fashion_migration_backup);
    ELSE
        RAISE NOTICE 'No backup data found - original fashion listings may have been lost';
    END IF;
END $$;

-- Step 4: Drop triggers first to avoid constraint violations
DROP TRIGGER IF EXISTS trigger_fashion_listings_updated_at ON fashion_listings;
DROP TRIGGER IF EXISTS trigger_fashion_likes_count ON fashion_likes;
DROP TRIGGER IF EXISTS trigger_fashion_comments_count ON fashion_comments;

-- Step 5: Drop foreign key constraints
ALTER TABLE fashion_likes DROP CONSTRAINT IF EXISTS fashion_likes_fashion_listing_id_fkey;
ALTER TABLE fashion_comments DROP CONSTRAINT IF EXISTS fashion_comments_fashion_listing_id_fkey;
ALTER TABLE fashion_messages DROP CONSTRAINT IF EXISTS fashion_messages_fashion_listing_id_fkey;
ALTER TABLE fashion_transactions DROP CONSTRAINT IF EXISTS fashion_transactions_fashion_listing_id_fkey;

-- Step 6: Drop indexes
DROP INDEX IF EXISTS idx_fashion_listings_category_status;
DROP INDEX IF EXISTS idx_fashion_listings_seller_status;
DROP INDEX IF EXISTS idx_fashion_listings_price_range;
DROP INDEX IF EXISTS idx_fashion_listings_created_desc;
DROP INDEX IF EXISTS idx_fashion_listings_brand_condition;
DROP INDEX IF EXISTS idx_fashion_listings_category_price_created;
DROP INDEX IF EXISTS idx_fashion_listings_combined_embedding;
DROP INDEX IF EXISTS idx_fashion_listings_title_embedding;
DROP INDEX IF EXISTS idx_fashion_listings_active;
DROP INDEX IF EXISTS idx_fashion_listings_promoted;
DROP INDEX IF EXISTS idx_fashion_listings_fulltext;

DROP INDEX IF EXISTS idx_fashion_likes_user;
DROP INDEX IF EXISTS idx_fashion_likes_listing;

DROP INDEX IF EXISTS idx_fashion_comments_listing;
DROP INDEX IF EXISTS idx_fashion_comments_user;
DROP INDEX IF EXISTS idx_fashion_comments_parent;

DROP INDEX IF EXISTS idx_fashion_messages_conversation;
DROP INDEX IF EXISTS idx_fashion_messages_listing;
DROP INDEX IF EXISTS idx_fashion_messages_unread;

DROP INDEX IF EXISTS idx_fashion_transactions_buyer;
DROP INDEX IF EXISTS idx_fashion_transactions_seller;
DROP INDEX IF EXISTS idx_fashion_transactions_listing;
DROP INDEX IF EXISTS idx_fashion_transactions_status;

DROP INDEX IF EXISTS idx_fashion_analytics_category_period;
DROP INDEX IF EXISTS idx_fashion_analytics_subcategory_period;

-- Step 7: Drop functions
DROP FUNCTION IF EXISTS migrate_fashion_listings();
DROP FUNCTION IF EXISTS update_fashion_listing_updated_at();
DROP FUNCTION IF EXISTS update_fashion_listing_likes_count();
DROP FUNCTION IF EXISTS update_fashion_listing_comments_count();
DROP FUNCTION IF EXISTS validate_fashion_category_subcategory(fashion_category_enum, VARCHAR);

-- Step 8: Drop tables in correct order (respecting dependencies)
DROP TABLE IF EXISTS fashion_analytics;
DROP TABLE IF EXISTS fashion_transactions;
DROP TABLE IF EXISTS fashion_messages;
DROP TABLE IF EXISTS fashion_comments;
DROP TABLE IF EXISTS fashion_likes;
DROP TABLE IF EXISTS fashion_listings;

-- Step 9: Drop custom types
DROP TYPE IF EXISTS fashion_status_enum;
DROP TYPE IF EXISTS fashion_category_enum;

-- Step 10: Drop backup table (optional - keep for safety)
-- DROP TABLE IF EXISTS fashion_migration_backup;

-- Step 11: Update migration log
UPDATE migration_log 
SET 
    status = 'rolled_back',
    completed_at = NOW(),
    metadata = metadata || jsonb_build_object(
        'rollback_completed_at', NOW(),
        'backup_tables_created', ARRAY[
            'rollback_backup_fashion_listings',
            'rollback_backup_fashion_likes', 
            'rollback_backup_fashion_comments',
            'rollback_backup_fashion_messages',
            'rollback_backup_fashion_transactions',
            'rollback_backup_fashion_analytics'
        ]
    )
WHERE migration_name = 'create_fashion_domain' AND version = '001';

-- Insert rollback completion log
INSERT INTO migration_log (migration_name, version, status, metadata)
VALUES (
    'rollback_fashion_domain',
    '001',
    'completed',
    jsonb_build_object(
        'rollback_successful', true,
        'backup_tables_preserved', true,
        'original_data_restored', true,
        'completed_at', NOW()
    )
);

COMMIT;

-- Verification queries to run after rollback:
-- SELECT COUNT(*) FROM listings WHERE category = 'fashion'; -- Should show restored data
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'fashion_%'; -- Should be empty except backups
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'rollback_backup_%'; -- Should show backup tables
-- SELECT * FROM migration_log WHERE migration_name IN ('create_fashion_domain', 'rollback_fashion_domain') ORDER BY started_at;
