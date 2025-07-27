/**
 * Vector Search Domain Service - Phase 5 Task 5.1
 * Enterprise domain-driven design for pgvector integration with pure business logic
 */

import { VectorSearchOperationType, VectorSearchContext } from '../aspects/VectorSearchAspects';
import { z } from 'zod';

// Enterprise Result Pattern for Vector Search Domain
export class Result<T, E = string> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static success<T, E = string>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  static failure<T, E = string>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value!;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error!;
  }
}

// Vector Search Value Objects
export class VectorEmbedding {
  constructor(
    public readonly values: number[],
    public readonly dimensions: number,
    public readonly model: string
  ) {
    if (values.length !== dimensions) {
      throw new Error(`Vector dimension mismatch: expected ${dimensions}, got ${values.length}`);
    }
    if (dimensions !== 1536) {
      throw new Error(`Unsupported vector dimensions: ${dimensions}. Only 1536 dimensions supported.`);
    }
  }

  static create(values: number[], model: string = 'text-embedding-ada-002'): Result<VectorEmbedding, string> {
    try {
      const embedding = new VectorEmbedding(values, 1536, model);
      return Result.success(embedding);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Invalid vector embedding');
    }
  }

  cosineSimilarity(other: VectorEmbedding): number {
    if (this.dimensions !== other.dimensions) {
      throw new Error('Cannot compute similarity between vectors of different dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < this.dimensions; i++) {
      dotProduct += this.values[i] * other.values[i];
      normA += this.values[i] * this.values[i];
      normB += other.values[i] * other.values[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  toString(): string {
    return `[${this.values.slice(0, 5).join(', ')}...] (${this.dimensions}D, ${this.model})`;
  }
}

export class SearchQuery {
  constructor(
    public readonly text: string,
    public readonly embeddingType: 'title' | 'description' | 'combined',
    public readonly filters: SearchFilters
  ) {
    if (text.trim().length < 3) {
      throw new Error('Search query must be at least 3 characters long');
    }
    if (text.length > 1000) {
      throw new Error('Search query too long (max 1000 characters)');
    }
  }

  static create(text: string, embeddingType: 'title' | 'description' | 'combined' = 'combined', filters: SearchFilters = {}): Result<SearchQuery, string> {
    try {
      const query = new SearchQuery(text, embeddingType, filters);
      return Result.success(query);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Invalid search query');
    }
  }

  getComplexity(): 'simple' | 'complex' | 'batch' {
    if (this.text.length > 100 || Object.keys(this.filters).length > 3) {
      return 'complex';
    }
    return 'simple';
  }
}

export class SimilarityThreshold {
  constructor(public readonly value: number) {
    if (value < 0 || value > 1) {
      throw new Error('Similarity threshold must be between 0 and 1');
    }
  }

  static create(value: number): Result<SimilarityThreshold, string> {
    try {
      const threshold = new SimilarityThreshold(value);
      return Result.success(threshold);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Invalid similarity threshold');
    }
  }

  static default(): SimilarityThreshold {
    return new SimilarityThreshold(0.7);
  }
}

// Domain Interfaces
export interface SearchFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  brand?: string;
  location?: string;
  condition?: string;
}

export interface SearchResult {
  listingId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  images: string[];
  similarity: number;
  embedding?: VectorEmbedding;
}

export interface SemanticSearchRequest {
  query: SearchQuery;
  threshold: SimilarityThreshold;
  limit: number;
  userId?: string;
}

export interface UserPreferences {
  userId: string;
  categoryWeights: Record<string, number>;
  priceRanges: Record<string, { min: number; max: number }>;
  brandPreferences: string[];
  stylePreferences: Record<string, number>;
  interactionWeights: {
    likes: number;
    views: number;
    purchases: number;
    searches: number;
  };
}

// Validation Schemas
const searchFiltersSchema = z.object({
  category: z.string().optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).optional(),
  brand: z.string().optional(),
  location: z.string().optional(),
  condition: z.string().optional()
});

const semanticSearchRequestSchema = z.object({
  query: z.object({
    text: z.string().min(3).max(1000),
    embeddingType: z.enum(['title', 'description', 'combined']),
    filters: searchFiltersSchema
  }),
  threshold: z.object({
    value: z.number().min(0).max(1)
  }),
  limit: z.number().min(1).max(100),
  userId: z.string().optional()
});

/**
 * Vector Search Domain Service
 * Encapsulates core business logic for vector search operations
 */
export class VectorSearchDomainService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorRepository: VectorSearchRepository
  ) {}

  /**
   * Execute semantic search with comprehensive business logic
   */
  async executeSemanticSearch(request: SemanticSearchRequest): Promise<Result<SearchResult[], string>> {
    try {
      // Generate embedding for search query
      const queryEmbedding = await this.embeddingService.generateEmbedding(request.query.text);
      if (!queryEmbedding.isSuccess) {
        return Result.failure(`Failed to generate query embedding: ${queryEmbedding.error}`);
      }

      // Execute semantic search through repository
      const searchResult = await this.vectorRepository.semanticSearch(
        queryEmbedding.value,
        request.query.embeddingType,
        request.threshold.value,
        request.limit,
        request.query.filters
      );

      return searchResult;
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Semantic search failed');
    }
  }

  /**
   * Find similar listings based on a reference listing
   */
  async findSimilarListings(listingId: string, threshold: SimilarityThreshold, limit: number): Promise<Result<SearchResult[], string>> {
    try {
      // Get the listing's embedding first
      const embeddingResult = await this.vectorRepository.getListingEmbedding(listingId);
      if (!embeddingResult.isSuccess) {
        return Result.failure(`Failed to get listing embedding: ${embeddingResult.error}`);
      }

      // Find similar listings using the embedding
      const similarResult = await this.vectorRepository.findSimilarListings(
        embeddingResult.value,
        threshold.value,
        limit
      );

      return similarResult;
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Similarity search failed');
    }
  }

  /**
   * Generate personalized recommendations for a user
   */
  async generateRecommendations(userId: string, preferences: UserPreferences, limit: number): Promise<Result<SearchResult[], string>> {
    try {
      // Get user preference embedding
      const userEmbeddingResult = await this.vectorRepository.getUserPreferenceEmbedding(userId);
      if (!userEmbeddingResult.isSuccess) {
        return Result.failure(`Failed to get user preferences: ${userEmbeddingResult.error}`);
      }

      // Generate personalized recommendations
      const recommendationsResult = await this.vectorRepository.getPersonalizedRecommendations(
        userEmbeddingResult.value,
        preferences,
        limit
      );

      return recommendationsResult;
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Recommendation generation failed');
    }
  }

  /**
   * Update user preferences based on interactions
   */
  async updateUserPreferences(userId: string, interactions: UserInteractions): Promise<Result<UserPreferences, string>> {
    try {
      // Convert interactions to preferences
      const preferences = this.convertInteractionsToPreferences(userId, interactions);
      
      // Update preferences in repository
      const updateResult = await this.vectorRepository.updateUserPreferences(userId, preferences);
      if (!updateResult.isSuccess) {
        return Result.failure(`Failed to update preferences: ${updateResult.error}`);
      }

      return Result.success(preferences);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Preference update failed');
    }
  }

  /**
   * Generate embeddings for a listing
   */
  async generateListingEmbeddings(listingId: string, title: string, description: string): Promise<Result<void, string>> {
    try {
      // Generate embeddings for title, description, and combined
      const titleEmbeddingResult = await this.embeddingService.generateEmbedding(title);
      if (!titleEmbeddingResult.isSuccess) {
        return Result.failure(`Failed to generate title embedding: ${titleEmbeddingResult.error}`);
      }

      const descriptionEmbeddingResult = await this.embeddingService.generateEmbedding(description);
      if (!descriptionEmbeddingResult.isSuccess) {
        return Result.failure(`Failed to generate description embedding: ${descriptionEmbeddingResult.error}`);
      }

      const combinedText = `${title} ${description}`;
      const combinedEmbeddingResult = await this.embeddingService.generateEmbedding(combinedText);
      if (!combinedEmbeddingResult.isSuccess) {
        return Result.failure(`Failed to generate combined embedding: ${combinedEmbeddingResult.error}`);
      }

      // Store all embeddings
      const storeResult = await this.vectorRepository.storeListingEmbeddings(
        listingId,
        titleEmbeddingResult.value,
        descriptionEmbeddingResult.value,
        combinedEmbeddingResult.value
      );

      return storeResult;
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Embedding generation failed');
    }
  }

  // Helper method for preference conversion
  private convertInteractionsToPreferences(userId: string, interactions: UserInteractions): UserPreferences {
    const preferenceWeights = this.computePreferenceWeights(interactions);
    
    return {
      userId,
      categoryWeights: preferenceWeights.categories,
      brandPreferences: preferenceWeights.brands,
      stylePreferences: preferenceWeights.styles,
      priceRanges: preferenceWeights.priceRanges,
      interactionWeights: {
        likes: preferenceWeights.likes,
        views: preferenceWeights.views,
        purchases: preferenceWeights.purchases,
        searches: preferenceWeights.searches
      }
    };
  }

  // Private implementation methods with pure business logic

  private async performSemanticSearch(request: SemanticSearchRequest, context: VectorSearchContext): Promise<Result<SearchResult[]>> {
    // Validate request
    const validation = semanticSearchRequestSchema.safeParse(request);
    if (!validation.success) {
      return Result.failure(`Invalid search request: ${validation.error.message}`);
    }

    // Generate query embedding
    const queryEmbeddingResult = await this.embeddingService.generateEmbedding(request.query.text);
    if (!queryEmbeddingResult.isSuccess) {
      return Result.failure(`Failed to generate query embedding: ${queryEmbeddingResult.error}`);
    }

    // Execute vector search
    const searchResults = await this.vectorRepository.semanticSearch(
      queryEmbeddingResult.value,
      request.query.embeddingType,
      request.threshold.value,
      request.limit,
      request.query.filters
    );

    if (!searchResults.isSuccess) {
      return Result.failure(`Vector search failed: ${searchResults.error}`);
    }

    // Apply business rules and scoring
    const processedResults = this.applyBusinessRules(searchResults.value, request);
    
    context.success = true;
    context.resultCount = processedResults.length;

    return Result.success(processedResults);
  }

  private async performSimilaritySearch(listingId: string, threshold: SimilarityThreshold, limit: number, context: VectorSearchContext): Promise<Result<SearchResult[]>> {
    // Get reference listing embedding
    const referenceEmbeddingResult = await this.vectorRepository.getListingEmbedding(listingId);
    if (!referenceEmbeddingResult.isSuccess) {
      return Result.failure(`Failed to get reference listing embedding: ${referenceEmbeddingResult.error}`);
    }

    // Find similar listings
    const similarResults = await this.vectorRepository.findSimilarListings(
      referenceEmbeddingResult.value,
      threshold.value,
      limit
    );

    if (!similarResults.isSuccess) {
      return Result.failure(`Similarity search failed: ${similarResults.error}`);
    }

    context.success = true;
    context.resultCount = similarResults.value.length;

    return Result.success(similarResults.value);
  }

  private async performRecommendationQuery(userId: string, preferences: UserPreferences, limit: number, context: VectorSearchContext): Promise<Result<SearchResult[]>> {
    // Get or create user preference embedding
    const userEmbeddingResult = await this.vectorRepository.getUserPreferenceEmbedding(userId);
    
    let userEmbedding: VectorEmbedding;
    if (!userEmbeddingResult.isSuccess) {
      // Generate initial preference embedding from interactions
      const generatedEmbeddingResult = await this.generateUserPreferenceEmbedding(preferences);
      if (!generatedEmbeddingResult.isSuccess) {
        return Result.failure(`Failed to generate user preferences: ${generatedEmbeddingResult.error}`);
      }
      userEmbedding = generatedEmbeddingResult.value;
    } else {
      userEmbedding = userEmbeddingResult.value;
    }

    // Find recommended listings
    const recommendations = await this.vectorRepository.getPersonalizedRecommendations(
      userEmbedding,
      preferences,
      limit
    );

    if (!recommendations.isSuccess) {
      return Result.failure(`Recommendation query failed: ${recommendations.error}`);
    }

    context.success = true;
    context.resultCount = recommendations.value.length;

    return Result.success(recommendations.value);
  }

  private async performPreferenceUpdate(userId: string, interactions: UserInteractions, context: VectorSearchContext): Promise<Result<UserPreferences>> {
    // Analyze interactions to compute preference weights
    const preferenceWeights = this.computePreferenceWeights(interactions);
    
    // Update user preference embedding
    const updatedPreferences: UserPreferences = {
      userId,
      categoryWeights: preferenceWeights.categories,
      priceRanges: preferenceWeights.priceRanges,
      brandPreferences: preferenceWeights.brands,
      stylePreferences: preferenceWeights.styles,
      interactionWeights: {
        likes: preferenceWeights.likes,
        views: preferenceWeights.views,
        purchases: preferenceWeights.purchases,
        searches: preferenceWeights.searches
      }
    };

    // Store updated preferences
    const storeResult = await this.vectorRepository.updateUserPreferences(userId, updatedPreferences);
    if (!storeResult.isSuccess) {
      return Result.failure(`Failed to store user preferences: ${storeResult.error}`);
    }

    context.success = true;
    return Result.success(updatedPreferences);
  }

  private async performEmbeddingGeneration(listingId: string, title: string, description: string, context: VectorSearchContext): Promise<Result<void>> {
    // Generate embeddings for different text types
    const titleEmbeddingResult = await this.embeddingService.generateEmbedding(title);
    const descriptionEmbeddingResult = await this.embeddingService.generateEmbedding(description);
    const combinedEmbeddingResult = await this.embeddingService.generateEmbedding(`${title} ${description}`);

    if (!titleEmbeddingResult.isSuccess || !descriptionEmbeddingResult.isSuccess || !combinedEmbeddingResult.isSuccess) {
      return Result.failure('Failed to generate one or more embeddings');
    }

    // Store embeddings
    const storeResult = await this.vectorRepository.storeListingEmbeddings(
      listingId,
      titleEmbeddingResult.value,
      descriptionEmbeddingResult.value,
      combinedEmbeddingResult.value
    );

    if (!storeResult.isSuccess) {
      return Result.failure(`Failed to store embeddings: ${storeResult.error}`);
    }

    context.success = true;
    return Result.success(undefined);
  }

  // Business rule application methods

  private applyBusinessRules(results: SearchResult[], request: SemanticSearchRequest): SearchResult[] {
    // Apply category boost
    const categoryBoostedResults = this.applyCategoryBoost(results, request.query.filters.category);
    
    // Apply price preference
    const priceFilteredResults = this.applyPricePreference(categoryBoostedResults, request.query.filters.priceRange);
    
    // Apply recency boost
    const recencyBoostedResults = this.applyRecencyBoost(priceFilteredResults);
    
    // Sort by adjusted similarity score
    return recencyBoostedResults.sort((a, b) => b.similarity - a.similarity);
  }

  private applyCategoryBoost(results: SearchResult[], preferredCategory?: string): SearchResult[] {
    if (!preferredCategory) return results;

    return results.map(result => ({
      ...result,
      similarity: result.category === preferredCategory ? result.similarity * 1.1 : result.similarity
    }));
  }

  private applyPricePreference(results: SearchResult[], priceRange?: { min: number; max: number }): SearchResult[] {
    if (!priceRange) return results;

    return results.filter(result => 
      result.price >= priceRange.min && result.price <= priceRange.max
    );
  }

  private applyRecencyBoost(results: SearchResult[]): SearchResult[] {
    // In a real implementation, this would boost recently listed items
    return results.map(result => ({
      ...result,
      similarity: result.similarity * 1.05 // Small recency boost
    }));
  }

  private computePreferenceWeights(interactions: UserInteractions): PreferenceWeights {
    // Business logic for computing user preferences from interactions
    const totalInteractions = interactions.likes.length + interactions.views.length + 
                            interactions.purchases.length + interactions.searches.length;

    if (totalInteractions === 0) {
      return this.getDefaultPreferenceWeights();
    }

    // Compute category preferences
    const categoryWeights: Record<string, number> = {};
    const brandPreferences: string[] = [];
    const priceRanges: Record<string, { min: number; max: number }> = {};

    // Analyze purchase history (highest weight)
    interactions.purchases.forEach(purchase => {
      categoryWeights[purchase.category] = (categoryWeights[purchase.category] || 0) + 3;
      if (purchase.brand && !brandPreferences.includes(purchase.brand)) {
        brandPreferences.push(purchase.brand);
      }
    });

    // Analyze likes (medium weight)
    interactions.likes.forEach(like => {
      categoryWeights[like.category] = (categoryWeights[like.category] || 0) + 2;
    });

    // Analyze views (low weight)
    interactions.views.forEach(view => {
      categoryWeights[view.category] = (categoryWeights[view.category] || 0) + 1;
    });

    return {
      categories: categoryWeights,
      brands: brandPreferences,
      priceRanges,
      styles: {},
      likes: interactions.likes.length / totalInteractions,
      views: interactions.views.length / totalInteractions,
      purchases: interactions.purchases.length / totalInteractions,
      searches: interactions.searches.length / totalInteractions
    };
  }

  private getDefaultPreferenceWeights(): PreferenceWeights {
    return {
      categories: {},
      brands: [],
      priceRanges: {},
      styles: {},
      likes: 0.25,
      views: 0.4,
      purchases: 0.3,
      searches: 0.05
    };
  }

  private async generateUserPreferenceEmbedding(preferences: UserPreferences): Promise<Result<VectorEmbedding>> {
    // Generate preference embedding from category weights and preferences
    const preferenceText = this.buildPreferenceText(preferences);
    return await this.embeddingService.generateEmbedding(preferenceText);
  }

  private buildPreferenceText(preferences: UserPreferences): string {
    const categoryTexts = Object.entries(preferences.categoryWeights)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, weight]) => `${category} `.repeat(Math.ceil(weight)))
      .join(' ');

    const brandText = preferences.brandPreferences.slice(0, 5).join(' ');
    
    return `${categoryTexts} ${brandText}`.trim();
  }
}

// Supporting interfaces and types
export interface UserInteractions {
  likes: Array<{ listingId: string; category: string; brand?: string; price: number }>;
  views: Array<{ listingId: string; category: string; brand?: string; price: number }>;
  purchases: Array<{ listingId: string; category: string; brand?: string; price: number }>;
  searches: Array<{ query: string; category?: string }>;
}

interface PreferenceWeights {
  categories: Record<string, number>;
  brands: string[];
  priceRanges: Record<string, { min: number; max: number }>;
  styles: Record<string, number>;
  likes: number;
  views: number;
  purchases: number;
  searches: number;
}

// Service interfaces for dependency injection
export interface EmbeddingService {
  generateEmbedding(text: string): Promise<Result<VectorEmbedding>>;
}

export interface VectorSearchRepository {
  semanticSearch(queryEmbedding: VectorEmbedding, embeddingType: string, threshold: number, limit: number, filters: SearchFilters): Promise<Result<SearchResult[]>>;
  getListingEmbedding(listingId: string): Promise<Result<VectorEmbedding>>;
  findSimilarListings(referenceEmbedding: VectorEmbedding, threshold: number, limit: number): Promise<Result<SearchResult[]>>;
  getUserPreferenceEmbedding(userId: string): Promise<Result<VectorEmbedding>>;
  getPersonalizedRecommendations(userEmbedding: VectorEmbedding, preferences: UserPreferences, limit: number): Promise<Result<SearchResult[]>>;
  updateUserPreferences(userId: string, preferences: UserPreferences): Promise<Result<void>>;
  storeListingEmbeddings(listingId: string, titleEmbedding: VectorEmbedding, descriptionEmbedding: VectorEmbedding, combinedEmbedding: VectorEmbedding): Promise<Result<void>>;
}

