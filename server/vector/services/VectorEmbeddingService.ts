/**
 * Vector Embedding Service - Phase 5 Task 5.1
 * Enterprise embedding service for OpenAI integration with AOP compliance
 */

import { Result } from '../../domain/Hostname';
import { VectorEmbedding, EmbeddingService } from '../domain/VectorSearchDomainService';

/**
 * Enterprise Vector Embedding Service Implementation
 * Handles embedding generation with proper error handling and validation
 */
export class VectorEmbeddingService implements EmbeddingService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.openai.com/v1';
  private readonly model: string = 'text-embedding-ada-002';
  private readonly maxTokens: number = 8191;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('[VECTOR-EMBEDDING] OpenAI API key not configured. Embedding generation will use mock data.');
    }
  }

  /**
   * Generate embedding for text using OpenAI API
   */
  async generateEmbedding(text: string): Promise<Result<VectorEmbedding>> {
    try {
      // Validate input
      if (!text || text.trim().length === 0) {
        return Result.failure('Text cannot be empty');
      }

      if (text.length > this.maxTokens * 4) { // Rough token estimation
        return Result.failure(`Text too long: ${text.length} characters (max: ${this.maxTokens * 4})`);
      }

      // If no API key, return mock embedding for development
      if (!this.apiKey) {
        return this.generateMockEmbedding(text);
      }

      // Prepare the text for embedding
      const cleanedText = this.preprocessText(text);

      // Call OpenAI API
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: cleanedText,
          model: this.model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return Result.failure(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data[0] || !data.data[0].embedding) {
        return Result.failure('Invalid response from OpenAI API');
      }

      const embeddingValues = data.data[0].embedding;
      
      // Validate embedding dimensions
      if (embeddingValues.length !== 1536) {
        return Result.failure(`Invalid embedding dimensions: ${embeddingValues.length} (expected: 1536)`);
      }

      const embeddingResult = VectorEmbedding.create(embeddingValues, this.model);
      return embeddingResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return Result.failure(`Embedding generation failed: ${errorMessage}`);
    }
  }

  /**
   * Generate multiple embeddings efficiently
   */
  async generateBatchEmbeddings(texts: string[]): Promise<Result<VectorEmbedding[]>> {
    try {
      if (texts.length === 0) {
        return Result.success([]);
      }

      if (texts.length > 100) {
        return Result.failure('Batch size too large (max: 100)');
      }

      // If no API key, return mock embeddings
      if (!this.apiKey) {
        const mockEmbeddings = await Promise.all(
          texts.map(text => this.generateMockEmbedding(text))
        );

        const embeddings: VectorEmbedding[] = [];
        for (const result of mockEmbeddings) {
          if (result.isSuccess) {
            embeddings.push(result.data);
          } else {
            return Result.failure(`Mock embedding failed: ${result.error}`);
          }
        }

        return Result.success(embeddings);
      }

      // Preprocess all texts
      const cleanedTexts = texts.map(text => this.preprocessText(text));

      // Call OpenAI API with batch
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: cleanedTexts,
          model: this.model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return Result.failure(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        return Result.failure('Invalid batch response from OpenAI API');
      }

      const embeddings: VectorEmbedding[] = [];
      
      for (const item of data.data) {
        if (!item.embedding || item.embedding.length !== 1536) {
          return Result.failure(`Invalid embedding in batch response`);
        }

        const embeddingResult = VectorEmbedding.create(item.embedding, this.model);
        if (!embeddingResult.isSuccess) {
          return Result.failure(`Invalid embedding: ${embeddingResult.error}`);
        }

        embeddings.push(embeddingResult.data);
      }

      return Result.success(embeddings);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return Result.failure(`Batch embedding generation failed: ${errorMessage}`);
    }
  }

  /**
   * Check if the embedding service is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get service configuration information
   */
  getConfiguration(): {
    model: string;
    maxTokens: number;
    isConfigured: boolean;
    baseUrl: string;
  } {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      isConfigured: this.isConfigured(),
      baseUrl: this.baseUrl
    };
  }

  // Private helper methods

  private preprocessText(text: string): string {
    // Clean and normalize text for embedding
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s\-.,!?]/g, '') // Remove special characters
      .substring(0, this.maxTokens * 4); // Truncate if too long
  }

  private async generateMockEmbedding(text: string): Promise<Result<VectorEmbedding>> {
    try {
      // Generate deterministic mock embedding based on text
      const embedding = this.createMockEmbeddingFromText(text);
      return VectorEmbedding.create(embedding, 'mock-embedding-model');
    } catch (error) {
      return Result.failure(`Mock embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createMockEmbeddingFromText(text: string): number[] {
    // Create a deterministic but realistic mock embedding
    const embedding = new Array(1536);
    const seed = this.hashString(text);
    
    // Use seeded random number generation for consistency
    let random = seed;
    for (let i = 0; i < 1536; i++) {
      random = (random * 9301 + 49297) % 233280;
      embedding[i] = (random / 233280 - 0.5) * 2; // Range: -1 to 1
    }

    // Normalize the vector to unit length (like real embeddings)
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  static calculateSimilarity(embedding1: VectorEmbedding, embedding2: VectorEmbedding): number {
    return embedding1.cosineSimilarity(embedding2);
  }

  /**
   * Validate embedding format and dimensions
   */
  static validateEmbedding(values: number[]): { valid: boolean; error?: string } {
    if (!Array.isArray(values)) {
      return { valid: false, error: 'Embedding must be an array' };
    }

    if (values.length !== 1536) {
      return { valid: false, error: `Invalid dimensions: ${values.length} (expected: 1536)` };
    }

    if (values.some(v => typeof v !== 'number' || isNaN(v))) {
      return { valid: false, error: 'Embedding contains invalid numeric values' };
    }

    const magnitude = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0));
    if (magnitude === 0) {
      return { valid: false, error: 'Embedding cannot be zero vector' };
    }

    return { valid: true };
  }
}

