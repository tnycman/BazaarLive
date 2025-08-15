# Phase 3: Fix Fashion Domain Type Conflicts

## Issue 1: Duplicate Type Exports

**Error**: `Export declaration conflicts with exported declaration`

**Problem**: The `shared/types/FashionDomain.ts` file is declaring types that are already exported elsewhere, causing conflicts.

**Fix**: Remove the duplicate export type block and use proper re-exports:

### In shared/types/FashionDomain.ts:

**Remove this conflicting block (lines 543-567):**
```typescript
// Export all types for easier importing
export type {
  // Core interfaces
  FashionListing,           // ❌ REMOVE - conflicts with existing
  FashionListingCreate,     // ❌ REMOVE - conflicts with existing
  FashionListingUpdate,     // ❌ REMOVE - conflicts with existing
  // ... rest of the duplicate exports
};
```

**Replace with proper interface definitions:**
```typescript
// Define unique interfaces that don't conflict
export interface FashionDomainTypes {
  FashionListing: FashionListing;
  FashionListingCreate: FashionListingCreate;
  FashionListingUpdate: FashionListingUpdate;
  FashionListingFilters: FashionListingFilters;
  FashionSearchQuery: FashionSearchQuery;
  PaginationOptions: PaginationOptions;
  PaginatedResponse: PaginatedResponse;
  FashionListingWithMetadata: FashionListingWithMetadata;
  FashionCategoryAnalytics: FashionCategoryAnalytics;
  FashionListingResponse: FashionListingResponse;
  FashionListingsResponse: FashionListingsResponse;
  FashionSearchResponse: FashionSearchResponse;
  FashionDomainError: FashionDomainError;
  FashionListingField: FashionListingField;
  FashionListingCreateField: FashionListingCreateField;
  FashionListingUpdateField: FashionListingUpdateField;
}

// Export the namespace instead
export namespace FashionDomain {
  export type Listing = FashionListing;
  export type ListingCreate = FashionListingCreate;
  export type ListingUpdate = FashionListingUpdate;
  export type ListingFilters = FashionListingFilters;
  export type SearchQuery = FashionSearchQuery;
  export type Pagination = PaginationOptions;
  export type PaginatedResponse = PaginatedResponse<any>;
  export type ListingWithMetadata = FashionListingWithMetadata;
  export type CategoryAnalytics = FashionCategoryAnalytics;
  export type ListingResponse = FashionListingResponse;
  export type ListingsResponse = FashionListingsResponse;
  export type SearchResponse = FashionSearchResponse;
  export type DomainError = FashionDomainError;
  export type ListingField = FashionListingField;
  export type ListingCreateField = FashionListingCreateField;
  export type ListingUpdateField = FashionListingUpdateField;
}
```

## Issue 2: Iterator Downlevel Compilation

**Error**: `Type 'ArrayIterator<[number, string]>' can only be iterated through when using the '--downlevelIteration' flag`

**Fix Option 1**: Update tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2015", // or higher
    "downlevelIteration": true
  }
}
```

**Fix Option 2**: Rewrite the problematic code (line 508):
### Before:
```typescript
for (const [index, image] of images.entries()) {
```

### After:
```typescript
for (let index = 0; index < images.length; index++) {
  const image = images[index];
```

## Issue 3: Fashion Category Values

**Error**: Type '"unisex"' and '"accessories"' not assignable to fashion category enum

**Fix**: Update the FashionCategory enum to include missing values:

### In shared/types/FashionDomain.ts:
```typescript
export const FashionCategory = {
  home: "home",
  electronics: "electronics", 
  women: "women",
  men: "men",
  kids: "kids",
  pets: "pets",
  beauty: "beauty",
  sports: "sports",
  unisex: "unisex",        // ✅ ADD
  accessories: "accessories" // ✅ ADD
} as const;

export type FashionCategory = typeof FashionCategory[keyof typeof FashionCategory];
```

