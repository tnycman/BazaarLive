# Phase 2: Fix Drizzle ORM Schema Issues

## Issue 1: Index.unique() method not available

**Error**: `Property 'unique' does not exist on type 'IndexBuilder'`

**Location**: `shared/fashion-schema.ts:124`

**Fix**: Remove `.unique()` call and use unique constraint in column definition instead.

### Before:
```typescript
index("idx_fashion_likes_unique").on(table.userId, table.fashionListingId).unique(),
```

### After:
```typescript
index("idx_fashion_likes_unique").on(table.userId, table.fashionListingId),
```

And add unique constraint to the table definition:
```typescript
// In the table definition, add:
// unique constraint can be defined at table level
}, (table) => ({
  uniqueLike: unique("unique_fashion_like").on(table.userId, table.fashionListingId),
  // ... other indexes
}));
```

## Issue 2: Drizzle-Zod Integration Problems

**Error**: Zod schema types not matching Drizzle expectations

**Fix**: Update the Zod schema creation:

### In shared/fashion-schema.ts:
```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Fix the schema creation
export const insertFashionListingSchema = createInsertSchema(fashionListings, {
  // Override specific fields if needed
  title: z.string().min(1).max(255),
  price: z.number().positive(),
  // ... other overrides
});

export const selectFashionListingSchema = createSelectSchema(fashionListings);

// Use proper type inference
export type InsertFashionListing = typeof fashionListings.$inferInsert;
export type SelectFashionListing = typeof fashionListings.$inferSelect;
```

## Issue 3: Missing 'users' export

**Error**: `Module declares 'users' locally, but it is not exported`

**Fix**: Add proper exports in fashion-schema.ts:

```typescript
// At the end of shared/fashion-schema.ts
export { users, fashionListings, fashionLikes, fashionComments, fashionMessages, fashionTransactions };
```

