/**
 * Vector Search Repository - Phase 5 Task 5.1
 * Enterprise repository pattern for pgvector database operations with AOP compliance
 */

import { db } from '../../db';
import { sql, desc, eq, and, gt } from 'drizzle-orm';
import { 
  productEmbeddings, 
  userPreferenceEmbeddings, 
  semanticSearchQueries, 
  listings,
  type ProductEmbedding,
  type UserPreferenceEmbedding,
  type SemanticSearchQuery
} from '@shared/schema';
import { Result } from '../../domain/Hostname';
import {
  VectorEmbedding,
  SearchResult,
  SearchFilters,
  UserPreferences,
  VectorSearchRepository as IVectorSearchRepository
} from '../domain/VectorSearchDomainService';

/**
 * Enterprise Vector Search Repository Implementation
 * Handles all database operations for vector search with proper error handling
 */
export class VectorSearchRepository implements IVectorSearchRepository {
  
  /**
   * Perform semantic search using vector embeddings
   */
  async semanticSearch(
    queryEmbedding: VectorEmbedding,
    embeddingType: string,
    threshold: number,
    limit: number,
    filters: SearchFilters
  ): Promise<Result<SearchResult[]>> {
    try {
      // Build dynamic WHERE conditions based on filters
      const whereConditions = [];
      
      if (filters.category) {
        whereConditions.push(eq(listings.category, filters.category));
      }
      
      if (filters.priceRange) {
        whereConditions.push(
          and(
            sql`CAST(${listings.price} AS DECIMAL) >= ${filters.priceRange.min}`,
            sql`CAST(${listings.price} AS DECIMAL) <= ${filters.priceRange.max}`
          )
        );
      }
      
      if (filters.brand) {
        whereConditions.push(eq(listings.brand, filters.brand));
      }

      // Select appropriate embedding column based on type
      const embeddingColumn = this.getEmbeddingColumn(embeddingType);
      
      // Execute vector similarity search
      const vectorSearchResults = await db
        .select({
          listingId: productEmbeddings.listingId,
          title: listings.title,
          description: listings.description,
          price: listings.price,
          category: listings.category,
          brand: listings.brand,
          images: listings.images,
          similarity: sql<number>`1 - (${embeddingColumn} <=> ${this.formatVectorForDB(queryEmbedding.values)}) as similarity`
        })
        .from(productEmbeddings)
        .innerJoin(listings, eq(productEmbeddings.listingId, listings.id))
        .where(
          and(
            sql`1 - (${embeddingColumn} <=> ${this.formatVectorForDB(queryEmbedding.values)}) > ${threshold}`,
            eq(listings.status, 'active'),
            ...whereConditions
          )
        )
        .orderBy(desc(sql`similarity`))
        .limit(limit);

      // Transform database results to domain objects
      const searchResults: SearchResult[] = vectorSearchResults.map(row => ({
        listingId: row.listingId,
        title: row.title,
        description: row.description || '',
        price: parseFloat(row.price),
        category: row.category,
        brand: row.brand || undefined,
        images: row.images,
        similarity: row.similarity
      }));

      return Result.success(searchResults);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      return Result.failure(`Semantic search failed: ${errorMessage}`);
    }
  }

  /**
   * Get listing embedding by ID
   */
  async getListingEmbedding(listingId: string): Promise<Result<VectorEmbedding>> {
    try {
      const embeddingRecord = await db
        .select({
          embedding: productEmbeddings.embedding,
          model: productEmbeddings.model
        })
        .from(productEmbeddings)
        .where(
          and(
            eq(productEmbeddings.listingId, listingId),
            eq(productEmbeddings.embeddingType, 'combined')
          )
        )
        .limit(1);

      if (embeddingRecord.length === 0) {
        return Result.failure(`No embedding found for listing: ${listingId}`);
      }

      const record = embeddingRecord[0];
      const embeddingValues = this.parseVectorFromDB(record.embedding);
      
      const embeddingResult = VectorEmbedding.create(embeddingValues, record.model || 'text-embedding-ada-002');
      if (!embeddingResult.isSuccess) {
        return Result.failure(`Invalid embedding data: ${embeddingResult.error}`);
      }

      return Result.success(embeddingResult.data);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      return Result.failure(`Failed to get listing embedding: ${errorMessage}`);
    }
  }

  /**
   * Find similar listings based on reference embedding
   */
  async findSimilarListings(
    referenceEmbedding: VectorEmbedding,
    threshold: number,
    limit: number
  ): Promise<Result<SearchResult[]>> {
    try {
      const similarResults = await db
        .select({
          listingId: productEmbeddings.listingId,
          title: listings.title,
          description: listings.description,
          price: listings.price,
          category: listings.category,
          brand: listings.brand,
          images: listings.images,
          similarity: sql<number>`1 - (${productEmbeddings.embedding} <=> ${this.formatVectorForDB(referenceEmbedding.values)}) as similarity`
        })
        .from(productEmbeddings)
        .innerJoin(listings, eq(productEmbeddings.listingId, listings.id))
        .where(
          and(
            sql`1 - (${productEmbeddings.embedding} <=> ${this.formatVectorForDB(referenceEmbedding.values)}) > ${threshold}`,
            eq(listings.status, 'active'),
            eq(productEmbeddings.embeddingType, 'combined')
          )
        )
        .orderBy(desc(sql`similarity`))
        .limit(limit);

      const searchResults: SearchResult[] = similarResults.map(row => ({
        listingId: row.listingId,
        title: row.title,
        description: row.description || '',
        price: parseFloat(row.price),
        category: row.category,
        brand: row.brand || undefined,
        images: row.images,
        similarity: row.similarity
      }));

      return Result.success(searchResults);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      return Result.failure(`Similar listings search failed: ${errorMessage}`);
    }
  }

  /**
   * Get user preference embedding
   */
  async getUserPreferenceEmbedding(userId: string): Promise<Result<VectorEmbedding>> {
    try {
      const preferenceRecord = await db
        .select({
          preferenceEmbedding: userPreferenceEmbeddings.preferenceEmbedding
        })
        .from(userPreferenceEmbeddings)
        .where(eq(userPreferenceEmbeddings.userId, userId))
        .limit(1);

      if (preferenceRecord.length === 0) {
        return Result.failure(`No preference embedding found for user: ${userId}`);
      }

      const embeddingValues = this.parseVectorFromDB(preferenceRecord[0].preferenceEmbedding);
      const embeddingResult = VectorEmbedding.create(embeddingValues, 'text-embedding-ada-002');
      
      if (!embeddingResult.isSuccess) {
        return Result.failure(`Invalid preference embedding: ${embeddingResult.error}`);
      }

      return Result.success(embeddingResult.data);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      return Result.failure(`Failed to get user preference embedding: ${errorMessage}`);
    }
  }

  /**
   * Get personalized recommendations for user
   */
  async getPersonalizedRecommendations(
    userEmbedding: VectorEmbedding,
    preferences: UserPreferences,
    limit: number
  ): Promise<Result<SearchResult[]>> {
    try {
      // Get base recommendations using user embedding
      const baseRecommendations = await db
        .select({
          listingId: productEmbeddings.listingId,
          title: listings.title,
          description: listings.description,
          price: listings.price,
          category: listings.category,
          brand: listings.brand,
          images: listings.images,
          similarity: sql<number>`1 - (${productEmbeddings.embedding} <=> ${this.formatVectorForDB(userEmbedding.values)}) as similarity`
        })
        .from(productEmbeddings)
        .innerJoin(listings, eq(productEmbeddings.listingId, listings.id))
        .where(
          and(
            eq(listings.status, 'active'),
            eq(productEmbeddings.embeddingType, 'combined'),
            sql`1 - (${productEmbeddings.embedding} <=> ${this.formatVectorForDB(userEmbedding.values)}) > 0.6`
          )
        )
        .orderBy(desc(sql`similarity`))
        .limit(limit * 2); // Get extra results for filtering

      // Apply user preferences to boost relevant items
      const adjustedResults = this.applyUserPreferences(baseRecommendations, preferences)
        .slice(0, limit);

      const searchResults: SearchResult[] = adjustedResults.map(row => ({
        listingId: row.listingId,
        title: row.title,
        description: row.description || '',
        price: parseFloat(row.price),
        category: row.category,
        brand: row.brand || undefined,
        images: row.images,
        similarity: row.similarity
      }));

      return Result.success(searchResults);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      return Result.failure(`Personalized recommendations failed: ${errorMessage}`);
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: UserPreferences): Promise<Result<void>> {
    try {
      // Generate preference embedding from user data
      const preferenceEmbedding = await this.generatePreferenceEmbedding(preferences);
      
      // Upsert user preferences
      await db
        .insert(userPreferenceEmbeddings)
        .values({
          userId,
          preferenceEmbedding: this.formatVectorForDB(preferenceEmbedding),
          interactionWeights: preferences.interactionWeights,
          categoryPreferences: preferences.categoryWeights,
          priceRange: preferences.priceRanges,
          stylePreferences: preferences.stylePreferences,
          lastUpdated: new Date()
        })
        .onConflictDoUpdate({
          target: userPreferenceEmbeddings.userId,
          set: {
            preferenceEmbedding: this.formatVectorForDB(preferenceEmbedding),
            interactionWeights: preferences.interactionWeights,
            categoryPreferences: preferences.categoryWeights,
            priceRange: preferences.priceRanges,
            stylePreferences: preferences.stylePreferences,
            lastUpdated: new Date()
          }
        });

      return Result.success(undefined);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      return Result.failure(`Failed to update user preferences: ${errorMessage}`);
    }
  }

  /**
   * Store listing embeddings
   */
  async storeListingEmbeddings(
    listingId: string,
    titleEmbedding: VectorEmbedding,
    descriptionEmbedding: VectorEmbedding,
    combinedEmbedding: VectorEmbedding
  ): Promise<Result<void>> {
    try {
      // Store all three embedding types
      const embeddingRecords = [
        {
          listingId,
          embedding: this.formatVectorForDB(titleEmbedding.values),
          embeddingType: 'title' as const,
          model: titleEmbedding.model
        },
        {
          listingId,
          embedding: this.formatVectorForDB(descriptionEmbedding.values),
          embeddingType: 'description' as const,
          model: descriptionEmbedding.model
        },
        {
          listingId,
          embedding: this.formatVectorForDB(combinedEmbedding.values),
          embeddingType: 'combined' as const,
          model: combinedEmbedding.model
        }
      ];

      await db
        .insert(productEmbeddings)
        .values(embeddingRecords)
        .onConflictDoUpdate({
          target: [productEmbeddings.listingId, productEmbeddings.embeddingType],
          set: {
            embedding: sql`excluded.embedding`,
            model: sql`excluded.model`,
            updatedAt: new Date()
          }
        });

      return Result.success(undefined);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      return Result.failure(`Failed to store listing embeddings: ${errorMessage}`);
    }
  }

  // Private helper methods

  private getEmbeddingColumn(embeddingType: string) {
    switch (embeddingType) {
      case 'title':
        return productEmbeddings.embedding; // In a full implementation, we'd have separate columns
      case 'description':
        return productEmbeddings.embedding;
      case 'combined':
      default:
        return productEmbeddings.embedding;
    }
  }

  private formatVectorForDB(values: number[]): string {
    return `[${values.join(',')}]`;
  }

  private parseVectorFromDB(vectorString: string): number[] {
    try {
      // Remove brackets and parse as JSON array
      const cleanString = vectorString.replace(/^\[|\]$/g, '');
      return cleanString.split(',').map(v => parseFloat(v.trim()));
    } catch (error) {
      throw new Error(`Invalid vector format: ${vectorString}`);
    }
  }

  private applyUserPreferences(results: any[], preferences: UserPreferences): any[] {
    return results
      .map(result => {
        let adjustedSimilarity = result.similarity;

        // Boost preferred categories
        const categoryWeight = preferences.categoryWeights[result.category] || 1;
        adjustedSimilarity *= (1 + (categoryWeight * 0.1));

        // Boost preferred brands
        if (result.brand && preferences.brandPreferences.includes(result.brand)) {
          adjustedSimilarity *= 1.15;
        }

        // Apply price preference
        const priceRange = preferences.priceRanges[result.category];
        if (priceRange) {
          const price = parseFloat(result.price);
          if (price >= priceRange.min && price <= priceRange.max) {
            adjustedSimilarity *= 1.1;
          }
        }

        return {
          ...result,
          similarity: adjustedSimilarity
        };
      })
      .sort((a, b) => b.similarity - a.similarity);
  }

  private async generatePreferenceEmbedding(preferences: UserPreferences): Promise<number[]> {
    // In a real implementation, this would generate an embedding from user preferences
    // For now, we'll create a synthetic embedding based on preferences
    const embedding = new Array(1536).fill(0);
    
    // Add category preferences to embedding
    let index = 0;
    for (const [category, weight] of Object.entries(preferences.categoryWeights)) {
      if (index < 1536) {
        embedding[index] = weight * 0.01;
        index++;
      }
    }

    // Add brand preferences
    preferences.brandPreferences.forEach((brand, i) => {
      if (index + i < 1536) {
        embedding[index + i] = 0.02;
      }
    });

    return embedding;
  }

  /**
   * Store semantic search query for analytics
   */
  async storeSemanticQuery(
    userId: string | undefined,
    query: string,
    queryEmbedding: VectorEmbedding,
    results: SearchResult[],
    sessionId?: string
  ): Promise<Result<void>> {
    try {
      await db.insert(semanticSearchQueries).values({
        userId,
        query,
        queryEmbedding: this.formatVectorForDB(queryEmbedding.values),
        results: {
          count: results.length,
          topSimilarity: results[0]?.similarity || 0,
          categories: [...new Set(results.map(r => r.category))]
        },
        sessionId,
        createdAt: new Date()
      });

      return Result.success(undefined);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      return Result.failure(`Failed to store semantic query: ${errorMessage}`);
    }
  }
}

