// Fashion Domain Validation Schemas - Enterprise-grade Zod validation
import { z } from "zod";
import { FASHION_CATEGORIES, CONDITION_OPTIONS, FASHION_STATUS_OPTIONS, FASHION_SORT_OPTIONS, FASHION_COLORS, FASHION_MATERIALS, SIZE_SYSTEMS, VALIDATION_LIMITS } from "../types/FashionDomain";
// Base validation schemas
const NonEmptyString = z.string().min(1, "Field cannot be empty").transform(s => s.trim());
const URL = z.string().url("Must be a valid URL");
const PositiveNumber = z.number().positive("Must be a positive number");
const NonNegativeNumber = z.number().min(0, "Must be non-negative");
// Fashion Category Schema
export const FashionCategorySchema = z.enum(FASHION_CATEGORIES, {
    errorMap: () => ({
        message: `Must be one of: ${FASHION_CATEGORIES.join(', ')}`
    })
});
// Product Condition Schema
export const ProductConditionSchema = z.enum(CONDITION_OPTIONS, {
    errorMap: () => ({
        message: `Must be one of: ${CONDITION_OPTIONS.join(', ')}`
    })
});
// Fashion Status Schema
export const FashionStatusSchema = z.enum(FASHION_STATUS_OPTIONS, {
    errorMap: () => ({
        message: `Must be one of: ${FASHION_STATUS_OPTIONS.join(', ')}`
    })
});
// Sort Option Schema
export const FashionSortSchema = z.enum(FASHION_SORT_OPTIONS, {
    errorMap: () => ({
        message: `Must be one of: ${FASHION_SORT_OPTIONS.join(', ')}`
    })
});
// Color Schema
export const FashionColorSchema = z.enum(FASHION_COLORS, {
    errorMap: () => ({
        message: `Must be one of: ${FASHION_COLORS.join(', ')}`
    })
});
// Material Schema
export const FashionMaterialSchema = z.enum(FASHION_MATERIALS, {
    errorMap: () => ({
        message: `Must be one of: ${FASHION_MATERIALS.join(', ')}`
    })
});
// Size System Schema
export const SizeSystemSchema = z.enum(SIZE_SYSTEMS, {
    errorMap: () => ({
        message: `Must be one of: ${SIZE_SYSTEMS.join(', ')}`
    })
});
// Size Info Schema
export const SizeInfoSchema = z.object({
    value: z.string()
        .min(1, "Size value is required")
        .max(VALIDATION_LIMITS.SIZE_MAX_LENGTH, `Size must be ${VALIDATION_LIMITS.SIZE_MAX_LENGTH} characters or less`),
    system: SizeSystemSchema,
    category: z.enum(['clothing', 'shoes', 'accessories', 'other'])
}).strict();
// Title Schema with comprehensive validation
export const TitleSchema = z.string()
    .min(VALIDATION_LIMITS.TITLE_MIN_LENGTH, `Title must be at least ${VALIDATION_LIMITS.TITLE_MIN_LENGTH} characters`)
    .max(VALIDATION_LIMITS.TITLE_MAX_LENGTH, `Title must be ${VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters or less`)
    .transform(s => s.trim())
    .refine(title => title.length > 0, "Title cannot be empty after trimming")
    .refine(title => !/^\s*$/.test(title), "Title cannot be only whitespace")
    .refine(title => !title.includes('<script'), "Title cannot contain script tags")
    .refine(title => title.split(' ').length >= 2, "Title should contain at least 2 words for better searchability");
// Description Schema
export const DescriptionSchema = z.string()
    .max(VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH, `Description must be ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters or less`)
    .transform(s => s.trim())
    .refine(desc => !desc.includes('<script'), "Description cannot contain script tags")
    .optional();
// Brand Schema
export const BrandSchema = z.string()
    .max(VALIDATION_LIMITS.BRAND_MAX_LENGTH, `Brand must be ${VALIDATION_LIMITS.BRAND_MAX_LENGTH} characters or less`)
    .transform(s => s.trim())
    .optional();
// Size Schema
export const SizeSchema = z.string()
    .max(VALIDATION_LIMITS.SIZE_MAX_LENGTH, `Size must be ${VALIDATION_LIMITS.SIZE_MAX_LENGTH} characters or less`)
    .transform(s => s.trim())
    .optional();
// Color Schema (string version for custom colors)
export const ColorStringSchema = z.string()
    .max(VALIDATION_LIMITS.COLOR_MAX_LENGTH, `Color must be ${VALIDATION_LIMITS.COLOR_MAX_LENGTH} characters or less`)
    .transform(s => s.trim())
    .optional();
// Material Schema (string version for custom materials)
export const MaterialStringSchema = z.string()
    .max(VALIDATION_LIMITS.MATERIAL_MAX_LENGTH, `Material must be ${VALIDATION_LIMITS.MATERIAL_MAX_LENGTH} characters or less`)
    .transform(s => s.trim())
    .optional();
// Price Schema with business rules
export const PriceSchema = z.number()
    .min(VALIDATION_LIMITS.MIN_PRICE, `Price must be at least $${VALIDATION_LIMITS.MIN_PRICE}`)
    .max(VALIDATION_LIMITS.MAX_PRICE, `Price cannot exceed $${VALIDATION_LIMITS.MAX_PRICE.toLocaleString()}`)
    .multipleOf(0.01, "Price must be in increments of $0.01")
    .finite("Price must be a finite number");
// Original Price Schema
export const OriginalPriceSchema = z.number()
    .min(VALIDATION_LIMITS.MIN_PRICE, `Original price must be at least $${VALIDATION_LIMITS.MIN_PRICE}`)
    .max(VALIDATION_LIMITS.MAX_PRICE, `Original price cannot exceed $${VALIDATION_LIMITS.MAX_PRICE.toLocaleString()}`)
    .multipleOf(0.01, "Original price must be in increments of $0.01")
    .finite("Original price must be a finite number")
    .optional();
// Images Schema with comprehensive validation
export const ImagesSchema = z.array(z.string().url("Each image must be a valid URL"))
    .min(1, "At least one image is required")
    .max(VALIDATION_LIMITS.MAX_IMAGES, `Maximum ${VALIDATION_LIMITS.MAX_IMAGES} images allowed`)
    .refine(images => images.every(img => img.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)), "All images must be valid image URLs (jpg, jpeg, png, webp, gif)")
    .refine(images => new Set(images).size === images.length, "Duplicate image URLs are not allowed");
// Tags Schema
export const TagsSchema = z.array(z.string()
    .min(1, "Tag cannot be empty")
    .max(VALIDATION_LIMITS.TAG_MAX_LENGTH, `Tag must be ${VALIDATION_LIMITS.TAG_MAX_LENGTH} characters or less`)
    .transform(s => s.trim().toLowerCase())
    .refine(tag => !/^\s*$/.test(tag), "Tag cannot be only whitespace"))
    .max(VALIDATION_LIMITS.MAX_TAGS, `Maximum ${VALIDATION_LIMITS.MAX_TAGS} tags allowed`)
    .optional()
    .transform(tags => tags ? Array.from(new Set(tags)) : undefined); // Remove duplicates
// Style Tags Schema
export const StyleTagsSchema = z.array(z.string()
    .min(1, "Style tag cannot be empty")
    .max(VALIDATION_LIMITS.TAG_MAX_LENGTH, `Style tag must be ${VALIDATION_LIMITS.TAG_MAX_LENGTH} characters or less`)
    .transform(s => s.trim().toLowerCase()))
    .max(VALIDATION_LIMITS.MAX_STYLE_TAGS, `Maximum ${VALIDATION_LIMITS.MAX_STYLE_TAGS} style tags allowed`)
    .optional()
    .transform(tags => tags ? Array.from(new Set(tags)) : undefined); // Remove duplicates
// Location Schema
export const LocationSchema = z.string()
    .max(VALIDATION_LIMITS.LOCATION_MAX_LENGTH, `Location must be ${VALIDATION_LIMITS.LOCATION_MAX_LENGTH} characters or less`)
    .transform(s => s.trim())
    .optional();
// Subcategory Schema with category-specific validation
export const SubcategorySchema = z.string()
    .min(1, "Subcategory cannot be empty")
    .max(100, "Subcategory must be 100 characters or less")
    .transform(s => s.trim())
    .optional();
// Currency Schema
export const CurrencySchema = z.string()
    .length(3, "Currency must be a 3-letter ISO code")
    .transform(s => s.toUpperCase())
    .refine(currency => ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(currency), "Currency must be one of: USD, EUR, GBP, CAD, AUD")
    .default('USD');
// Fashion Listing Create Schema
export const FashionListingCreateSchema = z.object({
    title: TitleSchema,
    description: DescriptionSchema,
    fashionCategory: FashionCategorySchema,
    subcategory: SubcategorySchema,
    subSubcategory: SubcategorySchema,
    brand: BrandSchema,
    size: SizeSchema,
    sizeInfo: SizeInfoSchema.optional(),
    color: ColorStringSchema,
    colors: z.array(z.string().min(1).max(50)).max(5, "Maximum 5 colors allowed").optional(),
    material: MaterialStringSchema,
    materials: z.array(z.string().min(1).max(100)).max(5, "Maximum 5 materials allowed").optional(),
    styleTags: StyleTagsSchema,
    condition: ProductConditionSchema,
    price: PriceSchema,
    originalPrice: OriginalPriceSchema,
    currency: CurrencySchema,
    images: ImagesSchema,
    tags: TagsSchema,
    location: LocationSchema,
    isPriceNegotiable: z.boolean().optional().default(false),
    isShippingIncluded: z.boolean().optional().default(false)
})
    .strict()
    .refine(data => !data.originalPrice || data.originalPrice >= data.price, {
    message: "Original price must be greater than or equal to current price",
    path: ["originalPrice"]
})
    .refine(data => {
    // Category-specific validation
    if (data.fashionCategory === 'electronics' && !data.brand) {
        return false;
    }
    return true;
}, {
    message: "Brand is required for electronics items",
    path: ["brand"]
});
// Fashion Listing Update Schema
export const FashionListingUpdateSchema = FashionListingCreateSchema
    .omit({ fashionCategory: true }) // Cannot change category
    .partial()
    .strict()
    .refine(data => {
    if (data.originalPrice !== undefined && data.price !== undefined) {
        return data.originalPrice >= data.price;
    }
    return true;
}, {
    message: "Original price must be greater than or equal to current price",
    path: ["originalPrice"]
});
// Fashion Listing Response Schema
export const FashionListingSchema = z.object({
    id: z.string().uuid("Invalid listing ID format"),
    sellerId: z.string().uuid("Invalid seller ID format"),
    title: z.string(),
    description: z.string().optional(),
    fashionCategory: FashionCategorySchema,
    subcategory: z.string().optional(),
    subSubcategory: z.string().optional(),
    brand: z.string().optional(),
    size: z.string().optional(),
    sizeInfo: SizeInfoSchema.optional(),
    color: z.string().optional(),
    colors: z.array(z.string()).optional(),
    material: z.string().optional(),
    materials: z.array(z.string()).optional(),
    styleTags: z.array(z.string()).optional(),
    condition: ProductConditionSchema,
    price: z.number(),
    originalPrice: z.number().optional(),
    currency: z.string(),
    images: z.array(z.string()),
    tags: z.array(z.string()).optional(),
    status: FashionStatusSchema,
    viewsCount: NonNegativeNumber,
    likesCount: NonNegativeNumber,
    sharesCount: NonNegativeNumber,
    commentsCount: NonNegativeNumber,
    location: z.string().optional(),
    isPromoted: z.boolean(),
    isPriceNegotiable: z.boolean().optional(),
    isShippingIncluded: z.boolean().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
}).strict();
// Price Range Schema
export const PriceRangeSchema = z.object({
    min: NonNegativeNumber.max(VALIDATION_LIMITS.MAX_PRICE),
    max: PositiveNumber.max(VALIDATION_LIMITS.MAX_PRICE)
}).refine(data => data.max >= data.min, {
    message: "Maximum price must be greater than or equal to minimum price",
    path: ["max"]
});
// Date Range Schema
export const DateRangeSchema = z.object({
    start: z.date(),
    end: z.date()
}).refine(data => data.end >= data.start, {
    message: "End date must be greater than or equal to start date",
    path: ["end"]
});
// Fashion Filters Schema
export const FashionFiltersSchema = z.object({
    fashionCategory: FashionCategorySchema.optional(),
    subcategory: z.string().optional(),
    subcategories: z.array(z.string()).max(10, "Maximum 10 subcategories").optional(),
    brand: z.string().optional(),
    brands: z.array(z.string()).max(20, "Maximum 20 brands").optional(),
    size: z.string().optional(),
    sizes: z.array(z.string()).max(15, "Maximum 15 sizes").optional(),
    color: z.string().optional(),
    colors: z.array(z.string()).max(10, "Maximum 10 colors").optional(),
    material: z.string().optional(),
    materials: z.array(z.string()).max(10, "Maximum 10 materials").optional(),
    condition: ProductConditionSchema.optional(),
    conditions: z.array(ProductConditionSchema).max(6, "Maximum 6 conditions").optional(),
    priceRange: PriceRangeSchema.optional(),
    styleTags: z.array(z.string()).max(10, "Maximum 10 style tags").optional(),
    location: z.string().optional(),
    isPromoted: z.boolean().optional(),
    isPriceNegotiable: z.boolean().optional(),
    isShippingIncluded: z.boolean().optional(),
    status: FashionStatusSchema.optional(),
    sellerId: z.string().uuid().optional(),
    dateRange: DateRangeSchema.optional()
}).strict();
// Pagination Schema
export const PaginationSchema = z.object({
    page: z.number().int().min(1, "Page must be at least 1").default(1),
    limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(20),
    offset: z.number().int().min(0, "Offset must be non-negative").default(0)
}).strict();
// Fashion Search Query Schema
export const FashionSearchQuerySchema = z.object({
    text: z.string().max(500, "Search text must be 500 characters or less").optional(),
    filters: FashionFiltersSchema.optional(),
    sortBy: FashionSortSchema.optional().default('relevance'),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
    includeMetadata: z.boolean().default(false)
}).strict()
    .refine(data => data.text || data.filters, {
    message: "Either search text or filters must be provided",
    path: ["text"]
});
// API Response Schemas
export const FashionListingResponseSchema = z.object({
    success: z.boolean(),
    data: FashionListingSchema.optional(),
    error: z.string().optional(),
    metadata: z.object({
        timestamp: z.date(),
        version: z.string()
    }).optional()
}).strict();
export const PaginatedFashionListingsSchema = z.object({
    items: z.array(FashionListingSchema),
    total: NonNegativeNumber,
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    totalPages: z.number().int().min(0),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean()
}).strict();
export const FashionListingsResponseSchema = z.object({
    success: z.boolean(),
    data: PaginatedFashionListingsSchema.optional(),
    error: z.string().optional(),
    metadata: z.object({
        timestamp: z.date(),
        version: z.string(),
        filters: FashionFiltersSchema.optional(),
        sortBy: FashionSortSchema.optional()
    }).optional()
}).strict();
// Validation Error Schema
export const ValidationErrorSchema = z.object({
    field: z.string(),
    code: z.string(),
    message: z.string(),
    value: z.any().optional()
}).strict();
// Bulk validation schema for batch operations
export const BulkFashionListingCreateSchema = z.array(FashionListingCreateSchema)
    .min(1, "At least one listing required")
    .max(50, "Maximum 50 listings per batch");
// Fashion listing status update schema
export const FashionListingStatusUpdateSchema = z.object({
    status: FashionStatusSchema,
    reason: z.string().max(500, "Reason must be 500 characters or less").optional()
}).strict();
// Price update schema
export const FashionListingPriceUpdateSchema = z.object({
    price: PriceSchema,
    originalPrice: OriginalPriceSchema,
    reason: z.string().max(200, "Reason must be 200 characters or less").optional()
}).strict()
    .refine(data => !data.originalPrice || data.originalPrice >= data.price, {
    message: "Original price must be greater than or equal to current price",
    path: ["originalPrice"]
});
