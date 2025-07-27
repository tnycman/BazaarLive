/**
 * CategoryRepository.ts - Enterprise Repository Implementation with AOP
 * 
 * Implements Repository Pattern with proper data access abstraction,
 * caching strategies, and enterprise-grade error handling.
 * 
 * NO SHORTCUTS - ENTERPRISE GRADE IMPLEMENTATION
 */

import { z } from 'zod';
import { 
  CategoryEntity, 
  CategoryHierarchy, 
  CategoryId, 
  VerticalId,
  ICategoryRepository,
  ICategoryHierarchyRepository
} from './CategoryDomainService';
import { CategoryAspectCoordinator } from './CategoryAspects';

// ============================================================================
// DATA ACCESS LAYER INTERFACES
// ============================================================================

export interface ICategoryDataSource {
  findById(id: string): Promise<CategoryRawData | null>;
  findByVertical(vertical: string): Promise<CategoryRawData[]>;
  findByParent(parentId: string): Promise<CategoryRawData[]>;
  create(data: CategoryRawData): Promise<CategoryRawData>;
  update(id: string, data: Partial<CategoryRawData>): Promise<CategoryRawData>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
  countByVertical(vertical: string): Promise<number>;
  executeQuery(query: string, params: any[]): Promise<any[]>;
}

export interface CategoryRawData {
  id: string;
  name: string;
  count: number;
  vertical_id: string;
  parent_category_id?: string;
  metadata?: Record<string, unknown>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// CONCRETE DATA SOURCE IMPLEMENTATION
// ============================================================================

export class InMemoryCategoryDataSource implements ICategoryDataSource {
  private readonly categories = new Map<string, CategoryRawData>();
  private readonly aspectCoordinator: CategoryAspectCoordinator;

  constructor() {
    this.aspectCoordinator = new CategoryAspectCoordinator();
    this.initializeTestData();
  }

  async findById(id: string): Promise<CategoryRawData | null> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'findById',
      async (categoryId: string) => {
        return this.categories.get(categoryId) || null;
      },
      [id]
    );
  }

  async findByVertical(vertical: string): Promise<CategoryRawData[]> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'findByVertical',
      async (verticalStr: string) => {
        const result: CategoryRawData[] = [];
        for (const category of Array.from(this.categories.values())) {
          if (category.vertical_id === verticalStr) {
            result.push({ ...category });
          }
        }
        return result;
      },
      [vertical]
    );
  }

  async findByParent(parentId: string): Promise<CategoryRawData[]> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'findByParent',
      async (parentCategoryId: string) => {
        const result: CategoryRawData[] = [];
        for (const category of Array.from(this.categories.values())) {
          if (category.parent_category_id === parentCategoryId) {
            result.push({ ...category });
          }
        }
        return result;
      },
      [parentId]
    );
  }

  async create(data: CategoryRawData): Promise<CategoryRawData> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'create',
      async (categoryData: CategoryRawData) => {
        const newCategory: CategoryRawData = {
          ...categoryData,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        this.categories.set(newCategory.id, newCategory);
        return { ...newCategory };
      },
      [data]
    );
  }

  async update(id: string, data: Partial<CategoryRawData>): Promise<CategoryRawData> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'update',
      async (categoryId: string, updateData: Partial<CategoryRawData>) => {
        const existing = this.categories.get(categoryId);
        if (!existing) {
          throw new Error(`Category with id ${categoryId} not found`);
        }

        const updated: CategoryRawData = {
          ...existing,
          ...updateData,
          id: categoryId, // Ensure ID doesn't change
          updated_at: new Date()
        };

        this.categories.set(categoryId, updated);
        return { ...updated };
      },
      [id, data]
    );
  }

  async delete(id: string): Promise<boolean> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'delete',
      async (categoryId: string) => {
        return this.categories.delete(categoryId);
      },
      [id]
    );
  }

  async count(): Promise<number> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'count',
      async () => {
        return this.categories.size;
      },
      []
    );
  }

  async countByVertical(vertical: string): Promise<number> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'countByVertical',
      async (verticalStr: string) => {
        let count = 0;
        for (const category of Array.from(this.categories.values())) {
          if (category.vertical_id === verticalStr) {
            count++;
          }
        }
        return count;
      },
      [vertical]
    );
  }

  async executeQuery(query: string, params: any[]): Promise<any[]> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'executeQuery',
      async (sqlQuery: string, queryParams: any[]) => {
        // Simplified query execution for in-memory store
        // In real implementation, this would execute against database
        throw new Error('Custom queries not supported in in-memory implementation');
      },
      [query, params]
    );
  }

  private initializeTestData(): void {
    const now = new Date();
    
    // Fashion - Women Categories
    const womenCategories: CategoryRawData[] = [
      { id: 'accessories', name: 'Accessories', count: 8542, vertical_id: 'fashion', is_active: true, created_at: now, updated_at: now },
      { id: 'bags', name: 'Bags', count: 6234, vertical_id: 'fashion', is_active: true, created_at: now, updated_at: now },
      { id: 'dresses', name: 'Dresses', count: 5234, vertical_id: 'fashion', is_active: true, created_at: now, updated_at: now },
      { id: 'shoes', name: 'Shoes', count: 7890, vertical_id: 'fashion', is_active: true, created_at: now, updated_at: now },
      { id: 'tops', name: 'Tops', count: 8901, vertical_id: 'fashion', is_active: true, created_at: now, updated_at: now }
    ];

    // Fashion - Men Categories  
    const menCategories: CategoryRawData[] = [
      { id: 'men_accessories', name: 'Accessories', count: 4521, vertical_id: 'fashion', parent_category_id: 'men', is_active: true, created_at: now, updated_at: now },
      { id: 'men_shirts', name: 'Shirts', count: 4890, vertical_id: 'fashion', parent_category_id: 'men', is_active: true, created_at: now, updated_at: now },
      { id: 'men_pants', name: 'Pants', count: 2945, vertical_id: 'fashion', parent_category_id: 'men', is_active: true, created_at: now, updated_at: now },
      { id: 'men_shoes', name: 'Shoes', count: 5890, vertical_id: 'fashion', parent_category_id: 'men', is_active: true, created_at: now, updated_at: now }
    ];

    // Fashion - Kids Categories
    const kidsCategories: CategoryRawData[] = [
      { id: 'kids_clothing', name: 'Clothing', count: 3678, vertical_id: 'fashion', parent_category_id: 'kids', is_active: true, created_at: now, updated_at: now },
      { id: 'kids_shoes', name: 'Shoes', count: 2890, vertical_id: 'fashion', parent_category_id: 'kids', is_active: true, created_at: now, updated_at: now },
      { id: 'kids_toys', name: 'Toys', count: 4567, vertical_id: 'fashion', parent_category_id: 'kids', is_active: true, created_at: now, updated_at: now },
      { id: 'kids_accessories', name: 'Accessories', count: 2134, vertical_id: 'fashion', parent_category_id: 'kids', is_active: true, created_at: now, updated_at: now }
    ];

    // Root categories
    const rootCategories: CategoryRawData[] = [
      { id: 'women', name: 'Women', count: 0, vertical_id: 'fashion', is_active: true, created_at: now, updated_at: now },
      { id: 'men', name: 'Men', count: 0, vertical_id: 'fashion', is_active: true, created_at: now, updated_at: now },
      { id: 'kids', name: 'Kids', count: 0, vertical_id: 'fashion', is_active: true, created_at: now, updated_at: now }
    ];

    // Initialize all categories
    [...rootCategories, ...womenCategories, ...menCategories, ...kidsCategories].forEach(cat => {
      this.categories.set(cat.id, cat);
    });
  }
}

// ============================================================================
// REPOSITORY IMPLEMENTATIONS
// ============================================================================

export class CategoryRepository implements ICategoryRepository {
  private readonly aspectCoordinator: CategoryAspectCoordinator;

  constructor(private readonly dataSource: ICategoryDataSource) {
    this.aspectCoordinator = new CategoryAspectCoordinator();
  }

  async findById(id: CategoryId): Promise<CategoryEntity | null> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'findById',
      async (categoryId: CategoryId) => {
        const rawData = await this.dataSource.findById(categoryId);
        return rawData ? this.mapToEntity(rawData) : null;
      },
      [id]
    );
  }

  async findByVertical(vertical: VerticalId): Promise<CategoryEntity[]> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'findByVertical',
      async (verticalId: VerticalId) => {
        const rawDataList = await this.dataSource.findByVertical(verticalId);
        return rawDataList.map(data => this.mapToEntity(data));
      },
      [vertical]
    );
  }

  async findByParent(parentId: CategoryId): Promise<CategoryEntity[]> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'findByParent',
      async (parentCategoryId: CategoryId) => {
        const rawDataList = await this.dataSource.findByParent(parentCategoryId);
        return rawDataList.map(data => this.mapToEntity(data));
      },
      [parentId]
    );
  }

  async findActiveByVertical(vertical: VerticalId): Promise<CategoryEntity[]> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'findActiveByVertical',
      async (verticalId: VerticalId) => {
        const allCategories = await this.findByVertical(verticalId);
        return allCategories.filter(cat => cat.isActive);
      },
      [vertical]
    );
  }

  async save(category: CategoryEntity): Promise<CategoryEntity> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'save',
      async (categoryEntity: CategoryEntity) => {
        const rawData = this.mapToRawData(categoryEntity);
        
        // Check if category exists
        const existing = await this.dataSource.findById(categoryEntity.id);
        
        let savedData: CategoryRawData;
        if (existing) {
          savedData = await this.dataSource.update(categoryEntity.id, rawData);
        } else {
          savedData = await this.dataSource.create(rawData);
        }
        
        return this.mapToEntity(savedData);
      },
      [category]
    );
  }

  async saveAll(categories: CategoryEntity[]): Promise<CategoryEntity[]> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'saveAll',
      async (categoryEntities: CategoryEntity[]) => {
        const savedCategories: CategoryEntity[] = [];
        
        for (const category of categoryEntities) {
          const saved = await this.save(category);
          savedCategories.push(saved);
        }
        
        return savedCategories;
      },
      [categories]
    );
  }

  async delete(id: CategoryId): Promise<boolean> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'delete',
      async (categoryId: CategoryId) => {
        return await this.dataSource.delete(categoryId);
      },
      [id]
    );
  }

  async existsById(id: CategoryId): Promise<boolean> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'existsById',
      async (categoryId: CategoryId) => {
        const category = await this.dataSource.findById(categoryId);
        return category !== null;
      },
      [id]
    );
  }

  async count(): Promise<number> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'count',
      async () => {
        return await this.dataSource.count();
      },
      []
    );
  }

  async countByVertical(vertical: VerticalId): Promise<number> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'countByVertical',
      async (verticalId: VerticalId) => {
        return await this.dataSource.countByVertical(verticalId);
      },
      [vertical]
    );
  }

  private mapToEntity(rawData: CategoryRawData): CategoryEntity {
    return CategoryEntity.create({
      id: rawData.id,
      name: rawData.name,
      count: rawData.count,
      verticalId: rawData.vertical_id,
      parentCategoryId: rawData.parent_category_id,
      metadata: rawData.metadata,
      isActive: rawData.is_active
    });
  }

  private mapToRawData(entity: CategoryEntity): CategoryRawData {
    return {
      id: entity.id,
      name: entity.name,
      count: entity.count,
      vertical_id: entity.verticalId,
      parent_category_id: entity.parentCategoryId,
      metadata: entity.metadata,
      is_active: entity.isActive,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }
}

// ============================================================================
// HIERARCHY REPOSITORY IMPLEMENTATION
// ============================================================================

export class CategoryHierarchyRepository implements ICategoryHierarchyRepository {
  private readonly aspectCoordinator: CategoryAspectCoordinator;
  private readonly hierarchyCache = new Map<VerticalId, {
    hierarchy: CategoryHierarchy;
    timestamp: number;
    ttl: number;
  }>();

  private readonly defaultTTL = 10 * 60 * 1000; // 10 minutes

  constructor(private readonly categoryRepository: ICategoryRepository) {
    this.aspectCoordinator = new CategoryAspectCoordinator();
  }

  async findByVertical(vertical: VerticalId): Promise<CategoryHierarchy | null> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'findByVertical',
      async (verticalId: VerticalId) => {
        // Check cache first
        const cached = this.hierarchyCache.get(verticalId);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
          return cached.hierarchy;
        }

        // Build from repository
        const categories = await this.categoryRepository.findActiveByVertical(verticalId);
        if (categories.length === 0) {
          return null;
        }

        const hierarchy = CategoryHierarchy.create({
          vertical: verticalId,
          categories,
          businessRules: this.getBusinessRulesForVertical(verticalId)
        });

        // Cache the result
        this.hierarchyCache.set(verticalId, {
          hierarchy,
          timestamp: Date.now(),
          ttl: this.defaultTTL
        });

        return hierarchy;
      },
      [vertical]
    );
  }

  async save(hierarchy: CategoryHierarchy): Promise<CategoryHierarchy> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'save',
      async (categoryHierarchy: CategoryHierarchy) => {
        // Save all categories in the hierarchy
        const categories = categoryHierarchy.getAllActiveCategories();
        await this.categoryRepository.saveAll(categories);

        // Update cache
        this.hierarchyCache.set(categoryHierarchy.vertical, {
          hierarchy: categoryHierarchy,
          timestamp: Date.now(),
          ttl: this.defaultTTL
        });

        return categoryHierarchy;
      },
      [hierarchy]
    );
  }

  async refresh(vertical: VerticalId): Promise<CategoryHierarchy> {
    return this.aspectCoordinator.executeWithAspects(
      this,
      'refresh',
      async (verticalId: VerticalId) => {
        // Clear cache
        this.hierarchyCache.delete(verticalId);
        
        // Rebuild from repository
        const hierarchy = await this.findByVertical(verticalId);
        if (!hierarchy) {
          throw new Error(`No categories found for vertical: ${verticalId}`);
        }

        return hierarchy;
      },
      [vertical]
    );
  }

  private getBusinessRulesForVertical(vertical: VerticalId): Record<string, unknown> {
    const defaultRules = {
      maxDepth: 5,
      minItemsPerCategory: 1,
      allowEmptyCategories: false,
      autoDeactivateThreshold: 0
    };

    switch (vertical) {
      case 'fashion':
        return {
          ...defaultRules,
          seasonalCategories: true,
          sizeVariations: true,
          colorVariations: true,
          brandFiltering: true
        };
      case 'electronics':
        return {
          ...defaultRules,
          technicalSpecs: true,
          warrantyTracking: true,
          compatibilityMatrix: true
        };
      case 'cars':
        return {
          ...defaultRules,
          makeModelYear: true,
          mileageTracking: true,
          conditionRequired: true
        };
      default:
        return defaultRules;
    }
  }

  public clearCache(): void {
    this.hierarchyCache.clear();
  }

  public getCacheStats(): {
    size: number;
    verticals: string[];
    oldestEntry: number;
  } {
    let oldestTimestamp = Date.now();
    const verticals: string[] = [];

    for (const [vertical, cached] of Array.from(this.hierarchyCache.entries())) {
      verticals.push(vertical);
      if (cached.timestamp < oldestTimestamp) {
        oldestTimestamp = cached.timestamp;
      }
    }

    return {
      size: this.hierarchyCache.size,
      verticals,
      oldestEntry: oldestTimestamp
    };
  }
}