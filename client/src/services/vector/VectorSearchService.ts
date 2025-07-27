/**
 * Enterprise-grade Vector Search Service with pgvector integration
 * Provides semantic search, similarity matching, and AI-powered recommendations
 */

export interface VectorSearchOptions {
  query: string;
  limit?: number;
  threshold?: number;
  category?: string;
  priceRange?: { min: number; max: number };
  embeddingType?: 'title' | 'description' | 'combined';
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  images: string[];
  similarity: number;
}

export interface SemanticSearchResponse {
  results: SearchResult[];
  queryId: string;
  processingTime: number;
  totalResults: number;
}

export class VectorSearchService {
  private readonly baseUrl = '/api/vector-search';

  /**
   * Perform semantic search using vector embeddings
   */
  async semanticSearch(options: VectorSearchOptions): Promise<SemanticSearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/semantic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Vector search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

  /**
   * Find similar products based on a listing ID
   */
  async findSimilarProducts(listingId: string, limit = 10): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/similar/${listingId}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Similar products search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Similar products search error:', error);
      throw error;
    }
  }

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(userId: string, limit = 20): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations/${userId}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Recommendations failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Personalized recommendations error:', error);
      throw error;
    }
  }

  /**
   * Update user preferences based on interactions
   */
  async updateUserPreferences(userId: string, interactions: {
    likes: string[];
    views: string[];
    purchases: string[];
    searches: string[];
  }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/preferences/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interactions),
      });

      if (!response.ok) {
        throw new Error(`Preference update failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('User preference update error:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for a listing (admin/system use)
   */
  async generateListingEmbeddings(listingId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings/generate/${listingId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Embedding generation failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw error;
    }
  }

  /**
   * Batch generate embeddings for multiple listings
   */
  async batchGenerateEmbeddings(listingIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingIds }),
      });

      if (!response.ok) {
        throw new Error(`Batch embedding generation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Batch embedding generation error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const vectorSearchService = new VectorSearchService();