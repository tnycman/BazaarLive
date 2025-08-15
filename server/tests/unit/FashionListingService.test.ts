// Fashion Listing Service Unit Tests - Enterprise-grade test suite
import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { FashionListingService } from '../../services/FashionListingService';
import { FashionListingCreate, FashionListingUpdate, FashionCategory } from '@shared/types/FashionDomain';
import { CacheService } from '../../services/CacheService';
import { AnalyticsService } from '../../services/AnalyticsService';
import { ImageProcessingService } from '../../services/ImageProcessingService';
import { VectorSearchService } from '../../services/VectorSearchService';

// Mock dependencies
vi.mock('../../repositories/FashionListingsRepository');
vi.mock('../../repositories/FashionInteractionsRepository');

const mockCacheService: CacheService = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  clear: vi.fn(),
  exists: vi.fn()
} as any;

const mockAnalyticsService: AnalyticsService = {
  trackEvent: vi.fn(),
  trackMetric: vi.fn(),
  trackError: vi.fn()
} as any;

const mockImageService: ImageProcessingService = {
  processImages: vi.fn(),
  validateImages: vi.fn(),
  generateThumbnails: vi.fn(),
  optimizeImages: vi.fn()
} as any;

const mockVectorService: VectorSearchService = {
  indexFashionListing: vi.fn(),
  searchFashionListings: vi.fn(),
  deleteFashionListing: vi.fn(),
  updateFashionListing: vi.fn()
} as any;

describe('FashionListingService', () => {
  let fashionListingService: FashionListingService;
  let mockRepository: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create service instance
    fashionListingService = new FashionListingService(
      mockCacheService,
      mockAnalyticsService,
      mockImageService,
      mockVectorService
    );

    // Mock repository methods
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      findByFilters: vi.fn(),
      incrementViewCount: vi.fn()
    };

    // Replace repository instance
    (fashionListingService as any).listingsRepository = mockRepository;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createFashionListing', () => {
    const mockUserId = 'user-123';
    const mockListingData: FashionListingCreate = {
      title: 'Vintage Chanel Blazer',
      description: 'Beautiful vintage Chanel blazer in excellent condition',
      fashionCategory: 'women' as FashionCategory,
      subcategory: 'blazers',
      brand: 'Chanel',
      size: '6',
      color: 'black',
      material: 'wool',
      condition: 'excellent',
      price: 599.99,
      originalPrice: 1200.00,
      images: ['image1.jpg', 'image2.jpg'],
      tags: ['vintage', 'designer'],
      styleTags: ['classic', 'professional'],
      location: 'New York, NY',
      isPriceNegotiable: true,
      isShippingIncluded: false
    };

    const mockCreatedListing = {
      id: 'listing-123',
      ...mockListingData,
      sellerId: mockUserId,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should create a fashion listing successfully', async () => {
      // Arrange
      (mockImageService.validateImages as Mock).mockResolvedValue({ isValid: true });
      (mockImageService.processImages as Mock).mockResolvedValue(mockListingData.images);
      (mockRepository.create as Mock).mockResolvedValue(mockCreatedListing);
      (mockVectorService.indexFashionListing as Mock).mockResolvedValue(undefined);

      // Act
      const result = await fashionListingService.createFashionListing(mockUserId, mockListingData);

      // Assert
      expect(result).toEqual(mockCreatedListing);
      expect(mockImageService.validateImages).toHaveBeenCalledWith(mockListingData.images);
      expect(mockImageService.processImages).toHaveBeenCalledWith(mockListingData.images);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...mockListingData,
        sellerId: mockUserId
      });
      expect(mockVectorService.indexFashionListing).toHaveBeenCalledWith(mockCreatedListing);
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('fashion_listing_created', {
        listingId: mockCreatedListing.id,
        userId: mockUserId,
        category: mockListingData.fashionCategory,
        price: mockListingData.price
      });
    });

    it('should throw error when images are invalid', async () => {
      // Arrange
      (mockImageService.validateImages as Mock).mockResolvedValue({ 
        isValid: false, 
        errors: ['Invalid image format'] 
      });

      // Act & Assert
      await expect(
        fashionListingService.createFashionListing(mockUserId, mockListingData)
      ).rejects.toThrow('Image validation failed');
      
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      (mockImageService.validateImages as Mock).mockResolvedValue({ isValid: true });
      (mockImageService.processImages as Mock).mockResolvedValue(mockListingData.images);
      (mockRepository.create as Mock).mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        fashionListingService.createFashionListing(mockUserId, mockListingData)
      ).rejects.toThrow('Database error');
      
      expect(mockVectorService.indexFashionListing).not.toHaveBeenCalled();
    });

    it('should track analytics even if vector indexing fails', async () => {
      // Arrange
      (mockImageService.validateImages as Mock).mockResolvedValue({ isValid: true });
      (mockImageService.processImages as Mock).mockResolvedValue(mockListingData.images);
      (mockRepository.create as Mock).mockResolvedValue(mockCreatedListing);
      (mockVectorService.indexFashionListing as Mock).mockRejectedValue(new Error('Vector service error'));

      // Act
      const result = await fashionListingService.createFashionListing(mockUserId, mockListingData);

      // Assert
      expect(result).toEqual(mockCreatedListing);
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('fashion_listing_created', expect.any(Object));
      expect(mockAnalyticsService.trackError).toHaveBeenCalledWith('vector_indexing_failed', expect.any(Object));
    });
  });

  describe('getFashionListing', () => {
    const mockListingId = 'listing-123';
    const mockUserId = 'user-456';
    const mockListing = {
      id: mockListingId,
      title: 'Test Listing',
      sellerId: 'user-123',
      fashionCategory: 'women' as FashionCategory,
      price: 99.99,
      status: 'active'
    };

    it('should retrieve listing and increment view count', async () => {
      // Arrange
      const cacheKey = `fashion_listing:${mockListingId}`;
      (mockCacheService.get as Mock).mockResolvedValue(null);
      (mockRepository.findById as Mock).mockResolvedValue(mockListing);
      (mockRepository.incrementViewCount as Mock).mockResolvedValue(undefined);
      (mockCacheService.set as Mock).mockResolvedValue(undefined);

      // Act
      const result = await fashionListingService.getFashionListing(mockListingId, mockUserId);

      // Assert
      expect(result).toEqual(mockListing);
      expect(mockRepository.findById).toHaveBeenCalledWith(mockListingId);
      expect(mockRepository.incrementViewCount).toHaveBeenCalledWith(mockListingId);
      expect(mockCacheService.set).toHaveBeenCalledWith(cacheKey, mockListing, 300);
    });

    it('should return cached listing if available', async () => {
      // Arrange
      const cacheKey = `fashion_listing:${mockListingId}`;
      (mockCacheService.get as Mock).mockResolvedValue(mockListing);

      // Act
      const result = await fashionListingService.getFashionListing(mockListingId, mockUserId);

      // Assert
      expect(result).toEqual(mockListing);
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.incrementViewCount).toHaveBeenCalledWith(mockListingId);
    });

    it('should throw error when listing not found', async () => {
      // Arrange
      (mockCacheService.get as Mock).mockResolvedValue(null);
      (mockRepository.findById as Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        fashionListingService.getFashionListing(mockListingId, mockUserId)
      ).rejects.toThrow('Fashion listing not found');
    });
  });

  describe('updateFashionListing', () => {
    const mockListingId = 'listing-123';
    const mockUserId = 'user-123';
    const mockUpdates: FashionListingUpdate = {
      title: 'Updated Title',
      price: 149.99
    };
    const mockExistingListing = {
      id: mockListingId,
      sellerId: mockUserId,
      title: 'Original Title',
      price: 99.99
    };
    const mockUpdatedListing = {
      ...mockExistingListing,
      ...mockUpdates
    };

    it('should update listing successfully', async () => {
      // Arrange
      (mockRepository.findById as Mock).mockResolvedValue(mockExistingListing);
      (mockRepository.update as Mock).mockResolvedValue(mockUpdatedListing);
      (mockVectorService.updateFashionListing as Mock).mockResolvedValue(undefined);
      (mockCacheService.del as Mock).mockResolvedValue(undefined);

      // Act
      const result = await fashionListingService.updateFashionListing(mockListingId, mockUserId, mockUpdates);

      // Assert
      expect(result).toEqual(mockUpdatedListing);
      expect(mockRepository.update).toHaveBeenCalledWith(mockListingId, mockUpdates);
      expect(mockVectorService.updateFashionListing).toHaveBeenCalledWith(mockUpdatedListing);
      expect(mockCacheService.del).toHaveBeenCalledWith(`fashion_listing:${mockListingId}`);
    });

    it('should throw permission error when user is not the seller', async () => {
      // Arrange
      const differentUserId = 'user-456';
      (mockRepository.findById as Mock).mockResolvedValue(mockExistingListing);

      // Act & Assert
      await expect(
        fashionListingService.updateFashionListing(mockListingId, differentUserId, mockUpdates)
      ).rejects.toThrow('Permission denied');
    });

    it('should throw error when listing not found', async () => {
      // Arrange
      (mockRepository.findById as Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        fashionListingService.updateFashionListing(mockListingId, mockUserId, mockUpdates)
      ).rejects.toThrow('Fashion listing not found');
    });
  });

  describe('deleteFashionListing', () => {
    const mockListingId = 'listing-123';
    const mockUserId = 'user-123';
    const mockListing = {
      id: mockListingId,
      sellerId: mockUserId,
      title: 'Test Listing'
    };

    it('should delete listing successfully', async () => {
      // Arrange
      (mockRepository.findById as Mock).mockResolvedValue(mockListing);
      (mockRepository.softDelete as Mock).mockResolvedValue(undefined);
      (mockVectorService.deleteFashionListing as Mock).mockResolvedValue(undefined);
      (mockCacheService.del as Mock).mockResolvedValue(undefined);

      // Act
      await fashionListingService.deleteFashionListing(mockListingId, mockUserId);

      // Assert
      expect(mockRepository.softDelete).toHaveBeenCalledWith(mockListingId);
      expect(mockVectorService.deleteFashionListing).toHaveBeenCalledWith(mockListingId);
      expect(mockCacheService.del).toHaveBeenCalledWith(`fashion_listing:${mockListingId}`);
    });

    it('should throw permission error when user is not the seller', async () => {
      // Arrange
      const differentUserId = 'user-456';
      (mockRepository.findById as Mock).mockResolvedValue(mockListing);

      // Act & Assert
      await expect(
        fashionListingService.deleteFashionListing(mockListingId, differentUserId)
      ).rejects.toThrow('Permission denied');
      
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('getFashionListings', () => {
    const mockFilters = {
      fashionCategory: 'women' as FashionCategory,
      priceRange: { min: 50, max: 200 }
    };
    const mockPaginatedResult = {
      items: [
        { id: 'listing-1', title: 'Listing 1' },
        { id: 'listing-2', title: 'Listing 2' }
      ],
      total: 10,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    };

    it('should retrieve filtered listings successfully', async () => {
      // Arrange
      const cacheKey = 'fashion_listings:filtered:' + JSON.stringify(mockFilters);
      (mockCacheService.get as Mock).mockResolvedValue(null);
      (mockRepository.findByFilters as Mock).mockResolvedValue(mockPaginatedResult);
      (mockCacheService.set as Mock).mockResolvedValue(undefined);

      // Act
      const result = await fashionListingService.getFashionListings(mockFilters, 'newest', 1, 20);

      // Assert
      expect(result).toEqual(mockPaginatedResult);
      expect(mockRepository.findByFilters).toHaveBeenCalledWith(
        mockFilters,
        { page: 1, limit: 20, offset: 0 },
        'newest'
      );
      expect(mockCacheService.set).toHaveBeenCalledWith(cacheKey, mockPaginatedResult, 120);
    });

    it('should return cached results when available', async () => {
      // Arrange
      const cacheKey = 'fashion_listings:filtered:' + JSON.stringify(mockFilters);
      (mockCacheService.get as Mock).mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await fashionListingService.getFashionListings(mockFilters, 'newest', 1, 20);

      // Assert
      expect(result).toEqual(mockPaginatedResult);
      expect(mockRepository.findByFilters).not.toHaveBeenCalled();
    });

    it('should handle invalid pagination parameters', async () => {
      // Act & Assert
      await expect(
        fashionListingService.getFashionListings(mockFilters, 'newest', 0, 20)
      ).rejects.toThrow('Invalid pagination parameters');

      await expect(
        fashionListingService.getFashionListings(mockFilters, 'newest', 1, 0)
      ).rejects.toThrow('Invalid pagination parameters');

      await expect(
        fashionListingService.getFashionListings(mockFilters, 'newest', 1, 101)
      ).rejects.toThrow('Invalid pagination parameters');
    });
  });

  describe('Error Handling', () => {
    it('should handle cache service failures gracefully', async () => {
      // Arrange
      const mockListingId = 'listing-123';
      const mockUserId = 'user-456';
      const mockListing = { id: mockListingId, title: 'Test' };
      
      (mockCacheService.get as Mock).mockRejectedValue(new Error('Cache error'));
      (mockRepository.findById as Mock).mockResolvedValue(mockListing);
      (mockRepository.incrementViewCount as Mock).mockResolvedValue(undefined);

      // Act
      const result = await fashionListingService.getFashionListing(mockListingId, mockUserId);

      // Assert
      expect(result).toEqual(mockListing);
      expect(mockRepository.findById).toHaveBeenCalled();
    });

    it('should handle analytics service failures gracefully', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockListingData: FashionListingCreate = {
        title: 'Test Listing',
        fashionCategory: 'women' as FashionCategory,
        condition: 'good',
        price: 99.99,
        images: ['test.jpg']
      } as FashionListingCreate;
      const mockCreatedListing = { id: 'listing-123', ...mockListingData };

      (mockImageService.validateImages as Mock).mockResolvedValue({ isValid: true });
      (mockImageService.processImages as Mock).mockResolvedValue(mockListingData.images);
      (mockRepository.create as Mock).mockResolvedValue(mockCreatedListing);
      (mockAnalyticsService.trackEvent as Mock).mockRejectedValue(new Error('Analytics error'));

      // Act
      const result = await fashionListingService.createFashionListing(mockUserId, mockListingData);

      // Assert
      expect(result).toEqual(mockCreatedListing);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });
});
