# Enterprise Solution: Fashion-Marketplace Domain Separation

## 🎯 **Executive Summary**

This document outlines the enterprise-grade architectural solution to properly separate the Fashion marketplace domain from future multi-vertical marketplace domains, following Domain-Driven Design (DDD) principles and ensuring complete bounded context isolation.

## 📊 **Domain Analysis**

### **Current State Issues**
1. **Schema Pollution**: Database enum includes non-fashion categories
2. **Domain Confusion**: Fashion subcategories mixed with marketplace verticals
3. **Type Safety Violations**: Invalid categories in listing creation
4. **Business Logic Inconsistency**: Different domains sharing same data model

### **Target Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    BAZAARLIVE PLATFORM                     │
├─────────────────────────────────────────────────────────────┤
│  FASHION MARKETPLACE DOMAIN (Active)                       │
│  ├── Women's Fashion                                        │
│  ├── Men's Fashion                                          │
│  ├── Kids' Fashion                                          │
│  ├── Home & Lifestyle                                       │
│  ├── Electronics & Tech                                     │
│  ├── Pet Accessories                                        │
│  ├── Beauty & Wellness                                      │
│  └── Sports & Outdoors                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MULTI-VERTICAL MARKETPLACE DOMAINS (Future)               │
│  ├── Jobs & Employment                                      │
│  ├── Real Estate                                            │
│  ├── Automotive                                             │
│  ├── Marine & Boats                                         │
│  └── Professional Services                                  │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ **Solution Architecture**

### **Phase 1: Fashion Domain Isolation**

#### **1.1 Database Schema Restructuring**

```sql
-- NEW: Fashion-specific schema
CREATE TYPE fashion_category_enum AS ENUM (
  'women',
  'men', 
  'kids',
  'home',
  'electronics',
  'pets',
  'beauty',
  'sports'
);

-- UPDATED: Listings table for fashion domain
CREATE TABLE fashion_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Fashion-specific categorization
  fashion_category fashion_category_enum NOT NULL,
  subcategory VARCHAR(100),
  sub_subcategory VARCHAR(100),
  
  -- Fashion-specific attributes
  brand VARCHAR(100),
  size VARCHAR(50),
  color VARCHAR(50),
  material VARCHAR(100),
  style_tags TEXT[],
  
  -- Common marketplace fields
  condition condition_enum NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  images TEXT[] NOT NULL,
  tags TEXT[],
  status status_enum DEFAULT 'active',
  
  -- Engagement metrics
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Metadata
  location VARCHAR(200),
  is_promoted BOOLEAN DEFAULT FALSE,
  
  -- AI/Search vectors
  title_embedding VECTOR(1536),
  description_embedding VECTOR(1536),
  combined_embedding VECTOR(1536),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_fashion_category CHECK (fashion_category IN ('women', 'men', 'kids', 'home', 'electronics', 'pets', 'beauty', 'sports'))
);

-- Migration strategy for existing data
CREATE TABLE legacy_listings_backup AS SELECT * FROM listings WHERE category = 'fashion';

-- Indexes for performance
CREATE INDEX idx_fashion_listings_category ON fashion_listings(fashion_category);
CREATE INDEX idx_fashion_listings_seller ON fashion_listings(seller_id);
CREATE INDEX idx_fashion_listings_status ON fashion_listings(status);
CREATE INDEX idx_fashion_listings_price ON fashion_listings(price);
CREATE INDEX idx_fashion_listings_created ON fashion_listings(created_at);
CREATE INDEX idx_fashion_listings_embedding ON fashion_listings USING ivfflat(combined_embedding vector_cosine_ops);

-- Future marketplace verticals (separate schemas)
CREATE SCHEMA IF NOT EXISTS jobs_marketplace;
CREATE SCHEMA IF NOT EXISTS real_estate_marketplace;
CREATE SCHEMA IF NOT EXISTS automotive_marketplace;
CREATE SCHEMA IF NOT EXISTS marine_marketplace;
CREATE SCHEMA IF NOT EXISTS services_marketplace;
```

#### **1.2 TypeScript Type System Restructuring**

```typescript
// shared/types/FashionDomain.ts
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

export interface FashionListing {
  id: string;
  sellerId: string;
  title: string;
  description?: string;
  
  // Fashion-specific taxonomy
  fashionCategory: FashionCategory;
  subcategory?: string;
  subSubcategory?: string;
  
  // Fashion-specific attributes
  brand?: string;
  size?: string;
  color?: string;
  material?: string;
  styleTags?: string[];
  
  // Common marketplace fields
  condition: ProductCondition;
  price: number;
  originalPrice?: number;
  images: string[];
  tags?: string[];
  status: ListingStatus;
  location?: string;
  isPromoted: boolean;
  
  // Engagement metrics
  viewsCount: number;
  likesCount: number;
  sharesCount: number;
  commentsCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface FashionListingCreate {
  title: string;
  description?: string;
  fashionCategory: FashionCategory;
  subcategory?: string;
  subSubcategory?: string;
  brand?: string;
  size?: string;
  color?: string;
  material?: string;
  styleTags?: string[];
  condition: ProductCondition;
  price: number;
  originalPrice?: number;
  images: string[];
  tags?: string[];
  location?: string;
}

// Validation schemas
export const FashionListingCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  fashionCategory: z.enum(FASHION_CATEGORIES),
  subcategory: z.string().max(100).optional(),
  subSubcategory: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  material: z.string().max(100).optional(),
  styleTags: z.array(z.string()).max(20).optional(),
  condition: z.enum(['new_with_tags', 'new_without_tags', 'excellent', 'good', 'fair', 'poor']),
  price: z.number().min(0.01).max(99999.99),
  originalPrice: z.number().min(0.01).max(99999.99).optional(),
  images: z.array(z.string().url()).min(1).max(10),
  tags: z.array(z.string()).max(50).optional(),
  location: z.string().max(200).optional()
});
```

#### **1.3 Frontend Component Architecture**

```typescript
// client/src/components/fashion/FashionListingForm.tsx
interface FashionListingFormProps {
  initialValues?: Partial<FashionListingCreate>;
  onSubmit: (data: FashionListingCreate) => Promise<void>;
  mode: 'create' | 'edit';
}

export function FashionListingForm({ initialValues, onSubmit, mode }: FashionListingFormProps) {
  const form = useForm<FashionListingCreate>({
    resolver: zodResolver(FashionListingCreateSchema),
    defaultValues: {
      fashionCategory: 'women',
      condition: 'good',
      images: [],
      tags: [],
      styleTags: [],
      ...initialValues
    }
  });

  const selectedCategory = form.watch('fashionCategory');
  
  // Dynamic subcategory options based on category
  const subcategoryOptions = useMemo(() => {
    return FASHION_SUBCATEGORY_CONFIG[selectedCategory] || [];
  }, [selectedCategory]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Fashion Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Fashion Category</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="fashionCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fashion category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FASHION_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {FASHION_CATEGORY_LABELS[category]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Dynamic Subcategory */}
            {subcategoryOptions.length > 0 && (
              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategoryOptions.map((subcategory) => (
                          <SelectItem key={subcategory.value} value={subcategory.value}>
                            {subcategory.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Fashion-Specific Fields */}
        <FashionAttributesSection 
          category={selectedCategory}
          form={form}
        />
        
        {/* Common Fields */}
        <CommonListingFields form={form} />
        
        <Button type="submit" className="w-full">
          {mode === 'create' ? 'Create Fashion Listing' : 'Update Listing'}
        </Button>
      </form>
    </Form>
  );
}
```

#### **1.4 Backend Service Layer**

```typescript
// server/services/FashionListingService.ts
export class FashionListingService {
  constructor(
    private database: Database,
    private vectorService: VectorSearchService,
    private imageService: ImageProcessingService
  ) {}

  async createFashionListing(
    sellerId: string,
    listingData: FashionListingCreate
  ): Promise<FashionListing> {
    // Validate fashion category
    if (!FASHION_CATEGORIES.includes(listingData.fashionCategory)) {
      throw new ValidationError('Invalid fashion category');
    }

    // Validate subcategory against category
    if (listingData.subcategory) {
      const validSubcategories = FASHION_SUBCATEGORY_CONFIG[listingData.fashionCategory];
      if (!validSubcategories?.some(sub => sub.value === listingData.subcategory)) {
        throw new ValidationError('Invalid subcategory for this fashion category');
      }
    }

    // Generate embeddings for AI search
    const embeddings = await this.vectorService.generateEmbeddings({
      title: listingData.title,
      description: listingData.description,
      category: listingData.fashionCategory,
      brand: listingData.brand,
      tags: [...(listingData.tags || []), ...(listingData.styleTags || [])]
    });

    // Create listing
    const [listing] = await this.database
      .insert(fashionListings)
      .values({
        sellerId,
        ...listingData,
        titleEmbedding: embeddings.title,
        descriptionEmbedding: embeddings.description,
        combinedEmbedding: embeddings.combined,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Update seller metrics
    await this.updateSellerMetrics(sellerId);

    return listing;
  }

  async getFashionListings(
    filters: FashionListingFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResponse<FashionListing>> {
    let query = this.database
      .select()
      .from(fashionListings)
      .where(eq(fashionListings.status, 'active'));

    // Apply fashion-specific filters
    if (filters.fashionCategory) {
      query = query.where(eq(fashionListings.fashionCategory, filters.fashionCategory));
    }

    if (filters.subcategory) {
      query = query.where(eq(fashionListings.subcategory, filters.subcategory));
    }

    if (filters.brand) {
      query = query.where(ilike(fashionListings.brand, `%${filters.brand}%`));
    }

    if (filters.priceRange) {
      query = query.where(
        and(
          gte(fashionListings.price, filters.priceRange.min),
          lte(fashionListings.price, filters.priceRange.max)
        )
      );
    }

    // Apply pagination
    const total = await this.database
      .select({ count: count() })
      .from(fashionListings)
      .where(eq(fashionListings.status, 'active'));

    const items = await query
      .limit(pagination.limit)
      .offset(pagination.offset)
      .orderBy(desc(fashionListings.createdAt));

    return {
      items,
      total: total[0].count,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total[0].count / pagination.limit)
    };
  }
}
```

### **Phase 2: API Layer Reconstruction**

#### **2.1 Fashion-Specific Endpoints**

```typescript
// server/routes/fashion.ts
export function registerFashionRoutes(app: Express) {
  const fashionService = new FashionListingService(database, vectorService, imageService);

  // Create fashion listing
  app.post('/api/fashion/listings', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const sellerId = req.user.claims.sub;
      const listingData = FashionListingCreateSchema.parse(req.body);
      
      const listing = await fashionService.createFashionListing(sellerId, listingData);
      
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid listing data', 
          errors: error.errors 
        });
      }
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error creating fashion listing:', error);
      res.status(500).json({ message: 'Failed to create listing' });
    }
  });

  // Get fashion listings with filters
  app.get('/api/fashion/listings', async (req, res) => {
    try {
      const filters = FashionListingFiltersSchema.parse(req.query);
      const pagination = PaginationSchema.parse(req.query);
      
      const result = await fashionService.getFashionListings(filters, pagination);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching fashion listings:', error);
      res.status(500).json({ message: 'Failed to fetch listings' });
    }
  });

  // Get fashion categories metadata
  app.get('/api/fashion/categories', async (req, res) => {
    res.json({
      categories: FASHION_CATEGORIES.map(category => ({
        value: category,
        label: FASHION_CATEGORY_LABELS[category],
        subcategories: FASHION_SUBCATEGORY_CONFIG[category] || []
      }))
    });
  });

  // Fashion-specific search with AI
  app.get('/api/fashion/search', async (req, res) => {
    try {
      const { query, category, limit = 20 } = req.query;
      
      const results = await fashionService.searchFashionListings({
        query: query as string,
        category: category as FashionCategory,
        limit: parseInt(limit as string)
      });
      
      res.json(results);
    } catch (error) {
      console.error('Error searching fashion listings:', error);
      res.status(500).json({ message: 'Search failed' });
    }
  });
}
```

#### **2.2 Migration Strategy**

```typescript
// server/migrations/migrate-to-fashion-domain.ts
export async function migrateFashionDomain(database: Database) {
  console.log('Starting fashion domain migration...');
  
  try {
    // 1. Create new fashion_listings table
    await database.execute(`
      CREATE TYPE fashion_category_enum AS ENUM (
        'women', 'men', 'kids', 'home', 'electronics', 'pets', 'beauty', 'sports'
      );
    `);
    
    // 2. Create fashion_listings table with new schema
    await database.execute(fashionListingsTableSQL);
    
    // 3. Migrate existing fashion listings
    const existingFashionListings = await database
      .select()
      .from(listings)
      .where(eq(listings.category, 'fashion'));
    
    console.log(`Migrating ${existingFashionListings.length} fashion listings...`);
    
    for (const listing of existingFashionListings) {
      const fashionCategory = mapLegacySubcategoryToFashionCategory(listing.subcategory);
      
      if (fashionCategory) {
        await database.insert(fashionListings).values({
          id: listing.id,
          sellerId: listing.sellerId,
          title: listing.title,
          description: listing.description,
          fashionCategory,
          subcategory: listing.subcategory,
          brand: listing.brand,
          size: listing.size,
          color: listing.color,
          condition: listing.condition,
          price: listing.price,
          originalPrice: listing.originalPrice,
          images: listing.images,
          tags: listing.tags,
          status: listing.status,
          isPromoted: listing.isPromoted,
          viewsCount: listing.viewsCount,
          likesCount: listing.likesCount,
          sharesCount: listing.sharesCount,
          commentsCount: listing.commentsCount,
          location: listing.location,
          titleEmbedding: listing.titleEmbedding,
          descriptionEmbedding: listing.descriptionEmbedding,
          combinedEmbedding: listing.combinedEmbedding,
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt
        });
      }
    }
    
    // 4. Backup and clean legacy data
    await database.execute(`
      CREATE TABLE legacy_listings_backup AS 
      SELECT * FROM listings WHERE category = 'fashion';
    `);
    
    await database
      .delete(listings)
      .where(eq(listings.category, 'fashion'));
    
    console.log('Fashion domain migration completed successfully');
    
  } catch (error) {
    console.error('Fashion domain migration failed:', error);
    throw error;
  }
}

function mapLegacySubcategoryToFashionCategory(subcategory?: string): FashionCategory | null {
  const mapping: Record<string, FashionCategory> = {
    'women': 'women',
    'men': 'men',
    'kids': 'kids',
    'home': 'home',
    'electronics': 'electronics',
    'pets': 'pets',
    'beauty': 'beauty',
    'sports': 'sports'
  };
  
  return subcategory ? mapping[subcategory.toLowerCase()] || null : null;
}
```

### **Phase 3: Future Marketplace Verticals Architecture**

#### **3.1 Bounded Context Separation**

```typescript
// Future vertical domains (separate microservices/modules)

// jobs-marketplace/types/JobListing.ts
export interface JobListing {
  id: string;
  employerId: string;
  title: string;
  description: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'freelance';
  location: JobLocation;
  salary: SalaryRange;
  requirements: string[];
  benefits: string[];
  applicationDeadline?: Date;
  createdAt: Date;
}

// real-estate-marketplace/types/PropertyListing.ts
export interface PropertyListing {
  id: string;
  agentId: string;
  title: string;
  description: string;
  propertyType: 'house' | 'apartment' | 'condo' | 'land';
  price: number;
  address: PropertyAddress;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  features: string[];
  images: string[];
  createdAt: Date;
}

// automotive-marketplace/types/VehicleListing.ts
export interface VehicleListing {
  id: string;
  sellerId: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  condition: VehicleCondition;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  features: string[];
  images: string[];
  createdAt: Date;
}
```

#### **3.2 Domain Registry Pattern**

```typescript
// shared/domains/DomainRegistry.ts
export interface Domain {
  name: string;
  version: string;
  endpoints: DomainEndpoints;
  schemas: DomainSchemas;
  permissions: DomainPermissions;
}

export const DOMAIN_REGISTRY: Record<string, Domain> = {
  fashion: {
    name: 'Fashion Marketplace',
    version: '1.0.0',
    endpoints: {
      listings: '/api/fashion/listings',
      categories: '/api/fashion/categories',
      search: '/api/fashion/search'
    },
    schemas: {
      listing: FashionListingSchema,
      categories: FashionCategoriesSchema
    },
    permissions: {
      create: 'fashion:listing:create',
      read: 'fashion:listing:read',
      update: 'fashion:listing:update',
      delete: 'fashion:listing:delete'
    }
  },
  // Future domains registered here
  jobs: {
    name: 'Jobs Marketplace',
    version: '1.0.0',
    endpoints: {
      listings: '/api/jobs/listings',
      categories: '/api/jobs/categories'
    },
    schemas: {
      listing: JobListingSchema
    },
    permissions: {
      create: 'jobs:listing:create',
      read: 'jobs:listing:read'
    }
  }
};
```

## 🔄 **Migration Timeline**

### **Phase 1: Immediate (Week 1-2)**
1. ✅ Create fashion domain schema
2. ✅ Implement FashionListingForm component
3. ✅ Update create-listing page to use fashion categories
4. ✅ Migrate existing fashion listings
5. ✅ Deploy with backward compatibility

### **Phase 2: Optimization (Week 3-4)**
1. ✅ Implement AI-powered fashion search
2. ✅ Add fashion-specific filters
3. ✅ Performance optimization
4. ✅ Remove legacy schema references

### **Phase 3: Future Verticals (Months 2-6)**
1. ✅ Design job marketplace schema
2. ✅ Implement real estate domain
3. ✅ Add automotive marketplace
4. ✅ Complete domain separation

## ✅ **Quality Assurance**

### **Testing Strategy**
- Unit tests for all domain services
- Integration tests for API endpoints
- Migration verification scripts
- Performance benchmarking
- Type safety validation

### **Monitoring & Observability**
- Domain-specific metrics
- Migration progress tracking
- Performance monitoring
- Error tracking by domain
- Business intelligence dashboards

## 🔒 **Security & Compliance**

### **Data Privacy**
- Domain-specific data isolation
- GDPR compliance by domain
- Audit trails per domain
- Access control separation

### **API Security**
- Domain-specific rate limiting
- Authentication by domain
- Authorization permissions
- Input validation per domain

## 📈 **Business Benefits**

1. **Clear Separation of Concerns**: Each domain has its own business logic
2. **Scalability**: Independent scaling per domain
3. **Maintainability**: Isolated codebases reduce complexity
4. **Feature Velocity**: Teams can work independently on domains
5. **Data Integrity**: Domain-specific validation and constraints
6. **Future-Proof**: Easy addition of new marketplace verticals
