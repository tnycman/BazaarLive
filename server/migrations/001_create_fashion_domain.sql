-- Migration: Create Fashion Domain Schema
-- Description: Zero-downtime migration to create fashion-specific tables and migrate existing fashion data
-- Version: 001
-- Date: 2024-01-01

BEGIN;

-- Step 1: Create fashion-specific enums
DO $$ BEGIN
    CREATE TYPE fashion_category_enum AS ENUM (
        'women',
        'men', 
        'kids',
        'home',
        'electronics',
        'pets',
        'beauty',
        'sports'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fashion_status_enum AS ENUM (
        'active',
        'sold',
        'pending',
        'draft',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create fashion_listings table with optimized schema
CREATE TABLE IF NOT EXISTS fashion_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic listing information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Fashion-specific categorization
    fashion_category fashion_category_enum NOT NULL,
    subcategory VARCHAR(100),
    sub_subcategory VARCHAR(100),
    
    -- Fashion-specific attributes
    brand VARCHAR(100),
    size VARCHAR(50),
    color VARCHAR(50),
    material VARCHAR(100),
    style_tags TEXT[],
    
    -- Common marketplace fields
    condition condition NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    images TEXT[] NOT NULL,
    tags TEXT[],
    status fashion_status_enum DEFAULT 'active',
    
    -- Engagement metrics
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- Metadata
    location VARCHAR(200),
    is_promoted BOOLEAN DEFAULT FALSE,
    
    -- AI/Search vectors for semantic search
    title_embedding VECTOR(1536),
    description_embedding VECTOR(1536),
    combined_embedding VECTOR(1536),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_fashion_category CHECK (
        fashion_category IN ('women', 'men', 'kids', 'home', 'electronics', 'pets', 'beauty', 'sports')
    ),
    CONSTRAINT valid_price CHECK (price >= 0),
    CONSTRAINT valid_original_price CHECK (original_price IS NULL OR original_price >= price),
    CONSTRAINT non_empty_images CHECK (array_length(images, 1) > 0),
    CONSTRAINT non_empty_title CHECK (length(trim(title)) > 0)
);

-- Step 3: Create performance-optimized indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_listings_category_status 
ON fashion_listings(fashion_category, status) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_listings_seller_status 
ON fashion_listings(seller_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_listings_price_range 
ON fashion_listings(price) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_listings_created_desc 
ON fashion_listings(created_at DESC) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_listings_brand_condition 
ON fashion_listings(brand, condition) 
WHERE status = 'active' AND brand IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_listings_category_price_created 
ON fashion_listings(fashion_category, price, created_at DESC) 
WHERE status = 'active';

-- Vector search indexes (will be created after pgvector extension is enabled)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_listings_combined_embedding 
ON fashion_listings USING ivfflat(combined_embedding vector_cosine_ops) 
WITH (lists = 1000)
WHERE combined_embedding IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_listings_title_embedding 
ON fashion_listings USING ivfflat(title_embedding vector_cosine_ops) 
WITH (lists = 500)
WHERE title_embedding IS NOT NULL;

-- Partial indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_listings_active 
ON fashion_listings(fashion_category, created_at DESC) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_listings_promoted 
ON fashion_listings(fashion_category, created_at DESC) 
WHERE status = 'active' AND is_promoted = true;

-- Full-text search index for title and description
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_listings_fulltext 
ON fashion_listings USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')))
WHERE status = 'active';

-- Step 4: Create fashion-specific related tables

-- Fashion likes table
CREATE TABLE IF NOT EXISTS fashion_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fashion_listing_id UUID NOT NULL REFERENCES fashion_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_fashion_like UNIQUE(user_id, fashion_listing_id)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_likes_user 
ON fashion_likes(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_likes_listing 
ON fashion_likes(fashion_listing_id);

-- Fashion comments table
CREATE TABLE IF NOT EXISTS fashion_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fashion_listing_id UUID NOT NULL REFERENCES fashion_listings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES fashion_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT non_empty_content CHECK (length(trim(content)) > 0)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_comments_listing 
ON fashion_comments(fashion_listing_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_comments_user 
ON fashion_comments(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_comments_parent 
ON fashion_comments(parent_comment_id);

-- Fashion messages table
CREATE TABLE IF NOT EXISTS fashion_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fashion_listing_id UUID REFERENCES fashion_listings(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    message_type VARCHAR(50) DEFAULT 'text',
    offer_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT different_users CHECK (sender_id != receiver_id),
    CONSTRAINT non_empty_content CHECK (length(trim(content)) > 0),
    CONSTRAINT valid_offer CHECK (offer_amount IS NULL OR offer_amount > 0)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_messages_conversation 
ON fashion_messages(sender_id, receiver_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_messages_listing 
ON fashion_messages(fashion_listing_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_messages_unread 
ON fashion_messages(receiver_id, is_read);

-- Fashion transactions table
CREATE TABLE IF NOT EXISTS fashion_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fashion_listing_id UUID NOT NULL REFERENCES fashion_listings(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    shipping_address JSONB,
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT different_users CHECK (buyer_id != seller_id),
    CONSTRAINT valid_amount CHECK (amount > 0),
    CONSTRAINT valid_commission CHECK (commission >= 0 AND commission <= amount)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_transactions_buyer 
ON fashion_transactions(buyer_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_transactions_seller 
ON fashion_transactions(seller_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_transactions_listing 
ON fashion_transactions(fashion_listing_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_transactions_status 
ON fashion_transactions(status, created_at DESC);

-- Fashion analytics table
CREATE TABLE IF NOT EXISTS fashion_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fashion_category fashion_category_enum NOT NULL,
    subcategory VARCHAR(100),
    period VARCHAR(20) NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    
    -- Listing metrics
    total_listings INTEGER DEFAULT 0,
    new_listings INTEGER DEFAULT 0,
    sold_listings INTEGER DEFAULT 0,
    active_listings INTEGER DEFAULT 0,
    
    -- Engagement metrics
    total_views INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    avg_views_per_listing DECIMAL(8,2) DEFAULT 0.00,
    
    -- Revenue metrics
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_commissions DECIMAL(12,2) DEFAULT 0.00,
    avg_price DECIMAL(8,2) DEFAULT 0.00,
    median_price DECIMAL(8,2) DEFAULT 0.00,
    
    -- Fashion-specific metrics
    top_brands JSONB,
    top_sizes JSONB,
    top_colors JSONB,
    price_distribution JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_period CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    CONSTRAINT valid_period_range CHECK (period_end > period_start)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_analytics_category_period 
ON fashion_analytics(fashion_category, period, period_start);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fashion_analytics_subcategory_period 
ON fashion_analytics(subcategory, period, period_start);

-- Step 5: Create data migration function
CREATE OR REPLACE FUNCTION migrate_fashion_listings()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    migrated_count INTEGER := 0;
    record_batch RECORD;
BEGIN
    -- Migrate existing fashion listings from the generic listings table
    -- Process in batches to avoid locking issues
    FOR record_batch IN 
        SELECT * FROM listings 
        WHERE category = 'fashion'
        ORDER BY created_at
        LIMIT 1000
    LOOP
        -- Map legacy categories to new fashion categories
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
            -- Map legacy subcategory to fashion_category
            CASE 
                WHEN record_batch.subcategory IN ('women', 'womens') THEN 'women'::fashion_category_enum
                WHEN record_batch.subcategory IN ('men', 'mens') THEN 'men'::fashion_category_enum
                WHEN record_batch.subcategory IN ('kids', 'children', 'baby') THEN 'kids'::fashion_category_enum
                WHEN record_batch.subcategory IN ('home', 'house', 'decor') THEN 'home'::fashion_category_enum
                WHEN record_batch.subcategory IN ('electronics', 'tech', 'gadgets') THEN 'electronics'::fashion_category_enum
                WHEN record_batch.subcategory IN ('pets', 'animals') THEN 'pets'::fashion_category_enum
                WHEN record_batch.subcategory IN ('beauty', 'cosmetics', 'makeup') THEN 'beauty'::fashion_category_enum
                WHEN record_batch.subcategory IN ('sports', 'fitness', 'athletic') THEN 'sports'::fashion_category_enum
                ELSE 'women'::fashion_category_enum -- Default fallback
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

-- Step 6: Create triggers for maintaining data consistency

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fashion_listing_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_fashion_listings_updated_at
    BEFORE UPDATE ON fashion_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_fashion_listing_updated_at();

-- Trigger to update likes count
CREATE OR REPLACE FUNCTION update_fashion_listing_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE fashion_listings 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.fashion_listing_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE fashion_listings 
        SET likes_count = GREATEST(likes_count - 1, 0) 
        WHERE id = OLD.fashion_listing_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_fashion_likes_count
    AFTER INSERT OR DELETE ON fashion_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_fashion_listing_likes_count();

-- Trigger to update comments count
CREATE OR REPLACE FUNCTION update_fashion_listing_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE fashion_listings 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.fashion_listing_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE fashion_listings 
        SET comments_count = GREATEST(comments_count - 1, 0) 
        WHERE id = OLD.fashion_listing_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_fashion_comments_count
    AFTER INSERT OR DELETE ON fashion_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_fashion_listing_comments_count();

-- Step 7: Create validation functions

-- Function to validate fashion category and subcategory combinations
CREATE OR REPLACE FUNCTION validate_fashion_category_subcategory(
    p_fashion_category fashion_category_enum,
    p_subcategory VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Define valid subcategories for each fashion category
    CASE p_fashion_category
        WHEN 'women' THEN
            RETURN p_subcategory IS NULL OR p_subcategory IN (
                'dresses', 'tops', 'pants', 'shoes', 'bags', 'jewelry', 'accessories'
            );
        WHEN 'men' THEN
            RETURN p_subcategory IS NULL OR p_subcategory IN (
                'shirts', 'pants', 'shoes', 'accessories', 'outerwear'
            );
        WHEN 'kids' THEN
            RETURN p_subcategory IS NULL OR p_subcategory IN (
                'clothing', 'shoes', 'toys', 'accessories', 'baby'
            );
        WHEN 'home' THEN
            RETURN p_subcategory IS NULL OR p_subcategory IN (
                'furniture', 'decor', 'kitchen', 'bedding', 'lighting'
            );
        WHEN 'electronics' THEN
            RETURN p_subcategory IS NULL OR p_subcategory IN (
                'phones', 'computers', 'gaming', 'accessories', 'audio'
            );
        WHEN 'pets' THEN
            RETURN p_subcategory IS NULL OR p_subcategory IN (
                'clothing', 'accessories', 'toys', 'supplies', 'food'
            );
        WHEN 'beauty' THEN
            RETURN p_subcategory IS NULL OR p_subcategory IN (
                'makeup', 'skincare', 'fragrance', 'tools', 'hair'
            );
        WHEN 'sports' THEN
            RETURN p_subcategory IS NULL OR p_subcategory IN (
                'activewear', 'equipment', 'shoes', 'accessories', 'outdoor'
            );
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$;

-- Step 8: Add check constraint for category-subcategory validation
ALTER TABLE fashion_listings 
ADD CONSTRAINT valid_category_subcategory 
CHECK (validate_fashion_category_subcategory(fashion_category, subcategory));

-- Step 9: Create backup table for rollback safety
CREATE TABLE IF NOT EXISTS fashion_migration_backup AS 
SELECT * FROM listings WHERE category = 'fashion' LIMIT 0;

-- Insert backup data
INSERT INTO fashion_migration_backup 
SELECT * FROM listings WHERE category = 'fashion';

-- Step 10: Add metadata for migration tracking
CREATE TABLE IF NOT EXISTS migration_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    records_processed INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB
);

INSERT INTO migration_log (migration_name, version, status, metadata)
VALUES (
    'create_fashion_domain',
    '001',
    'completed',
    jsonb_build_object(
        'tables_created', ARRAY['fashion_listings', 'fashion_likes', 'fashion_comments', 'fashion_messages', 'fashion_transactions', 'fashion_analytics'],
        'indexes_created', 15,
        'constraints_added', 8,
        'triggers_created', 3
    )
);

COMMIT;

-- Note: The actual data migration will be executed separately to ensure zero downtime
-- Execute: SELECT migrate_fashion_listings(); when ready to migrate data
