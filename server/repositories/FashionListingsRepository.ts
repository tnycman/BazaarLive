// Fashion Listings Repository - Enterprise-grade data access layer
import { eq, and, or, gte, lte, desc, asc, sql, inArray, ilike, count, isNull, isNotNull } from 'drizzle-orm';
import { db } from '../db.js';
import { 
  fashionListings, 
  fashionLikes, 
  fashionComments, 
  fashionMessages, 
  fashionTransactions,
  users 
} from '@shared/fashion-schema';
import {
  FashionListing,
  FashionListingCreate,
  FashionListingUpdate,
  FashionListingFilters,
  FashionCategory,
  FashionListingStatus,
  ProductCondition,
  PaginationOptions,
  PaginatedResponse
} from '@shared/types/FashionDomain';
import { Logger } from '../middleware/Logger.js';

export interface RepositoryConfig {
  enableQueryLogging: boolean;
  enablePerformanceTracking: boolean;
  defaultTimeout: number;
  maxRetries: number;
}

export interface QueryOptions {
  timeout?: number;
  retries?: number;
  enableCache?: boolean;
  cacheKey?: string;
}

export interface AggregateData {
  totalListings: number;
  activeListings: number;
  averagePrice: number;
  totalViews: number;
  totalLikes: number;
}

export class FashionListingsRepository {
  private logger: Logger;
  private config: RepositoryConfig;

  constructor(config: Partial<RepositoryConfig> = {}) {
    this.logger = new Logger('FashionListingsRepository');
    this.config = {
      enableQueryLogging: process.env.NODE_ENV === 'development',
      enablePerformanceTracking: true,
      defaultTimeout: 30000, // 30 seconds
      maxRetries: 3,
      ...config
    };
  }

  /**
   * Create a new fashion listing
   */
  async create(
    listingData: FashionListingCreate & { sellerId: string },
    options: QueryOptions = {}
  ): Promise<FashionListing> {
    const startTime = Date.now();

    try {
      this.logQuery('create', { sellerId: listingData.sellerId, title: listingData.title });

      const [listing] = await db
        .insert(fashionListings)
        .values({
          ...listingData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      this.trackPerformance('create', Date.now() - startTime);
      
      this.logger.debug('Fashion listing created', {
        listingId: listing.id,
        sellerId: listingData.sellerId,
        category: listing.fashionCategory
      });

      return listing;

    } catch (error) {
      this.logger.error('Failed to create fashion listing', {
        sellerId: listingData.sellerId,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Find listing by ID
   */
  async findById(
    id: string,
    options: QueryOptions = {}
  ): Promise<FashionListing | null> {
    const startTime = Date.now();

    try {
      this.logQuery('findById', { id });

      const result = await db
        .select()
        .from(fashionListings)
        .where(eq(fashionListings.id, id))
        .limit(1);

      this.trackPerformance('findById', Date.now() - startTime);

      return result.length > 0 ? result[0] : null;

    } catch (error) {
      this.logger.error('Failed to find listing by ID', {
        id,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Find listings with advanced filtering and pagination
   */
  async findByFilters(
    filters: FashionListingFilters,
    pagination: PaginationOptions,
    sortBy: string = 'newest',
    options: QueryOptions = {}
  ): Promise<PaginatedResponse<FashionListing>> {
    const startTime = Date.now();

    try {
      this.logQuery('findByFilters', { filters, pagination, sortBy });

      // Build where conditions
      const conditions = this.buildWhereConditions(filters);

      // Build sort order
      const orderBy = this.buildOrderBy(sortBy);

      // Execute paginated query
      const [items, totalResult] = await Promise.all([
        db
          .select()
          .from(fashionListings)
          .where(and(...conditions))
          .orderBy(...orderBy)
          .limit(pagination.limit)
          .offset(pagination.offset),
        
        db
          .select({ count: count() })
          .from(fashionListings)
          .where(and(...conditions))
      ]);

      const total = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(total / pagination.limit);

      const result: PaginatedResponse<FashionListing> = {
        items,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1
      };

      this.trackPerformance('findByFilters', Date.now() - startTime);

      this.logger.debug('Filtered listings retrieved', {
        filters,
        resultCount: items.length,
        total,
        duration: Date.now() - startTime
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to find listings by filters', {
        filters,
        pagination,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Find listings by seller ID
   */
  async findBySellerId(
    sellerId: string,
    status?: FashionListingStatus,
    pagination?: PaginationOptions,
    options: QueryOptions = {}
  ): Promise<PaginatedResponse<FashionListing> | FashionListing[]> {
    const startTime = Date.now();

    try {
      this.logQuery('findBySellerId', { sellerId, status });

      const conditions = [eq(fashionListings.sellerId, sellerId)];
      
      if (status) {
        conditions.push(eq(fashionListings.status, status));
      }

      if (pagination) {
        const [items, totalResult] = await Promise.all([
          db
            .select()
            .from(fashionListings)
            .where(and(...conditions))
            .orderBy(desc(fashionListings.createdAt))
            .limit(pagination.limit)
            .offset(pagination.offset),
          
          db
            .select({ count: count() })
            .from(fashionListings)
            .where(and(...conditions))
        ]);

        const total = totalResult[0]?.count || 0;
        const totalPages = Math.ceil(total / pagination.limit);

        this.trackPerformance('findBySellerId', Date.now() - startTime);

        return {
          items,
          total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages,
          hasNextPage: pagination.page < totalPages,
          hasPreviousPage: pagination.page > 1
        };
      } else {
        const items = await db
          .select()
          .from(fashionListings)
          .where(and(...conditions))
          .orderBy(desc(fashionListings.createdAt));

        this.trackPerformance('findBySellerId', Date.now() - startTime);
        return items;
      }

    } catch (error) {
      this.logger.error('Failed to find listings by seller ID', {
        sellerId,
        status,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Update listing
   */
  async update(
    id: string,
    updates: Partial<FashionListingUpdate>,
    options: QueryOptions = {}
  ): Promise<FashionListing> {
    const startTime = Date.now();

    try {
      this.logQuery('update', { id, updates: Object.keys(updates) });

      const [updatedListing] = await db
        .update(fashionListings)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(fashionListings.id, id))
        .returning();

      if (!updatedListing) {
        throw new Error(`Listing with ID ${id} not found`);
      }

      this.trackPerformance('update', Date.now() - startTime);

      this.logger.debug('Fashion listing updated', {
        listingId: id,
        updatedFields: Object.keys(updates),
        duration: Date.now() - startTime
      });

      return updatedListing;

    } catch (error) {
      this.logger.error('Failed to update fashion listing', {
        id,
        updates: Object.keys(updates),
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Update listing status
   */
  async updateStatus(
    id: string,
    status: FashionListingStatus,
    options: QueryOptions = {}
  ): Promise<FashionListing> {
    return this.update(id, { status }, options);
  }

  /**
   * Soft delete listing (set status to archived)
   */
  async softDelete(
    id: string,
    options: QueryOptions = {}
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logQuery('softDelete', { id });

      await db
        .update(fashionListings)
        .set({
          status: 'archived',
          updatedAt: new Date()
        })
        .where(eq(fashionListings.id, id));

      this.trackPerformance('softDelete', Date.now() - startTime);

      this.logger.debug('Fashion listing soft deleted', {
        listingId: id,
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.logger.error('Failed to soft delete fashion listing', {
        id,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Hard delete listing (permanent removal)
   */
  async hardDelete(
    id: string,
    options: QueryOptions = {}
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logQuery('hardDelete', { id });

      // Delete in proper order to handle foreign key constraints
      await db.transaction(async (tx) => {
        // Delete related records first
        await tx.delete(fashionLikes).where(eq(fashionLikes.fashionListingId, id));
        await tx.delete(fashionComments).where(eq(fashionComments.fashionListingId, id));
        await tx.delete(fashionMessages).where(eq(fashionMessages.fashionListingId, id));
        await tx.delete(fashionTransactions).where(eq(fashionTransactions.fashionListingId, id));
        
        // Delete the listing
        await tx.delete(fashionListings).where(eq(fashionListings.id, id));
      });

      this.trackPerformance('hardDelete', Date.now() - startTime);

      this.logger.info('Fashion listing hard deleted', {
        listingId: id,
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.logger.error('Failed to hard delete fashion listing', {
        id,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(
    id: string,
    options: QueryOptions = {}
  ): Promise<void> {
    const startTime = Date.now();

    try {
      await db
        .update(fashionListings)
        .set({
          viewsCount: sql`${fashionListings.viewsCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(fashionListings.id, id));

      this.trackPerformance('incrementViewCount', Date.now() - startTime);

    } catch (error) {
      this.logger.error('Failed to increment view count', {
        id,
        error: error.message
      });
      // Don't throw error for view count failures
    }
  }

  /**
   * Increment like count
   */
  async incrementLikeCount(
    id: string,
    options: QueryOptions = {}
  ): Promise<void> {
    const startTime = Date.now();

    try {
      await db
        .update(fashionListings)
        .set({
          likesCount: sql`${fashionListings.likesCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(fashionListings.id, id));

      this.trackPerformance('incrementLikeCount', Date.now() - startTime);

    } catch (error) {
      this.logger.error('Failed to increment like count', {
        id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Decrement like count
   */
  async decrementLikeCount(
    id: string,
    options: QueryOptions = {}
  ): Promise<void> {
    const startTime = Date.now();

    try {
      await db
        .update(fashionListings)
        .set({
          likesCount: sql`GREATEST(${fashionListings.likesCount} - 1, 0)`,
          updatedAt: new Date()
        })
        .where(eq(fashionListings.id, id));

      this.trackPerformance('decrementLikeCount', Date.now() - startTime);

    } catch (error) {
      this.logger.error('Failed to decrement like count', {
        id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get aggregate data for analytics
   */
  async getAggregateData(
    filters?: Partial<FashionListingFilters>,
    options: QueryOptions = {}
  ): Promise<AggregateData> {
    const startTime = Date.now();

    try {
      this.logQuery('getAggregateData', { filters });

      const conditions = filters ? this.buildWhereConditions(filters) : [sql`1=1`];

      const result = await db
        .select({
          totalListings: count(),
          activeListings: count(sql`CASE WHEN ${fashionListings.status} = 'active' THEN 1 END`),
          averagePrice: sql<number>`AVG(${fashionListings.price})`,
          totalViews: sql<number>`SUM(${fashionListings.viewsCount})`,
          totalLikes: sql<number>`SUM(${fashionListings.likesCount})`
        })
        .from(fashionListings)
        .where(and(...conditions));

      this.trackPerformance('getAggregateData', Date.now() - startTime);

      const data = result[0];
      return {
        totalListings: data.totalListings || 0,
        activeListings: data.activeListings || 0,
        averagePrice: data.averagePrice || 0,
        totalViews: data.totalViews || 0,
        totalLikes: data.totalLikes || 0
      };

    } catch (error) {
      this.logger.error('Failed to get aggregate data', {
        filters,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Search listings with text search
   */
  async searchByText(
    searchText: string,
    filters?: FashionListingFilters,
    pagination?: PaginationOptions,
    options: QueryOptions = {}
  ): Promise<PaginatedResponse<FashionListing> | FashionListing[]> {
    const startTime = Date.now();

    try {
      this.logQuery('searchByText', { searchText, filters });

      const conditions = filters ? this.buildWhereConditions(filters) : [];
      
      // Add text search condition
      const searchCondition = sql`(
        ${fashionListings.title} ILIKE ${`%${searchText}%`} OR
        ${fashionListings.description} ILIKE ${`%${searchText}%`} OR
        ${fashionListings.brand} ILIKE ${`%${searchText}%`} OR
        array_to_string(${fashionListings.tags}, ' ') ILIKE ${`%${searchText}%`}
      )`;
      
      conditions.push(searchCondition);

      if (pagination) {
        const [items, totalResult] = await Promise.all([
          db
            .select()
            .from(fashionListings)
            .where(and(...conditions))
            .orderBy(desc(fashionListings.createdAt))
            .limit(pagination.limit)
            .offset(pagination.offset),
          
          db
            .select({ count: count() })
            .from(fashionListings)
            .where(and(...conditions))
        ]);

        const total = totalResult[0]?.count || 0;
        const totalPages = Math.ceil(total / pagination.limit);

        this.trackPerformance('searchByText', Date.now() - startTime);

        return {
          items,
          total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages,
          hasNextPage: pagination.page < totalPages,
          hasPreviousPage: pagination.page > 1
        };
      } else {
        const items = await db
          .select()
          .from(fashionListings)
          .where(and(...conditions))
          .orderBy(desc(fashionListings.createdAt));

        this.trackPerformance('searchByText', Date.now() - startTime);
        return items;
      }

    } catch (error) {
      this.logger.error('Failed to search listings by text', {
        searchText,
        filters,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Get trending listings
   */
  async getTrendingListings(
    category?: FashionCategory,
    limit: number = 10,
    options: QueryOptions = {}
  ): Promise<FashionListing[]> {
    const startTime = Date.now();

    try {
      this.logQuery('getTrendingListings', { category, limit });

      const conditions = [eq(fashionListings.status, 'active')];
      
      if (category) {
        conditions.push(eq(fashionListings.fashionCategory, category));
      }

      const items = await db
        .select()
        .from(fashionListings)
        .where(and(...conditions))
        .orderBy(
          desc(sql`(${fashionListings.likesCount} * 0.5 + ${fashionListings.viewsCount} * 0.3 + ${fashionListings.commentsCount} * 0.2)`),
          desc(fashionListings.createdAt)
        )
        .limit(limit);

      this.trackPerformance('getTrendingListings', Date.now() - startTime);

      return items;

    } catch (error) {
      this.logger.error('Failed to get trending listings', {
        category,
        limit,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Check if listing exists
   */
  async exists(
    id: string,
    options: QueryOptions = {}
  ): Promise<boolean> {
    const startTime = Date.now();

    try {
      const result = await db
        .select({ id: fashionListings.id })
        .from(fashionListings)
        .where(eq(fashionListings.id, id))
        .limit(1);

      this.trackPerformance('exists', Date.now() - startTime);

      return result.length > 0;

    } catch (error) {
      this.logger.error('Failed to check if listing exists', {
        id,
        error: error.message
      });
      return false;
    }
  }

  // Private helper methods

  private buildWhereConditions(filters: FashionListingFilters): any[] {
    const conditions = [eq(fashionListings.status, filters.status || 'active')];

    if (filters.fashionCategory) {
      conditions.push(eq(fashionListings.fashionCategory, filters.fashionCategory));
    }

    if (filters.subcategories?.length) {
      conditions.push(inArray(fashionListings.subcategory, filters.subcategories));
    }

    if (filters.brands?.length) {
      conditions.push(inArray(fashionListings.brand, filters.brands));
    }

    if (filters.conditions?.length) {
      conditions.push(inArray(fashionListings.condition, filters.conditions));
    }

    if (filters.sizes?.length) {
      conditions.push(inArray(fashionListings.size, filters.sizes));
    }

    if (filters.colors?.length) {
      conditions.push(inArray(fashionListings.color, filters.colors));
    }

    if (filters.priceRange) {
      if (filters.priceRange.min > 0) {
        conditions.push(gte(fashionListings.price, filters.priceRange.min));
      }
      if (filters.priceRange.max > 0) {
        conditions.push(lte(fashionListings.price, filters.priceRange.max));
      }
    }

    if (filters.sellerId) {
      conditions.push(eq(fashionListings.sellerId, filters.sellerId));
    }

    if (filters.location) {
      conditions.push(ilike(fashionListings.location, `%${filters.location}%`));
    }

    if (filters.isPromoted !== undefined) {
      conditions.push(eq(fashionListings.isPromoted, filters.isPromoted));
    }

    if (filters.dateRange) {
      conditions.push(gte(fashionListings.createdAt, filters.dateRange.start));
      conditions.push(lte(fashionListings.createdAt, filters.dateRange.end));
    }

    return conditions;
  }

  private buildOrderBy(sortBy: string): any[] {
    switch (sortBy) {
      case 'newest':
        return [desc(fashionListings.createdAt)];
      case 'oldest':
        return [asc(fashionListings.createdAt)];
      case 'price_low':
        return [asc(fashionListings.price)];
      case 'price_high':
        return [desc(fashionListings.price)];
      case 'popularity':
        return [desc(fashionListings.likesCount), desc(fashionListings.viewsCount)];
      case 'views':
        return [desc(fashionListings.viewsCount)];
      case 'likes':
        return [desc(fashionListings.likesCount)];
      case 'alphabetical':
        return [asc(fashionListings.title)];
      default:
        return [desc(fashionListings.createdAt)];
    }
  }

  private logQuery(operation: string, params: any): void {
    if (this.config.enableQueryLogging) {
      this.logger.debug(`Repository operation: ${operation}`, params);
    }
  }

  private trackPerformance(operation: string, duration: number): void {
    if (this.config.enablePerformanceTracking) {
      this.logger.debug(`Repository performance: ${operation}`, { duration });
      
      // Log slow queries
      if (duration > 1000) {
        this.logger.warn(`Slow repository operation: ${operation}`, { duration });
      }
    }
  }
}

// Factory function
export function createFashionListingsRepository(
  config?: Partial<RepositoryConfig>
): FashionListingsRepository {
  return new FashionListingsRepository(config);
}
