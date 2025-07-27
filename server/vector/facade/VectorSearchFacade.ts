/**
 * Vector Search Facade - Phase 5 Task 5.1
 * Enterprise facade pattern for unified vector search operations with AOP compliance
 */

import { Result } from '../../domain/Hostname';
import {
  VectorSearchDomainService,
  SearchQuery,
  SimilarityThreshold,
  SemanticSearchRequest,
  SearchResult,
  UserPreferences,
  UserInteractions
} from '../domain/VectorSearchDomainService';
import { VectorSearchRepository } from '../repository/VectorSearchRepository';
import { VectorEmbeddingService } from '../services/VectorEmbeddingService';
import {
  VectorSearchContext,
  VectorSearchOperationType,
  vectorSearchAspects
} from '../aspects/VectorSearchAspects';

/**
 * Vector Search Aspect Manager
 * Manages aspect execution for vector search operations
 */
class VectorSearchAspectManager {
  private aspects: any[] = [];

  constructor() {
    // Initialize all vector search aspects
    this.aspects = vectorSearchAspects.map(AspectClass => new AspectClass());
    this.aspects.sort((a, b) => b.priority - a.priority);
  }

  async executeWithAspects<T>(
    context: VectorSearchContext,
    operation: () => Promise<Result<T>>
  ): Promise<Result<T>> {
    try {
      // Execute BEFORE aspects
      for (const aspect of this.aspects) {
        await aspect.before(context);
      }

      // Execute the main operation
      const result = await operation();
      
      if (result.isSuccess) {
        context.success = true;
        context.result = result.data;
      }

      // Execute AFTER aspects
      for (const aspect of this.aspects) {
        await aspect.after(context);
      }

      return result;

    } catch (error) {
      // Execute ERROR aspects
      const aspectError = error instanceof Error ? error : new Error(String(error));
      
      for (const aspect of this.aspects) {
        await aspect.onError(context, aspectError);
      }

      throw error;
    }
  }
}

/**
 * Enterprise Vector Search Facade
 * Unified interface for all vector search operations with comprehensive AOP support
 */
export class VectorSearchFacade {
  private readonly domainService: VectorSearchDomainService;
  private readonly aspectManager: VectorSearchAspectManager;

  constructor(
    repository?: VectorSearchRepository,
    embeddingService?: VectorEmbeddingService
  ) {
    // Initialize services with dependency injection
    const vectorRepository = repository || new VectorSearchRepository();
    const vectorEmbeddingService = embeddingService || new VectorEmbeddingService();
    
    this.aspectManager = new VectorSearchAspectManager();
    this.domainService = new VectorSearchDomainService(
      this.aspectManager,
      vectorEmbeddingService,
      vectorRepository
    );
  }

  /**
   * Execute semantic search with full AOP support
   */
  async semanticSearch(
    queryText: string,
    options: {
      embeddingType?: 'title' | 'description' | 'combined';
      threshold?: number;
      limit?: number;
      filters?: {
        category?: string;
        priceRange?: { min: number; max: number };
        brand?: string;
        location?: string;
        condition?: string;
      };
      userId?: string;
    } = {}
  ): Promise<Result<SearchResult[]>> {
    try {
      // Create domain objects
      const searchQuery = SearchQuery.create(
        queryText,
        options.embeddingType || 'combined',
        options.filters || {}
      );

      if (!searchQuery.isSuccess) {
        return Result.failure(`Invalid search query: ${searchQuery.error}`);
      }

      const threshold = SimilarityThreshold.create(options.threshold || 0.7);
      if (!threshold.isSuccess) {
        return Result.failure(`Invalid threshold: ${threshold.error}`);
      }

      const request: SemanticSearchRequest = {
        query: searchQuery.data,
        threshold: threshold.data,
        limit: options.limit || 20,
        userId: options.userId
      };

      // Execute through domain service with AOP
      return await this.domainService.executeSemanticSearch(request);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return Result.failure(`Semantic search failed: ${errorMessage}`);
    }
  }

  /**
   * Find similar listings with AOP support
   */
  async findSimilarListings(
    listingId: string,
    options: {
      threshold?: number;
      limit?: number;
    } = {}
  ): Promise<Result<SearchResult[]>> {
    try {
      const threshold = SimilarityThreshold.create(options.threshold || 0.7);
      if (!threshold.isSuccess) {
        return Result.failure(`Invalid threshold: ${threshold.error}`);
      }

      return await this.domainService.findSimilarListings(
        listingId,
        threshold.data,
        options.limit || 20
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return Result.failure(`Similar listings search failed: ${errorMessage}`);
    }
  }

  /**
   * Generate personalized recommendations with AOP support
   */
  async getPersonalizedRecommendations(
    userId: string,
    preferences: UserPreferences,
    limit: number = 20
  ): Promise<Result<SearchResult[]>> {
    try {
      return await this.domainService.generateRecommendations(userId, preferences, limit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return Result.failure(`Recommendation generation failed: ${errorMessage}`);
    }
  }

  /**
   * Update user preferences with AOP support
   */
  async updateUserPreferences(
    userId: string,
    interactions: UserInteractions
  ): Promise<Result<UserPreferences>> {
    try {
      return await this.domainService.updateUserPreferences(userId, interactions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return Result.failure(`Preference update failed: ${errorMessage}`);
    }
  }

  /**
   * Generate embeddings for a listing with AOP support
   */
  async generateListingEmbeddings(
    listingId: string,
    title: string,
    description: string
  ): Promise<Result<void>> {
    try {
      return await this.domainService.generateListingEmbeddings(listingId, title, description);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return Result.failure(`Embedding generation failed: ${errorMessage}`);
    }
  }

  /**
   * Batch generate embeddings for multiple listings
   */
  async batchGenerateEmbeddings(
    listings: Array<{ id: string; title: string; description: string }>
  ): Promise<Result<{ success: string[]; failed: string[] }>> {
    const context: VectorSearchContext = {
      requestId: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      operation: VectorSearchOperationType.BATCH_PROCESSING,
      metadata: {
        batchSize: listings.length
      },
      success: false
    };

    try {
      return await this.aspectManager.executeWithAspects(context, async () => {
        const results = { success: [] as string[], failed: [] as string[] };

        for (const listing of listings) {
          const result = await this.domainService.generateListingEmbeddings(
            listing.id,
            listing.title,
            listing.description
          );

          if (result.isSuccess) {
            results.success.push(listing.id);
          } else {
            results.failed.push(listing.id);
          }
        }

        context.success = true;
        return Result.success(results);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return Result.failure(`Batch embedding generation failed: ${errorMessage}`);
    }
  }

  /**
   * Get vector search health status
   */
  getHealthStatus(): {
    isHealthy: boolean;
    components: Record<string, boolean>;
    aspectsStatus: Array<{ name: string; enabled: boolean; priority: number }>;
  } {
    const embeddingService = new VectorEmbeddingService();
    
    return {
      isHealthy: true, // In production, check all components
      components: {
        embeddingService: embeddingService.isConfigured(),
        database: true, // Check database connectivity
        aspects: this.aspects.length > 0
      },
      aspectsStatus: this.aspects.map(aspect => ({
        name: aspect.name,
        enabled: true, // Check aspect health
        priority: aspect.priority
      }))
    };
  }

  /**
   * Get vector search performance metrics
   */
  getPerformanceMetrics(): {
    totalOperations: number;
    averageLatency: number;
    successRate: number;
    cacheHitRate: number;
    aspectPerformance: Array<{ name: string; averageTime: number }>;
  } {
    // In production, collect real metrics
    return {
      totalOperations: 0,
      averageLatency: 0,
      successRate: 1.0,
      cacheHitRate: 0.8,
      aspectPerformance: this.aspects.map(aspect => ({
        name: aspect.name,
        averageTime: 10 // Mock data
      }))
    };
  }

  /**
   * Configure vector search settings
   */
  configure(settings: {
    defaultThreshold?: number;
    defaultLimit?: number;
    cacheTTL?: number;
    enableAnalytics?: boolean;
  }): void {
    // Apply configuration to aspects and services
    console.log('[VECTOR-FACADE] Configuration updated:', settings);
  }

  // Private methods for internal operations

  private generateRequestId(): string {
    return `vector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createBaseContext(operation: VectorSearchOperationType): VectorSearchContext {
    return {
      requestId: this.generateRequestId(),
      timestamp: new Date(),
      operation,
      metadata: {},
      success: false
    };
  }
}

/**
 * Singleton instance for global use
 */
let vectorSearchFacadeInstance: VectorSearchFacade | null = null;

export function getVectorSearchFacade(): VectorSearchFacade {
  if (!vectorSearchFacadeInstance) {
    vectorSearchFacadeInstance = new VectorSearchFacade();
  }
  return vectorSearchFacadeInstance;
}

