# Phase 6: Fix Type Mismatches in Services

## Issue 1: Drizzle Query Builder Issues

**Error**: `Property 'orderBy' is missing in type` (FashionListingService.ts)

**Problem**: Drizzle query builder losing methods after filtering operations.

### Fix: Proper Query Building Pattern

**In `server/services/FashionListingService.ts`:**
```typescript
// ❌ PROBLEMATIC - losing query methods
let query = db.select().from(fashionListings);
if (filters.condition) {
  query = query.where(eq(fashionListings.condition, filters.condition));
}
query = query.orderBy(desc(fashionListings.createdAt)); // Error here

// ✅ FIXED - use query builder properly
const baseQuery = db.select().from(fashionListings);

// Build where conditions array
const whereConditions = [];
if (filters.condition) {
  whereConditions.push(eq(fashionListings.condition, filters.condition));
}
if (filters.fashionCategory) {
  whereConditions.push(eq(fashionListings.fashionCategory, filters.fashionCategory));
}

// Apply all conditions at once
let query = baseQuery;
if (whereConditions.length > 0) {
  query = query.where(and(...whereConditions));
}

// Now apply ordering
switch (sortBy) {
  case 'price_low':
    query = query.orderBy(asc(fashionListings.price));
    break;
  case 'price_high': 
    query = query.orderBy(desc(fashionListings.price));
    break;
  case 'most_liked':
    query = query.orderBy(desc(fashionListings.likesCount));
    break;
  case 'most_viewed':
    query = query.orderBy(desc(fashionListings.viewsCount));
    break;
  default: // 'newest'
    query = query.orderBy(desc(fashionListings.createdAt));
}
```

## Issue 2: Error Handling Type Issues

**Error**: `'error' is of type 'unknown'`

**Fix**: Proper error type handling throughout services:

### Universal Error Handler Function
**Create `server/utils/errorHandling.ts`:**
```typescript
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

export function handleServiceError(error: unknown, context: string): never {
  const message = getErrorMessage(error);
  throw new Error(`${context}: ${message}`);
}
```

### Apply to all services:
```typescript
import { getErrorMessage } from '../utils/errorHandling';

// In FashionListingService.ts, ImageProcessingService.ts, etc.:
try {
  // ... service logic
} catch (error) {
  this.logger.warn('Failed to update seller metrics', { 
    sellerId, 
    action, 
    error: getErrorMessage(error) // ✅ Fixed
  });
}
```

## Issue 3: Database Schema Mismatches

**Error**: Missing properties like `titleEmbedding`, `descriptionEmbedding`, `combinedEmbedding`

### Fix Option 1: Update Database Schema
**Add missing columns to your database:**
```sql
ALTER TABLE listings 
ADD COLUMN title_embedding vector(1536),
ADD COLUMN description_embedding vector(1536),
ADD COLUMN combined_embedding vector(1536);
```

### Fix Option 2: Update Type Definitions  
**In your storage.ts, fix the return types:**
```typescript
// If embeddings aren't actually stored, update the interface
interface ListingResponse {
  title: string;
  brand: string | null;
  category: string;
  // ... other fields
  // Remove these if not actually in DB:
  // titleEmbedding?: number[];
  // descriptionEmbedding?: number[];  
  // combinedEmbedding?: number[];
}

// Or provide default values:
return await db
  .select({
    ...listingFields,
    titleEmbedding: sql<number[] | null>`NULL`,
    descriptionEmbedding: sql<number[] | null>`NULL`, 
    combinedEmbedding: sql<number[] | null>`NULL`
  })
  .from(listings)
  .where(/* conditions */);
```

## Issue 4: Date vs String Type Issues

**Error**: `Type 'Date' is not comparable to type 'string'`

**Fix**: Consistent date handling:
```typescript
// In ListingAggregationService.ts
interface ListingLike {
  // ... other fields
  createdAt: string; // Use consistent string format
}

// Convert dates to strings when needed:
return listings.map(listing => ({
  ...listing,
  createdAt: listing.createdAt instanceof Date 
    ? listing.createdAt.toISOString() 
    : listing.createdAt
}));
```

## Issue 5: Read-only Property Issues

**Error**: `Cannot assign to 'totalResolutions' because it is a read-only property`

**Fix**: Make statistics mutable:
```typescript
// In StrategyResolverService.ts
interface Statistics {
  totalResolutions: number;        // Remove readonly
  successfulResolutions: number;   // Remove readonly
  failedResolutions: number;       // Remove readonly
  averageResolutionTime: number;   // Remove readonly
  cacheHitRate: number;           // Remove readonly
}

// Or use a different pattern:
private statistics = {
  totalResolutions: 0,
  successfulResolutions: 0,
  failedResolutions: 0,
  averageResolutionTime: 0,
  cacheHitRate: 0
} as const satisfies Statistics;

// Update method:
private updateStatistics(): void {
  this.statistics = {
    ...this.statistics,
    totalResolutions: this.statistics.totalResolutions + 1
  };
}
```

