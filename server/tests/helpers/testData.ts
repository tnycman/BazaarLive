// Test Data Helpers - Enterprise-grade test data management
import { db } from '../../db';
import { users, fashionListings } from '@shared/fashion-schema';
import { eq } from 'drizzle-orm';
import { FashionCategory, ProductCondition } from '@shared/types/FashionDomain';

export interface TestUserData {
  username: string;
  email: string;
  profileImageUrl?: string;
  isVerified?: boolean;
}

export interface TestFashionListingData {
  sellerId: string;
  title: string;
  description?: string;
  fashionCategory: FashionCategory;
  subcategory?: string;
  brand?: string;
  size?: string;
  color?: string;
  material?: string;
  condition: ProductCondition;
  price: number;
  originalPrice?: number;
  images?: string[];
  tags?: string[];
  styleTags?: string[];
  location?: string;
  isPriceNegotiable?: boolean;
  isShippingIncluded?: boolean;
  isHandmade?: boolean;
  isVintage?: boolean;
  isLimitedEdition?: boolean;
}

export async function createTestUser(userData: TestUserData) {
  const [user] = await db.insert(users).values({
    username: userData.username,
    email: userData.email,
    profileImageUrl: userData.profileImageUrl || null,
    isVerified: userData.isVerified || false,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  return user;
}

export async function createTestFashionListing(listingData: TestFashionListingData) {
  const [listing] = await db.insert(fashionListings).values({
    sellerId: listingData.sellerId,
    title: listingData.title,
    description: listingData.description || 'Test listing description',
    fashionCategory: listingData.fashionCategory,
    subcategory: listingData.subcategory || null,
    brand: listingData.brand || null,
    size: listingData.size || null,
    color: listingData.color || null,
    material: listingData.material || null,
    condition: listingData.condition,
    price: listingData.price,
    originalPrice: listingData.originalPrice || null,
    images: listingData.images || ['https://example.com/test-image.jpg'],
    tags: listingData.tags || [],
    styleTags: listingData.styleTags || [],
    location: listingData.location || 'Test City, TS',
    isPriceNegotiable: listingData.isPriceNegotiable || false,
    isShippingIncluded: listingData.isShippingIncluded || false,
    isHandmade: listingData.isHandmade || false,
    isVintage: listingData.isVintage || false,
    isLimitedEdition: listingData.isLimitedEdition || false,
    status: 'active',
    viewsCount: 0,
    likesCount: 0,
    sharesCount: 0,
    commentsCount: 0,
    isPromoted: false,
    measurements: {},
    careInstructions: [],
    sustainabilityInfo: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  return listing;
}

export async function cleanupTestData() {
  try {
    // Delete in reverse dependency order
    await db.delete(fashionListings);
    await db.delete(users);
    console.log('Test data cleaned up successfully');
  } catch (error) {
    console.warn('Error during test cleanup:', error);
  }
}

export async function createTestDataSet() {
  // Create test users
  const seller1 = await createTestUser({
    username: 'seller1',
    email: 'seller1@test.com',
    isVerified: true
  });

  const seller2 = await createTestUser({
    username: 'seller2',
    email: 'seller2@test.com'
  });

  const buyer1 = await createTestUser({
    username: 'buyer1',
    email: 'buyer1@test.com'
  });

  // Create test listings
  const listings = await Promise.all([
    createTestFashionListing({
      sellerId: seller1.id,
      title: 'Vintage Chanel Blazer',
      description: 'Authentic vintage Chanel blazer from the 1990s',
      fashionCategory: 'women',
      subcategory: 'blazers',
      brand: 'Chanel',
      size: '6',
      color: 'black',
      material: 'wool',
      condition: 'excellent',
      price: 599.99,
      originalPrice: 1200.00,
      tags: ['vintage', 'luxury', 'designer'],
      styleTags: ['classic', 'professional'],
      isVintage: true,
      isPriceNegotiable: true
    }),
    createTestFashionListing({
      sellerId: seller1.id,
      title: 'Modern Nike Sneakers',
      description: 'Brand new Nike Air Max sneakers',
      fashionCategory: 'unisex',
      subcategory: 'sneakers',
      brand: 'Nike',
      size: '9',
      color: 'white',
      material: 'synthetic',
      condition: 'new_with_tags',
      price: 129.99,
      tags: ['athletic', 'casual'],
      styleTags: ['sporty', 'street'],
      isShippingIncluded: true
    }),
    createTestFashionListing({
      sellerId: seller2.id,
      title: 'Handmade Bohemian Dress',
      description: 'Beautiful handmade dress with intricate patterns',
      fashionCategory: 'women',
      subcategory: 'dresses',
      size: 'M',
      color: 'multicolor',
      material: 'cotton',
      condition: 'new_without_tags',
      price: 89.99,
      tags: ['handmade', 'bohemian'],
      styleTags: ['boho', 'casual'],
      isHandmade: true,
      location: 'Portland, OR'
    }),
    createTestFashionListing({
      sellerId: seller2.id,
      title: 'Designer Silk Scarf',
      description: 'Luxury silk scarf from high-end designer',
      fashionCategory: 'accessories',
      subcategory: 'scarves',
      brand: 'Hermès',
      color: 'blue',
      material: 'silk',
      condition: 'excellent',
      price: 299.99,
      originalPrice: 450.00,
      tags: ['luxury', 'silk', 'designer'],
      styleTags: ['elegant', 'classic'],
      isPriceNegotiable: false
    })
  ]);

  return {
    users: { seller1, seller2, buyer1 },
    listings
  };
}

export function generateTestListingData(overrides: Partial<TestFashionListingData> = {}): TestFashionListingData {
  return {
    sellerId: 'test-seller-id',
    title: 'Test Fashion Item',
    description: 'Test description for fashion item',
    fashionCategory: 'women',
    subcategory: 'tops',
    brand: 'Test Brand',
    size: 'M',
    color: 'blue',
    material: 'cotton',
    condition: 'good',
    price: 49.99,
    originalPrice: 79.99,
    images: ['https://example.com/test1.jpg', 'https://example.com/test2.jpg'],
    tags: ['test', 'sample'],
    styleTags: ['casual'],
    location: 'Test City, TS',
    isPriceNegotiable: true,
    isShippingIncluded: false,
    ...overrides
  };
}

export function generateTestUserData(overrides: Partial<TestUserData> = {}): TestUserData {
  const timestamp = Date.now();
  return {
    username: `testuser${timestamp}`,
    email: `test${timestamp}@example.com`,
    isVerified: false,
    ...overrides
  };
}
