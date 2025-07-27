/**
 * Enterprise Vector Search Routes - Phase 5 Task 5.1
 * AOP-compliant API routes for vector search operations with comprehensive validation
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getVectorSearchFacade } from '../facade/VectorSearchFacade';

const router = Router();

// Validation Schemas
const semanticSearchSchema = z.object({
  query: z.string().min(3).max(1000),
  embeddingType: z.enum(['title', 'description', 'combined']).default('combined'),
  threshold: z.number().min(0).max(1).default(0.7),
  limit: z.number().min(1).max(100).default(20),
  filters: z.object({
    category: z.string().optional(),
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0)
    }).optional(),
    brand: z.string().optional(),
    location: z.string().optional(),
    condition: z.string().optional()
  }).optional()
});

const similarListingsSchema = z.object({
  listingId: z.string().uuid(),
  threshold: z.number().min(0).max(1).default(0.7),
  limit: z.number().min(1).max(100).default(20)
});

const recommendationsSchema = z.object({
  userId: z.string().uuid(),
  limit: z.number().min(1).max(50).default(20)
});

const preferencesUpdateSchema = z.object({
  userId: z.string().uuid(),
  interactions: z.object({
    likes: z.array(z.object({
      listingId: z.string().uuid(),
      category: z.string(),
      brand: z.string().optional(),
      price: z.number()
    })),
    views: z.array(z.object({
      listingId: z.string().uuid(),
      category: z.string(),
      brand: z.string().optional(),
      price: z.number()
    })),
    purchases: z.array(z.object({
      listingId: z.string().uuid(),
      category: z.string(),
      brand: z.string().optional(),
      price: z.number()
    })),
    searches: z.array(z.object({
      query: z.string(),
      category: z.string().optional()
    }))
  })
});

const embeddingGenerationSchema = z.object({
  listingId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(5000)
});

const batchEmbeddingSchema = z.object({
  listings: z.array(z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(500),
    description: z.string().min(1).max(5000)
  })).max(100)
});

/**
 * POST /api/vector-search/semantic
 * Execute semantic search with vector embeddings
 */
router.post('/semantic', async (req: Request, res: Response) => {
  try {
    const validation = semanticSearchSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.errors
      });
    }

    const { query, embeddingType, threshold, limit, filters } = validation.data;
    const vectorSearchFacade = getVectorSearchFacade();
    
    // Extract user ID from session if available
    const userId = (req as any).user?.id;

    const result = await vectorSearchFacade.semanticSearch(query, {
      embeddingType,
      threshold,
      limit,
      filters,
      userId
    });

    if (!result.isSuccess) {
      return res.status(500).json({
        error: 'Semantic search failed',
        message: result.error
      });
    }

    const searchResults = result.data;
    const response = {
      results: searchResults,
      queryId: `search-${Date.now()}`,
      processingTime: 0, // This would be set by performance aspects
      totalResults: searchResults.length,
      query: {
        text: query,
        embeddingType,
        threshold,
        filters
      }
    };

    res.json(response);

  } catch (error) {
    console.error('[VECTOR-ROUTES] Semantic search error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/vector-search/similar
 * Find similar listings based on a reference listing
 */
router.post('/similar', async (req: Request, res: Response) => {
  try {
    const validation = similarListingsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.errors
      });
    }

    const { listingId, threshold, limit } = validation.data;
    const vectorSearchFacade = getVectorSearchFacade();

    const result = await vectorSearchFacade.findSimilarListings(listingId, {
      threshold,
      limit
    });

    if (!result.isSuccess) {
      return res.status(500).json({
        error: 'Similar listings search failed',
        message: result.error
      });
    }

    const searchResults = result.data;
    const response = {
      results: searchResults,
      referenceListingId: listingId,
      processingTime: 0,
      totalResults: searchResults.length,
      parameters: {
        threshold,
        limit
      }
    };

    res.json(response);

  } catch (error) {
    console.error('[VECTOR-ROUTES] Similar listings error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/vector-search/recommendations/:userId
 * Get personalized recommendations for a user
 */
router.get('/recommendations/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        error: 'Limit must be between 1 and 50'
      });
    }

    const vectorSearchFacade = getVectorSearchFacade();

    // In a real implementation, get user preferences from database
    const mockPreferences = {
      userId,
      categoryWeights: { 'fashion': 1.2, 'electronics': 0.8 },
      priceRanges: {},
      brandPreferences: [],
      stylePreferences: {},
      interactionWeights: {
        likes: 0.3,
        views: 0.4,
        purchases: 0.25,
        searches: 0.05
      }
    };

    const result = await vectorSearchFacade.getPersonalizedRecommendations(
      userId,
      mockPreferences,
      limit
    );

    if (!result.isSuccess) {
      return res.status(500).json({
        error: 'Recommendation generation failed',
        message: result.error
      });
    }

    const recommendations = result.data;
    const response = {
      results: recommendations,
      userId,
      processingTime: 0,
      totalResults: recommendations.length,
      parameters: {
        limit,
        personalizationLevel: 'high'
      }
    };

    res.json(response);

  } catch (error) {
    console.error('[VECTOR-ROUTES] Recommendations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/vector-search/preferences
 * Update user preferences based on interactions
 */
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const validation = preferencesUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.errors
      });
    }

    const { userId, interactions } = validation.data;
    const vectorSearchFacade = getVectorSearchFacade();

    const result = await vectorSearchFacade.updateUserPreferences(userId, interactions);

    if (!result.isSuccess) {
      return res.status(500).json({
        error: 'Preference update failed',
        message: result.error
      });
    }

    const updatedPreferences = result.data;
    const response = {
      success: true,
      message: 'User preferences updated successfully',
      preferences: updatedPreferences,
      interactionsSummary: {
        likes: interactions.likes.length,
        views: interactions.views.length,
        purchases: interactions.purchases.length,
        searches: interactions.searches.length
      }
    };

    res.json(response);

  } catch (error) {
    console.error('[VECTOR-ROUTES] Preferences update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/vector-search/embeddings/generate
 * Generate embeddings for a listing
 */
router.post('/embeddings/generate', async (req: Request, res: Response) => {
  try {
    const validation = embeddingGenerationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.errors
      });
    }

    const { listingId, title, description } = validation.data;
    const vectorSearchFacade = getVectorSearchFacade();

    const result = await vectorSearchFacade.generateListingEmbeddings(
      listingId,
      title,
      description
    );

    if (!result.isSuccess) {
      return res.status(500).json({
        error: 'Embedding generation failed',
        message: result.error
      });
    }

    const response = {
      success: true,
      message: 'Embeddings generated successfully',
      listingId,
      embeddingTypes: ['title', 'description', 'combined'],
      processingTime: 0
    };

    res.json(response);

  } catch (error) {
    console.error('[VECTOR-ROUTES] Embedding generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/vector-search/embeddings/batch
 * Batch generate embeddings for multiple listings
 */
router.post('/embeddings/batch', async (req: Request, res: Response) => {
  try {
    const validation = batchEmbeddingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.errors
      });
    }

    const { listings } = validation.data;
    const vectorSearchFacade = getVectorSearchFacade();

    const result = await vectorSearchFacade.batchGenerateEmbeddings(listings);

    if (!result.isSuccess) {
      return res.status(500).json({
        error: 'Batch embedding generation failed',
        message: result.error
      });
    }

    const batchResults = result.data;
    const response = {
      success: true,
      message: 'Batch embedding generation completed',
      results: batchResults,
      summary: {
        total: listings.length,
        successful: batchResults.success.length,
        failed: batchResults.failed.length,
        successRate: batchResults.success.length / listings.length
      },
      processingTime: 0
    };

    res.json(response);

  } catch (error) {
    console.error('[VECTOR-ROUTES] Batch embedding error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/vector-search/health
 * Get vector search system health status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const vectorSearchFacade = getVectorSearchFacade();
    const healthStatus = vectorSearchFacade.getHealthStatus();

    res.json({
      status: healthStatus.isHealthy ? 'healthy' : 'unhealthy',
      components: healthStatus.components,
      aspects: healthStatus.aspectsStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[VECTOR-ROUTES] Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/vector-search/metrics
 * Get vector search performance metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const vectorSearchFacade = getVectorSearchFacade();
    const metrics = vectorSearchFacade.getPerformanceMetrics();

    res.json({
      ...metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[VECTOR-ROUTES] Metrics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;