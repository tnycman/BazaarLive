// Fashion API Integration Tests - Enterprise-grade API testing
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { db } from '../../db';
import { fashionListings, users } from '@shared/fashion-schema';
import { eq } from 'drizzle-orm';
import { createTestApp } from '../helpers/testApp';
import { createTestUser, createTestFashionListing, cleanupTestData } from '../helpers/testData';
import { generateTestToken } from '../helpers/auth';

describe('Fashion API Integration Tests', () => {
  let app: Express;
  let testUser: any;
  let testToken: string;
  let testListing: any;

  beforeAll(async () => {
    // Setup test application
    app = await createTestApp();
    
    // Create test user
    testUser = await createTestUser({
      username: 'testuser',
      email: 'test@example.com'
    });
    
    testToken = generateTestToken(testUser.id);
  });

  afterAll(async () => {
    // Cleanup all test data
    await cleanupTestData();
  });

  beforeEach(async () => {
    // Create fresh test listing for each test
    testListing = await createTestFashionListing({
      sellerId: testUser.id,
      title: 'Test Fashion Item',
      fashionCategory: 'women',
      condition: 'excellent',
      price: 99.99
    });
  });

  afterEach(async () => {
    // Cleanup test listings after each test
    try {
      await db.delete(fashionListings).where(eq(fashionListings.sellerId, testUser.id));
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  });

  describe('POST /api/fashion/listings', () => {
    const validListingData = {
      title: 'Vintage Chanel Blazer',
      description: 'Beautiful vintage Chanel blazer in excellent condition',
      fashionCategory: 'women',
      subcategory: 'blazers',
      brand: 'Chanel',
      size: '6',
      color: 'black',
      material: 'wool',
      condition: 'excellent',
      price: 599.99,
      originalPrice: 1200.00,
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      tags: ['vintage', 'designer'],
      styleTags: ['classic', 'professional'],
      location: 'New York, NY',
      isPriceNegotiable: true,
      isShippingIncluded: false
    };

    it('should create a fashion listing successfully', async () => {
      const response = await request(app)
        .post('/api/fashion/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(validListingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: validListingData.title,
        fashionCategory: validListingData.fashionCategory,
        price: validListingData.price,
        sellerId: testUser.id,
        status: 'active'
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validListingData };
      delete invalidData.title;
      delete invalidData.fashionCategory;

      const response = await request(app)
        .post('/api/fashion/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(2);
      expect(response.body.errors.some((e: any) => e.field === 'title')).toBe(true);
      expect(response.body.errors.some((e: any) => e.field === 'fashionCategory')).toBe(true);
    });

    it('should reject invalid fashion category', async () => {
      const invalidData = { ...validListingData, fashionCategory: 'invalid_category' };

      const response = await request(app)
        .post('/api/fashion/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.some((e: any) => e.field === 'fashionCategory')).toBe(true);
    });

    it('should reject invalid price values', async () => {
      const invalidData = { ...validListingData, price: -10 };

      const response = await request(app)
        .post('/api/fashion/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/fashion/listings')
        .send(validListingData)
        .expect(401);
    });

    it('should handle image validation', async () => {
      const dataWithInvalidImages = {
        ...validListingData,
        images: [] // Empty images array
      };

      const response = await request(app)
        .post('/api/fashion/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(dataWithInvalidImages)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/fashion/listings', () => {
    beforeEach(async () => {
      // Create multiple test listings for filtering tests
      await Promise.all([
        createTestFashionListing({
          sellerId: testUser.id,
          title: 'Red Dress',
          fashionCategory: 'women',
          subcategory: 'dresses',
          price: 150.00,
          color: 'red'
        }),
        createTestFashionListing({
          sellerId: testUser.id,
          title: 'Blue Jeans',
          fashionCategory: 'men',
          subcategory: 'jeans',
          price: 80.00,
          color: 'blue'
        }),
        createTestFashionListing({
          sellerId: testUser.id,
          title: 'Black Sneakers',
          fashionCategory: 'unisex',
          subcategory: 'shoes',
          price: 120.00,
          color: 'black'
        })
      ]);
    });

    it('should retrieve all fashion listings', async () => {
      const response = await request(app)
        .get('/api/fashion/listings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.items.length).toBeGreaterThan(0);
      expect(response.body.data.total).toBeGreaterThan(0);
      expect(response.body.data.page).toBe(1);
    });

    it('should filter by fashion category', async () => {
      const response = await request(app)
        .get('/api/fashion/listings?fashionCategory=women')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.every((item: any) => item.fashionCategory === 'women')).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/fashion/listings?minPrice=100&maxPrice=200')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.every((item: any) => item.price >= 100 && item.price <= 200)).toBe(true);
    });

    it('should filter by multiple criteria', async () => {
      const response = await request(app)
        .get('/api/fashion/listings?fashionCategory=women&minPrice=100&colors=red')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.items.forEach((item: any) => {
        expect(item.fashionCategory).toBe('women');
        expect(item.price).toBeGreaterThanOrEqual(100);
      });
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/fashion/listings?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBeLessThanOrEqual(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
    });

    it('should sort listings correctly', async () => {
      const responseNewest = await request(app)
        .get('/api/fashion/listings?sortBy=newest')
        .expect(200);

      const responsePriceLow = await request(app)
        .get('/api/fashion/listings?sortBy=price_low')
        .expect(200);

      expect(responseNewest.body.success).toBe(true);
      expect(responsePriceLow.body.success).toBe(true);

      // Check if price_low sorting works
      const prices = responsePriceLow.body.data.items.map((item: any) => item.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/fashion/listings?page=0&limit=200')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/fashion/listings/:id', () => {
    it('should retrieve a specific fashion listing', async () => {
      const response = await request(app)
        .get(`/api/fashion/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: testListing.id,
        title: testListing.title,
        fashionCategory: testListing.fashionCategory
      });
    });

    it('should increment view count', async () => {
      // Get initial view count
      const initialResponse = await request(app)
        .get(`/api/fashion/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      const initialViews = initialResponse.body.data.viewsCount || 0;

      // View again
      await request(app)
        .get(`/api/fashion/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // Check view count increased
      const updatedResponse = await request(app)
        .get(`/api/fashion/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(updatedResponse.body.data.viewsCount).toBeGreaterThan(initialViews);
    });

    it('should return 404 for non-existent listing', async () => {
      const response = await request(app)
        .get('/api/fashion/listings/non-existent-id')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/fashion/listings/:id', () => {
    const updateData = {
      title: 'Updated Fashion Item',
      price: 149.99,
      description: 'Updated description'
    };

    it('should update a fashion listing successfully', async () => {
      const response = await request(app)
        .put(`/api/fashion/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.price).toBe(updateData.price);
    });

    it('should prevent unauthorized updates', async () => {
      // Create another user
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com'
      });
      const otherToken = generateTestToken(otherUser.id);

      await request(app)
        .put(`/api/fashion/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(403);

      // Cleanup
      await db.delete(users).where(eq(users.id, otherUser.id));
    });

    it('should validate update data', async () => {
      const invalidUpdate = { price: -50 };

      const response = await request(app)
        .put(`/api/fashion/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/fashion/listings/${testListing.id}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /api/fashion/listings/:id', () => {
    it('should delete a fashion listing successfully', async () => {
      const response = await request(app)
        .delete(`/api/fashion/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      await request(app)
        .get(`/api/fashion/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);
    });

    it('should prevent unauthorized deletion', async () => {
      const otherUser = await createTestUser({
        username: 'deleteuser',
        email: 'delete@example.com'
      });
      const otherToken = generateTestToken(otherUser.id);

      await request(app)
        .delete(`/api/fashion/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      // Cleanup
      await db.delete(users).where(eq(users.id, otherUser.id));
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/fashion/listings/${testListing.id}`)
        .expect(401);
    });
  });

  describe('GET /api/fashion/search', () => {
    beforeEach(async () => {
      // Create searchable listings
      await Promise.all([
        createTestFashionListing({
          sellerId: testUser.id,
          title: 'Vintage Chanel Bag',
          description: 'Authentic vintage Chanel handbag',
          fashionCategory: 'women',
          brand: 'Chanel',
          tags: ['vintage', 'luxury']
        }),
        createTestFashionListing({
          sellerId: testUser.id,
          title: 'Modern Nike Sneakers',
          description: 'Latest Nike Air Max sneakers',
          fashionCategory: 'unisex',
          brand: 'Nike',
          tags: ['sports', 'casual']
        })
      ]);
    });

    it('should search listings by text', async () => {
      const response = await request(app)
        .get('/api/fashion/search?q=chanel')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBeGreaterThan(0);
      expect(response.body.data.items.some((item: any) => 
        item.title.toLowerCase().includes('chanel') || 
        item.description.toLowerCase().includes('chanel')
      )).toBe(true);
    });

    it('should search with filters', async () => {
      const response = await request(app)
        .get('/api/fashion/search?q=sneakers&category=unisex&brands=Nike')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.items.forEach((item: any) => {
        expect(item.fashionCategory).toBe('unisex');
        expect(item.brand).toBe('Nike');
      });
    });

    it('should require search query', async () => {
      const response = await request(app)
        .get('/api/fashion/search')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle pagination in search', async () => {
      const response = await request(app)
        .get('/api/fashion/search?q=fashion&page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBeLessThanOrEqual(1);
      expect(response.body.data.page).toBe(1);
    });
  });

  describe('Fashion Categories API', () => {
    it('should retrieve fashion categories', async () => {
      const response = await request(app)
        .get('/api/fashion/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toBeInstanceOf(Array);
      expect(response.body.data.categories.length).toBeGreaterThan(0);
      
      response.body.data.categories.forEach((category: any) => {
        expect(category).toHaveProperty('value');
        expect(category).toHaveProperty('label');
        expect(category).toHaveProperty('subcategories');
      });
    });

    it('should retrieve specific category configuration', async () => {
      const response = await request(app)
        .get('/api/fashion/categories/women')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.category).toBe('women');
      expect(response.body.data.config).toHaveProperty('subcategories');
      expect(response.body.data.config).toHaveProperty('sizes');
      expect(response.body.data.config).toHaveProperty('popularBrands');
    });

    it('should return 404 for invalid category', async () => {
      const response = await request(app)
        .get('/api/fashion/categories/invalid')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Fashion Interactions API', () => {
    it('should like a fashion listing', async () => {
      const response = await request(app)
        .post(`/api/fashion/listings/${testListing.id}/like`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should prevent duplicate likes', async () => {
      // Like first time
      await request(app)
        .post(`/api/fashion/listings/${testListing.id}/like`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // Try to like again
      const response = await request(app)
        .post(`/api/fashion/listings/${testListing.id}/like`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should unlike a fashion listing', async () => {
      // Like first
      await request(app)
        .post(`/api/fashion/listings/${testListing.id}/like`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // Unlike
      const response = await request(app)
        .delete(`/api/fashion/listings/${testListing.id}/like`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should add comment to fashion listing', async () => {
      const commentData = { content: 'This looks great!' };

      const response = await request(app)
        .post(`/api/fashion/listings/${testListing.id}/comments`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(commentData.content);
      expect(response.body.data.userId).toBe(testUser.id);
    });

    it('should retrieve comments for fashion listing', async () => {
      // Add a comment first
      await request(app)
        .post(`/api/fashion/listings/${testListing.id}/comments`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ content: 'Test comment' })
        .expect(201);

      const response = await request(app)
        .get(`/api/fashion/listings/${testListing.id}/comments`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on listing creation', async () => {
      const listingData = {
        title: 'Rate Limit Test',
        fashionCategory: 'women',
        condition: 'good',
        price: 50,
        images: ['test.jpg']
      };

      // Make multiple requests rapidly
      const requests = Array(12).fill(null).map(() =>
        request(app)
          .post('/api/fashion/listings')
          .set('Authorization', `Bearer ${testToken}`)
          .send(listingData)
      );

      const responses = await Promise.all(requests);
      
      // Should have some 429 (Too Many Requests) responses
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/fashion/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json{')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle large payloads appropriately', async () => {
      const largeData = {
        title: 'A'.repeat(10000), // Very long title
        fashionCategory: 'women',
        condition: 'good',
        price: 50,
        images: ['test.jpg']
      };

      const response = await request(app)
        .post('/api/fashion/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(largeData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
