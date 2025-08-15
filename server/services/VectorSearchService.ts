// Vector Search Service - Enterprise-grade AI-powered search
import { db } from '../db.js';
import { fashionListings } from '@shared/fashion-schema';
import { sql, desc } from 'drizzle-orm';
import { Logger } from '../middleware/Logger.js';
import OpenAI from 'openai';

export interface VectorSearchConfig {
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  similarity: {
    threshold: number;
    maxResults: number;
  };
  enableCaching: boolean;
  cacheTimeout: number;
}

export interface SearchQuery {
  text: string;
  category?: string;
  filters?: Record<string, any>;
  similarityThreshold?: number;
  maxResults?: number;
}

export interface SearchResult {
  listing: any;
  similarity: number;
  relevanceFactors: string[];
}

export interface VectorSearchResponse {
  results: SearchResult[];
  query: string;
  totalResults: number;
  processingTime: number;
  searchMetadata: {
    embeddingGenerated: boolean;
    vectorSearchUsed: boolean;
    fallbackToKeyword: boolean;
  };
}

export class VectorSearchService {
  private logger: Logger;
  private config: VectorSearchConfig;
  private openai: OpenAI;
  private embeddingCache: Map<string, number[]> = new Map();

  constructor(config: VectorSearchConfig) {
    this.config = config;
    this.logger = new Logger('VectorSearchService');
    
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Check cache first
      if (this.config.enableCaching && this.embeddingCache.has(text)) {
        const cached = this.embeddingCache.get(text);
        if (cached) {
          return cached;
        }
      }

      // Clean and prepare text
      const cleanText = this.cleanText(text);
      
      if (cleanText.length === 0) {
        throw new Error('Empty text provided for embedding generation');
      }

      // Generate embedding using OpenAI
      const response = await this.openai.embeddings.create({
        model: this.config.openai.model,
        input: cleanText
      });

      const embedding = response.data[0].embedding;

      // Cache the result
      if (this.config.enableCaching) {
        this.embeddingCache.set(text, embedding);
        
        // Clean cache if it gets too large
        if (this.embeddingCache.size > 1000) {
          this.cleanCache();
        }
      }

      this.logger.debug('Generated embedding', {
        textLength: cleanText.length,
        embeddingDimensions: embedding.length
      });

      return embedding;

    } catch (error) {
      this.logger.error('Failed to generate embedding', {
        textLength: text.length,
        error: error.message
      });
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  async searchFashionListings(query: SearchQuery): Promise<VectorSearchResponse> {
    const startTime = Date.now();
    
    try {
      this.logger.debug('Starting vector search', {
        query: query.text,
        category: query.category,
        threshold: query.similarityThreshold
      });

      const searchMetadata = {
        embeddingGenerated: false,
        vectorSearchUsed: false,
        fallbackToKeyword: false
      };

      let results: SearchResult[] = [];

      try {
        // Generate query embedding
        const queryEmbedding = await this.generateEmbedding(query.text);
        searchMetadata.embeddingGenerated = true;

        // Perform vector similarity search
        results = await this.performVectorSearch(queryEmbedding, query);
        searchMetadata.vectorSearchUsed = true;

      } catch (embeddingError) {
        this.logger.warn('Vector search failed, falling back to keyword search', {
          error: embeddingError.message
        });
        
        // Fallback to keyword search
        results = await this.performKeywordSearch(query);
        searchMetadata.fallbackToKeyword = true;
      }

      const processingTime = Date.now() - startTime;

      this.logger.info('Vector search completed', {
        query: query.text,
        resultsCount: results.length,
        processingTime,
        searchMetadata
      });

      return {
        results,
        query: query.text,
        totalResults: results.length,
        processingTime,
        searchMetadata
      };

    } catch (error) {
      this.logger.error('Search failed completely', {
        query: query.text,
        error: error.message
      });

      return {
        results: [],
        query: query.text,
        totalResults: 0,
        processingTime: Date.now() - startTime,
        searchMetadata: {
          embeddingGenerated: false,
          vectorSearchUsed: false,
          fallbackToKeyword: false
        }
      };
    }
  }

  async findSimilarListings(
    listingId: string,
    maxResults: number = 5
  ): Promise<SearchResult[]> {
    try {
      // Get the target listing's embedding
      const targetListing = await db
        .select({
          combinedEmbedding: fashionListings.combinedEmbedding,
          fashionCategory: fashionListings.fashionCategory
        })
        .from(fashionListings)
        .where(sql`${fashionListings.id} = ${listingId}`)
        .limit(1);

      if (targetListing.length === 0 || !targetListing[0].combinedEmbedding) {
        this.logger.warn('Target listing not found or has no embedding', { listingId });
        return [];
      }

      const embedding = targetListing[0].combinedEmbedding;
      const category = targetListing[0].fashionCategory;

      // Find similar listings
      const similarListings = await db.execute(sql`
        SELECT 
          fl.*,
          1 - (fl.combined_embedding <=> ${embedding}) as similarity_score
        FROM fashion_listings fl
        WHERE 
          fl.id != ${listingId}
          AND fl.status = 'active'
          AND fl.fashion_category = ${category}
          AND fl.combined_embedding IS NOT NULL
          AND 1 - (fl.combined_embedding <=> ${embedding}) > ${this.config.similarity.threshold}
        ORDER BY similarity_score DESC
        LIMIT ${maxResults}
      `);

      return similarListings.map((row: any) => ({
        listing: row,
        similarity: row.similarity_score,
        relevanceFactors: ['same_category', 'vector_similarity']
      }));

    } catch (error) {
      this.logger.error('Failed to find similar listings', {
        listingId,
        error: error.message
      });
      return [];
    }
  }

  async getRecommendations(
    userId: string,
    preferences: {
      categories?: string[];
      priceRange?: { min: number; max: number };
      brands?: string[];
      styles?: string[];
    },
    maxResults: number = 10
  ): Promise<SearchResult[]> {
    try {
      // This would implement a more sophisticated recommendation algorithm
      // For now, return popular items in preferred categories
      
      const categoryFilter = preferences.categories?.length 
        ? sql`AND fl.fashion_category = ANY(${preferences.categories})`
        : sql``;

      const priceFilter = preferences.priceRange
        ? sql`AND fl.price BETWEEN ${preferences.priceRange.min} AND ${preferences.priceRange.max}`
        : sql``;

      const brandFilter = preferences.brands?.length
        ? sql`AND fl.brand = ANY(${preferences.brands})`
        : sql``;

      const recommendations = await db.execute(sql`
        SELECT 
          fl.*,
          (fl.likes_count * 0.3 + fl.views_count * 0.1) as popularity_score
        FROM fashion_listings fl
        WHERE 
          fl.status = 'active'
          ${categoryFilter}
          ${priceFilter}
          ${brandFilter}
        ORDER BY popularity_score DESC, fl.created_at DESC
        LIMIT ${maxResults}
      `);

      return recommendations.map((row: any) => ({
        listing: row,
        similarity: row.popularity_score / 100, // Normalize to 0-1 range
        relevanceFactors: ['user_preferences', 'popularity']
      }));

    } catch (error) {
      this.logger.error('Failed to get recommendations', {
        userId,
        preferences,
        error: error.message
      });
      return [];
    }
  }

  private async performVectorSearch(
    queryEmbedding: number[],
    query: SearchQuery
  ): Promise<SearchResult[]> {
    const threshold = query.similarityThreshold || this.config.similarity.threshold;
    const maxResults = query.maxResults || this.config.similarity.maxResults;

    // Build category filter
    const categoryFilter = query.category 
      ? sql`AND fl.fashion_category = ${query.category}`
      : sql``;

    // Additional filters
    const additionalFilters = this.buildAdditionalFilters(query.filters);

    const results = await db.execute(sql`
      SELECT 
        fl.*,
        1 - (fl.combined_embedding <=> ${queryEmbedding}) as similarity_score
      FROM fashion_listings fl
      WHERE 
        fl.status = 'active'
        AND fl.combined_embedding IS NOT NULL
        ${categoryFilter}
        ${additionalFilters}
        AND 1 - (fl.combined_embedding <=> ${queryEmbedding}) > ${threshold}
      ORDER BY similarity_score DESC
      LIMIT ${maxResults}
    `);

    return results.map((row: any) => ({
      listing: row,
      similarity: row.similarity_score,
      relevanceFactors: this.identifyRelevanceFactors(row, query.text)
    }));
  }

  private async performKeywordSearch(query: SearchQuery): Promise<SearchResult[]> {
    const maxResults = query.maxResults || this.config.similarity.maxResults;
    const searchTerms = this.extractSearchTerms(query.text);

    if (searchTerms.length === 0) {
      return [];
    }

    const categoryFilter = query.category 
      ? sql`AND fl.fashion_category = ${query.category}`
      : sql``;

    const additionalFilters = this.buildAdditionalFilters(query.filters);

    // Create search query for full-text search
    const searchQuery = searchTerms.join(' | ');

    const results = await db.execute(sql`
      SELECT 
        fl.*,
        ts_rank(
          to_tsvector('english', fl.title || ' ' || COALESCE(fl.description, '') || ' ' || COALESCE(fl.brand, '')),
          to_tsquery('english', ${searchQuery})
        ) as relevance_score
      FROM fashion_listings fl
      WHERE 
        fl.status = 'active'
        ${categoryFilter}
        ${additionalFilters}
        AND (
          to_tsvector('english', fl.title || ' ' || COALESCE(fl.description, '') || ' ' || COALESCE(fl.brand, ''))
          @@ to_tsquery('english', ${searchQuery})
        )
      ORDER BY relevance_score DESC
      LIMIT ${maxResults}
    `);

    return results.map((row: any) => ({
      listing: row,
      similarity: Math.min(row.relevance_score, 1), // Normalize to 0-1 range
      relevanceFactors: ['keyword_match', 'text_search']
    }));
  }

  private buildAdditionalFilters(filters?: Record<string, any>): any {
    if (!filters) {
      return sql``;
    }

    const conditions = [];

    if (filters.priceMin) {
      conditions.push(sql`fl.price >= ${filters.priceMin}`);
    }

    if (filters.priceMax) {
      conditions.push(sql`fl.price <= ${filters.priceMax}`);
    }

    if (filters.brands?.length) {
      conditions.push(sql`fl.brand = ANY(${filters.brands})`);
    }

    if (filters.conditions?.length) {
      conditions.push(sql`fl.condition = ANY(${filters.conditions})`);
    }

    return conditions.length > 0 ? sql`AND ${sql.join(conditions, sql` AND `)}` : sql``;
  }

  private cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .toLowerCase();
  }

  private extractSearchTerms(text: string): string[] {
    return this.cleanText(text)
      .split(' ')
      .filter(term => term.length > 2) // Remove very short terms
      .slice(0, 10); // Limit number of terms
  }

  private identifyRelevanceFactors(listing: any, query: string): string[] {
    const factors = [];
    
    const queryLower = query.toLowerCase();
    const titleLower = listing.title?.toLowerCase() || '';
    const brandLower = listing.brand?.toLowerCase() || '';

    if (titleLower.includes(queryLower)) {
      factors.push('title_match');
    }

    if (brandLower.includes(queryLower)) {
      factors.push('brand_match');
    }

    if (listing.similarity_score > 0.8) {
      factors.push('high_similarity');
    }

    if (listing.is_promoted) {
      factors.push('promoted');
    }

    return factors;
  }

  private cleanCache(): void {
    // Remove oldest entries when cache gets too large
    const entries = Array.from(this.embeddingCache.entries());
    entries.slice(0, 500).forEach(([key]) => {
      this.embeddingCache.delete(key);
    });
    
    this.logger.debug('Cleaned embedding cache', {
      removedEntries: 500,
      remainingEntries: this.embeddingCache.size
    });
  }
}

// Factory function
export function createVectorSearchService(config?: Partial<VectorSearchConfig>): VectorSearchService {
  const defaultConfig: VectorSearchConfig = {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'text-embedding-ada-002',
      maxTokens: 8000
    },
    similarity: {
      threshold: 0.7,
      maxResults: 20
    },
    enableCaching: true,
    cacheTimeout: 3600000 // 1 hour
  };

  return new VectorSearchService({ ...defaultConfig, ...config });
}
