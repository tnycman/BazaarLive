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
];
// Fashion Category Labels for UI
export const FASHION_CATEGORY_LABELS = {
    women: "Women's Fashion",
    men: "Men's Fashion",
    kids: "Kids & Baby",
    home: "Home & Lifestyle",
    electronics: "Electronics & Tech",
    pets: "Pet Accessories",
    beauty: "Beauty & Wellness",
    sports: "Sports & Outdoors"
};
// Product Condition Constants and Types
export const CONDITION_OPTIONS = [
    'new_with_tags',
    'new_without_tags',
    'excellent',
    'good',
    'fair',
    'poor'
];
export const CONDITION_LABELS = {
    new_with_tags: "New with Tags",
    new_without_tags: "New without Tags",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    poor: "Poor"
};
export const CONDITION_DESCRIPTIONS = {
    new_with_tags: "Brand new item with original tags attached",
    new_without_tags: "Brand new item without tags, never worn",
    excellent: "Like new condition with minimal signs of wear",
    good: "Gently used with minor signs of wear",
    fair: "Used with noticeable signs of wear but functional",
    poor: "Heavily used with significant signs of wear"
};
// Fashion Status Constants and Types
export const FASHION_STATUS_OPTIONS = [
    'active',
    'sold',
    'pending',
    'draft',
    'archived'
];
export const STATUS_LABELS = {
    active: "Active",
    sold: "Sold",
    pending: "Pending Sale",
    draft: "Draft",
    archived: "Archived"
};
// Size System Types
export const SIZE_SYSTEMS = [
    'us',
    'uk',
    'eu',
    'international',
    'numeric',
    'freesize'
];
// Color Constants
export const FASHION_COLORS = [
    'black', 'white', 'gray', 'brown', 'beige', 'cream',
    'red', 'pink', 'orange', 'yellow', 'green', 'blue',
    'purple', 'navy', 'burgundy', 'gold', 'silver',
    'multicolor', 'other'
];
// Material Types
export const FASHION_MATERIALS = [
    'cotton', 'polyester', 'wool', 'silk', 'linen', 'denim',
    'leather', 'suede', 'cashmere', 'bamboo', 'modal',
    'spandex', 'nylon', 'acrylic', 'viscose', 'other'
];
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
];
export const SORT_LABELS = {
    relevance: "Most Relevant",
    price_low: "Price: Low to High",
    price_high: "Price: High to Low",
    newest: "Newest First",
    oldest: "Oldest First",
    popularity: "Most Popular",
    views: "Most Viewed",
    likes: "Most Liked",
    alphabetical: "A to Z"
};
export class FashionValidationError extends Error {
    field;
    code;
    value;
    constructor(field, code, message, value) {
        super(message);
        this.field = field;
        this.code = code;
        this.value = value;
        this.name = 'FashionValidationError';
    }
}
export class FashionNotFoundError extends Error {
    resource;
    id;
    constructor(resource, id) {
        super(`${resource} with id ${id} not found`);
        this.resource = resource;
        this.id = id;
        this.name = 'FashionNotFoundError';
    }
}
export class FashionPermissionError extends Error {
    action;
    resource;
    constructor(action, resource) {
        super(`Permission denied for ${action} on ${resource}`);
        this.action = action;
        this.resource = resource;
        this.name = 'FashionPermissionError';
    }
}
// Type Guards
export function isFashionCategory(value) {
    return FASHION_CATEGORIES.includes(value);
}
export function isProductCondition(value) {
    return CONDITION_OPTIONS.includes(value);
}
export function isFashionListingStatus(value) {
    return FASHION_STATUS_OPTIONS.includes(value);
}
export function isFashionSortOption(value) {
    return FASHION_SORT_OPTIONS.includes(value);
}
// Validation Helpers
export function validateFashionCategory(category) {
    if (!isFashionCategory(category)) {
        throw new FashionValidationError('fashionCategory', 'INVALID_CATEGORY', `Invalid fashion category: ${category}. Must be one of: ${FASHION_CATEGORIES.join(', ')}`);
    }
    return category;
}
export function validateProductCondition(condition) {
    if (!isProductCondition(condition)) {
        throw new FashionValidationError('condition', 'INVALID_CONDITION', `Invalid condition: ${condition}. Must be one of: ${CONDITION_OPTIONS.join(', ')}`);
    }
    return condition;
}
export function validatePrice(price) {
    if (typeof price !== 'number' || price < 0 || !isFinite(price)) {
        throw new FashionValidationError('price', 'INVALID_PRICE', 'Price must be a positive number');
    }
    if (price > 1000000) {
        throw new FashionValidationError('price', 'PRICE_TOO_HIGH', 'Price cannot exceed $1,000,000');
    }
    return price;
}
export function validateImages(images) {
    if (!Array.isArray(images) || images.length === 0) {
        throw new FashionValidationError('images', 'NO_IMAGES', 'At least one image is required');
    }
    if (images.length > 10) {
        throw new FashionValidationError('images', 'TOO_MANY_IMAGES', 'Maximum 10 images allowed');
    }
    // Validate image URLs
    for (const [index, image] of images.entries()) {
        if (!image || typeof image !== 'string') {
            throw new FashionValidationError('images', 'INVALID_IMAGE_URL', `Image at index ${index} is invalid`);
        }
        try {
            new URL(image);
        }
        catch {
            throw new FashionValidationError('images', 'INVALID_IMAGE_URL', `Image at index ${index} is not a valid URL`);
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
};
