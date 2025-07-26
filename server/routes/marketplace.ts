// Simplified marketplace API routes working with existing storage interface
import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { z } from 'zod';

const marketplaceRouter = Router();

// Input validation schemas
const VerticalQuerySchema = z.object({
  vertical: z.string().min(1, 'Vertical is required'),
  category: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20)
});

// GET /api/marketplace/vertical/:vertical - Get listings by vertical
marketplaceRouter.get('/vertical/:vertical', isAuthenticated, async (req, res) => {
  try {
    const validatedQuery = VerticalQuerySchema.parse({
      vertical: req.params.vertical,
      ...req.query
    });

    const { vertical, category, page, limit } = validatedQuery;
    const offset = (page - 1) * limit;
    
    // Use existing storage interface with search term for vertical filtering
    const listings = await storage.getListings({
      category: category || undefined,
      search: vertical,
      offset,
      limit
    });
    
    const response = {
      listings,
      pagination: {
        page,
        limit,
        totalCount: listings.length,
        totalPages: Math.ceil(listings.length / limit),
        hasNextPage: listings.length === limit,
        hasPreviousPage: page > 1
      },
      filters: {
        vertical,
        category
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching vertical listings:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid query parameters',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      message: 'Failed to fetch marketplace listings'
    });
  }
});

export { marketplaceRouter };