// Fashion Domain Types - Enterprise-grade TypeScript definitions
import { z } from "zod";

// Fashion Category Constants and Types
export const FASHION_CATEGORIES = [
  'women',
  'men', 
  'kids',
  'home',
  'electronics',
  'pets',
  'beauty',
  'sports'
] as const;

export type FashionCategory = typeof FASHION_CATEGORIES[number];

// Fashion Category Labels for UI
export const FASHION_CATEGORY_LABELS: Record<FashionCategory, string> = {
  women: "Women's Fashion",
  men: "Men's Fashion",
  kids: "Kids & Baby",
  home: "Home & Lifestyle",
  electronics: "Electronics & Tech",
  pets: "Pet Accessories",
  beauty: "Beauty & Wellness",
  sports: "Sports & Outdoors"
} as const;

// Product Condition Constants and Types
export const CONDITION_OPTIONS = [
  'new_with_tags',
  'new_without_tags', 
  'excellent',
  'good',
  'fair',
  'poor'
] as const;

export type ProductCondition = typeof CONDITION_OPTIONS[number];

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new_with_tags: "New with Tags",
  new_without_tags: "New without Tags",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor"
} as const;

export const CONDITION_DESCRIPTIONS: Record<ProductCondition, string> = {
  new_with_tags: "Brand new item with original tags attached",
  new_without_tags: "Brand new item without tags, never worn",
  excellent: "Like new condition with minimal signs of wear",
  good: "Gently used with minor signs of wear",
  fair: "Used with noticeable signs of wear but functional",
  poor: "Heavily used with significant signs of wear"
} as const;

// Fashion Status Constants and Types
export const FASHION_STATUS_OPTIONS = [
  'active',
  'sold',
  'pending',
  'draft',
  'archived'
] as const;

export type FashionListingStatus = typeof FASHION_STATUS_OPTIONS[number];

export const STATUS_LABELS: Record<FashionListingStatus, string> = {
  active: "Active",
  sold: "Sold",
  pending: "Pending Sale",
  draft: "Draft",
  archived: "Archived"
} as const;

// Size System Types
export const SIZE_SYSTEMS = [
  'us',
  'uk',
  'eu',
  'international',
  'numeric',
  'freesize'
] as const;

export type SizeSystem = typeof SIZE_SYSTEMS[number];

export interface SizeInfo {
  value: string;
  system: SizeSystem;
  category: 'clothing' | 'shoes' | 'accessories' | 'other';
}

// Color Constants
export const FASHION_COLORS = [
  'black', 'white', 'gray', 'brown', 'beige', 'cream',
  'red', 'pink', 'orange', 'yellow', 'green', 'blue',
  'purple', 'navy', 'burgundy', 'gold', 'silver',
  'multicolor', 'other'
] as const;

export type FashionColor = typeof FASHION_COLORS[number];

// Material Types
export const FASHION_MATERIALS = [
  'cotton', 'polyester', 'wool', 'silk', 'linen', 'denim',
  'leather', 'suede', 'cashmere', 'bamboo', 'modal',
  'spandex', 'nylon', 'acrylic', 'viscose', 'other'
] as const;

export type FashionMaterial = typeof FASHION_MATERIALS[number];

// Core Fashion Listing Interface
export interface FashionListing {
  readonly id: string;
  readonly sellerId: string;
  
  // Basic Information
  title: string;
  description?: string;
  
  // Fashion Categorization
  fashionCategory: FashionCategory;
  subcategory?: string;
  subSubcategory?: string;
  
  // Fashion Attributes
  brand?: string;
  size?: string;
  sizeInfo?: SizeInfo;
  color?: string;
  colors?: string[]; // Multiple colors
  material?: string;
  materials?: string[]; // Multiple materials
  styleTags?: string[];
  
  // Marketplace Fields
  condition: ProductCondition;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  tags?: string[];
  status: FashionListingStatus;
  
  // Engagement Metrics
  readonly viewsCount: number;
  readonly likesCount: number;
  readonly sharesCount: number;
  readonly commentsCount: number;
  
  // Metadata
  location?: string;
  isPromoted: boolean;
  isPriceNegotiable?: boolean;
  isShippingIncluded?: boolean;
  
  // AI/Search Vectors (readonly)
  readonly titleEmbedding?: number[];
  readonly descriptionEmbedding?: number[];
  readonly combinedEmbedding?: number[];
  
  // Timestamps
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Fashion Listing Creation Interface
export interface FashionListingCreate {
  title: string;
  description?: string;
  fashionCategory: FashionCategory;
  subcategory?: string;
  subSubcategory?: string;
  brand?: string;
  size?: string;
  sizeInfo?: SizeInfo;
  color?: string;
  colors?: string[];
  material?: string;
  materials?: string[];
  styleTags?: string[];
  condition: ProductCondition;
  price: number;
  originalPrice?: number;
  currency?: string;
  images: string[];
  tags?: string[];
  location?: string;
  isPriceNegotiable?: boolean;
  isShippingIncluded?: boolean;
}

// Fashion Listing Update Interface
export interface FashionListingUpdate {
  title?: string;
  description?: string;
  subcategory?: string;
  subSubcategory?: string;
  brand?: string;
  size?: string;
  sizeInfo?: SizeInfo;
  color?: string;
  colors?: string[];
  material?: string;
  materials?: string[];
  styleTags?: string[];
  condition?: ProductCondition;
  price?: number;
  originalPrice?: number;
  images?: string[];
  tags?: string[];
  location?: string;
  isPriceNegotiable?: boolean;
  isShippingIncluded?: boolean;
  status?: FashionListingStatus;
}

// Fashion Filters Interface
export interface FashionListingFilters {
  fashionCategory?: FashionCategory;
  subcategory?: string;
  subcategories?: string[];
  brand?: string;
  brands?: string[];
  size?: string;
  sizes?: string[];
  color?: string;
  colors?: string[];
  material?: string;
  materials?: string[];
  condition?: ProductCondition;
  conditions?: ProductCondition[];
  priceRange?: {
    min: number;
    max: number;
  };
  styleTags?: string[];
  location?: string;
  isPromoted?: boolean;
  isPriceNegotiable?: boolean;
  isShippingIncluded?: boolean;
  status?: FashionListingStatus;
  sellerId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Fashion Search Query Interface
export interface FashionSearchQuery {
  text?: string;
  filters?: FashionListingFilters;
  sortBy?: FashionSortOption;
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
}

// Sort Options
export const FASHION_SORT_OPTIONS = [
  'relevance',
  'price_low',
  'price_high', 
  'newest',
  'oldest',
  'popularity',
  'views',
  'likes',
  'alphabetical'
] as const;

export type FashionSortOption = typeof FASHION_SORT_OPTIONS[number];

export const SORT_LABELS: Record<FashionSortOption, string> = {
  relevance: "Most Relevant",
  price_low: "Price: Low to High",
  price_high: "Price: High to Low",
  newest: "Newest First",
  oldest: "Oldest First",
  popularity: "Most Popular",
  views: "Most Viewed",
  likes: "Most Liked",
  alphabetical: "A to Z"
} as const;

// Pagination Interface
export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Fashion Listing with Enhanced Metadata
export interface FashionListingWithMetadata extends FashionListing {
  sellerInfo?: {
    username: string;
    profileImageUrl?: string;
    isVerified: boolean;
    followersCount: number;
    salesCount: number;
    averageRating?: number;
    responseTime?: string; // e.g., "Usually responds within 2 hours"
  };
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowingSeller?: boolean;
  similarListings?: FashionListing[];
  priceHistory?: Array<{
    price: number;
    date: Date;
    eventType: 'created' | 'price_drop' | 'price_increase';
  }>;
  viewHistory?: {
    totalViews: number;
    uniqueViews: number;
    viewsThisWeek: number;
  };
}

// Fashion Analytics Interfaces
export interface FashionCategoryAnalytics {
  category: FashionCategory;
  subcategory?: string;
  period: string;
  metrics: {
    totalListings: number;
    newListings: number;
    soldListings: number;
    activeListings: number;
    totalViews: number;
    totalLikes: number;
    avgViewsPerListing: number;
    totalRevenue: number;
    avgPrice: number;
    medianPrice: number;
  };
  trends: {
    topBrands: Array<{ brand: string; count: number; avgPrice: number }>;
    topSizes: Array<{ size: string; count: number }>;
    topColors: Array<{ color: string; count: number }>;
    priceDistribution: Array<{ range: string; count: number; percentage: number }>;
  };
}

// API Response Interfaces
export interface FashionListingResponse {
  success: boolean;
  data?: FashionListing;
  error?: string;
  metadata?: {
    timestamp: Date;
    version: string;
  };
}

export interface FashionListingsResponse {
  success: boolean;
  data?: PaginatedResponse<FashionListing>;
  error?: string;
  metadata?: {
    timestamp: Date;
    version: string;
    filters?: FashionListingFilters;
    sortBy?: FashionSortOption;
  };
}

export interface FashionSearchResponse {
  success: boolean;
  data?: {
    items: FashionListingWithMetadata[];
    total: number;
    suggestions?: string[];
    filters: {
      categories: Array<{ category: FashionCategory; count: number }>;
      brands: Array<{ brand: string; count: number }>;
      sizes: Array<{ size: string; count: number }>;
      colors: Array<{ color: string; count: number }>;
      priceRanges: Array<{ range: string; min: number; max: number; count: number }>;
    };
  };
  error?: string;
  metadata?: {
    timestamp: Date;
    query: string;
    executionTime: number;
    totalResults: number;
  };
}

// Error Interfaces
export interface FashionDomainError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export class FashionValidationError extends Error {
  constructor(
    public field: string,
    public code: string,
    message: string,
    public value?: any
  ) {
    super(message);
    this.name = 'FashionValidationError';
  }
}

export class FashionNotFoundError extends Error {
  constructor(
    public resource: string,
    public id: string
  ) {
    super(`${resource} with id ${id} not found`);
    this.name = 'FashionNotFoundError';
  }
}

export class FashionPermissionError extends Error {
  constructor(
    public action: string,
    public resource: string
  ) {
    super(`Permission denied for ${action} on ${resource}`);
    this.name = 'FashionPermissionError';
  }
}

// Utility Types
export type FashionListingField = keyof FashionListing;
export type FashionListingCreateField = keyof FashionListingCreate;
export type FashionListingUpdateField = keyof FashionListingUpdate;

// Type Guards
export function isFashionCategory(value: string): value is FashionCategory {
  return FASHION_CATEGORIES.includes(value as FashionCategory);
}

export function isProductCondition(value: string): value is ProductCondition {
  return CONDITION_OPTIONS.includes(value as ProductCondition);
}

export function isFashionListingStatus(value: string): value is FashionListingStatus {
  return FASHION_STATUS_OPTIONS.includes(value as FashionListingStatus);
}

export function isFashionSortOption(value: string): value is FashionSortOption {
  return FASHION_SORT_OPTIONS.includes(value as FashionSortOption);
}

// Validation Helpers
export function validateFashionCategory(category: string): FashionCategory {
  if (!isFashionCategory(category)) {
    throw new FashionValidationError('fashionCategory', 'INVALID_CATEGORY', 
      `Invalid fashion category: ${category}. Must be one of: ${FASHION_CATEGORIES.join(', ')}`);
  }
  return category;
}

export function validateProductCondition(condition: string): ProductCondition {
  if (!isProductCondition(condition)) {
    throw new FashionValidationError('condition', 'INVALID_CONDITION', 
      `Invalid condition: ${condition}. Must be one of: ${CONDITION_OPTIONS.join(', ')}`);
  }
  return condition;
}

export function validatePrice(price: number): number {
  if (typeof price !== 'number' || price < 0 || !isFinite(price)) {
    throw new FashionValidationError('price', 'INVALID_PRICE', 
      'Price must be a positive number');
  }
  if (price > 1000000) {
    throw new FashionValidationError('price', 'PRICE_TOO_HIGH', 
      'Price cannot exceed $1,000,000');
  }
  return price;
}

export function validateImages(images: string[]): string[] {
  if (!Array.isArray(images) || images.length === 0) {
    throw new FashionValidationError('images', 'NO_IMAGES', 
      'At least one image is required');
  }
  if (images.length > 10) {
    throw new FashionValidationError('images', 'TOO_MANY_IMAGES', 
      'Maximum 10 images allowed');
  }
  
  // Validate image URLs
  for (const [index, image] of images.entries()) {
    if (!image || typeof image !== 'string') {
      throw new FashionValidationError('images', 'INVALID_IMAGE_URL', 
        `Image at index ${index} is invalid`);
    }
    try {
      new URL(image);
    } catch {
      throw new FashionValidationError('images', 'INVALID_IMAGE_URL', 
        `Image at index ${index} is not a valid URL`);
    }
  }
  
  return images;
}

// Constants for Validation
export const VALIDATION_LIMITS = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 5000,
  BRAND_MAX_LENGTH: 100,
  SIZE_MAX_LENGTH: 50,
  COLOR_MAX_LENGTH: 50,
  MATERIAL_MAX_LENGTH: 100,
  LOCATION_MAX_LENGTH: 200,
  MAX_IMAGES: 10,
  MAX_TAGS: 20,
  MAX_STYLE_TAGS: 15,
  TAG_MAX_LENGTH: 50,
  MIN_PRICE: 0.01,
  MAX_PRICE: 1000000
} as const;

// Export all types for easier importing
export type {
  // Core interfaces
  FashionListing,
  FashionListingCreate,
  FashionListingUpdate,
  FashionListingFilters,
  FashionSearchQuery,
  PaginationOptions,
  PaginatedResponse,
  FashionListingWithMetadata,
  FashionCategoryAnalytics,
  
  // Response interfaces
  FashionListingResponse,
  FashionListingsResponse,
  FashionSearchResponse,
  
  // Error interfaces
  FashionDomainError,
  
  // Utility types
  FashionListingField,
  FashionListingCreateField,
  FashionListingUpdateField
};
