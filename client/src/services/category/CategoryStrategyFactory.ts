/**
 * Category Strategy Factory
 * Enterprise factory implementation with proper dependency injection and validation
 * Creates category-specific strategies with AOP aspect integration
 */

import { CategoryStrategy, CategoryDomain, CategoryDomainFactory } from './CategoryDomainTypes';
import { WomenCategoryStrategy } from './strategies/WomenCategoryStrategy';
import { MenCategoryStrategy } from './strategies/MenCategoryStrategy';
import { KidsCategoryStrategy } from './strategies/KidsCategoryStrategy';
import { HomeCategoryStrategy } from './strategies/HomeCategoryStrategy';
import { ElectronicsCategoryStrategy } from './strategies/ElectronicsCategoryStrategy';
import { categoryAspectManager, CategoryAspectManager } from './aspects/CategoryAspectManager';

// Strategy Factory Interface
export interface ICategoryStrategyFactory {
  createStrategy(vertical: string, category: string): CategoryStrategy;
  isStrategySupported(vertical: string, category: string): boolean;
  getSupportedStrategies(): { vertical: string; category: string; }[];
}

// Strategy Registration
export interface StrategyRegistration {
  readonly vertical: string;
  readonly category: string;
  readonly strategyClass: new () => CategoryStrategy;
  readonly priority: number;
  readonly isActive: boolean;
}

// Enterprise Category Strategy Factory
export class CategoryStrategyFactory implements ICategoryStrategyFactory {
  private strategies: Map<string, StrategyRegistration> = new Map();
  private strategyInstances: Map<string, CategoryStrategy> = new Map();
  private aspectManager: CategoryAspectManager;

  constructor(aspectManager: CategoryAspectManager = categoryAspectManager) {
    this.aspectManager = aspectManager;
    this.initializeDefaultStrategies();
  }

  private initializeDefaultStrategies(): void {
    const defaultStrategies: StrategyRegistration[] = [
      {
        vertical: 'fashion',
        category: 'women',
        strategyClass: WomenCategoryStrategy,
        priority: 1,
        isActive: true
      },
      {
        vertical: 'fashion',
        category: 'men',
        strategyClass: MenCategoryStrategy,
        priority: 1,
        isActive: true
      },
      {
        vertical: 'fashion',
        category: 'kids',
        strategyClass: KidsCategoryStrategy,
        priority: 1,
        isActive: true
      },
      {
        vertical: 'home',
        category: 'home',
        strategyClass: HomeCategoryStrategy,
        priority: 1,
        isActive: true
      },
      {
        vertical: 'fashion',
        category: 'electronics',
        strategyClass: ElectronicsCategoryStrategy,
        priority: 1,
        isActive: true
      }
    ];

    for (const registration of defaultStrategies) {
      this.registerStrategy(registration);
    }
  }

  registerStrategy(registration: StrategyRegistration): void {
    const key = this.generateStrategyKey(registration.vertical, registration.category);
    
    if (this.strategies.has(key)) {
      throw new Error(`Strategy already registered for ${registration.vertical}/${registration.category}`);
    }

    this.strategies.set(key, registration);
  }

  unregisterStrategy(vertical: string, category: string): void {
    const key = this.generateStrategyKey(vertical, category);
    this.strategies.delete(key);
    this.strategyInstances.delete(key);
  }

  createStrategy(vertical: string, category: string): CategoryStrategy {
    const key = this.generateStrategyKey(vertical, category);
    
    // Return cached instance if available
    if (this.strategyInstances.has(key)) {
      return this.strategyInstances.get(key)!;
    }

    const registration = this.strategies.get(key);
    if (!registration) {
      throw new Error(`No strategy registered for ${vertical}/${category}`);
    }

    if (!registration.isActive) {
      throw new Error(`Strategy for ${vertical}/${category} is currently inactive`);
    }

    // Create new strategy instance
    const strategy = new registration.strategyClass();
    
    // Validate the strategy
    this.validateStrategy(strategy, vertical, category);
    
    // Wrap strategy with AOP aspects
    const wrappedStrategy = this.wrapStrategyWithAspects(strategy);
    
    // Cache the wrapped strategy
    this.strategyInstances.set(key, wrappedStrategy);
    
    return wrappedStrategy;
  }

  isStrategySupported(vertical: string, category: string): boolean {
    const key = this.generateStrategyKey(vertical, category);
    const registration = this.strategies.get(key);
    
    return registration !== undefined && registration.isActive;
  }

  getSupportedStrategies(): { vertical: string; category: string; }[] {
    return Array.from(this.strategies.values())
      .filter(registration => registration.isActive)
      .map(registration => ({
        vertical: registration.vertical,
        category: registration.category
      }));
  }

  private generateStrategyKey(vertical: string, category: string): string {
    return `${vertical.toLowerCase()}:${category.toLowerCase()}`;
  }

  private validateStrategy(strategy: CategoryStrategy, vertical: string, category: string): void {
    if (!strategy.domain) {
      throw new Error(`Strategy must have a domain property`);
    }

    if (strategy.domain.vertical !== vertical) {
      throw new Error(`Strategy domain vertical "${strategy.domain.vertical}" does not match requested "${vertical}"`);
    }

    if (strategy.domain.category !== category) {
      throw new Error(`Strategy domain category "${strategy.domain.category}" does not match requested "${category}"`);
    }

    // Validate required methods
    const requiredMethods = ['getFilterConfiguration', 'validateSelection', 'transformListingData', 'getAnalyticsConfiguration'];
    
    for (const method of requiredMethods) {
      if (typeof (strategy as any)[method] !== 'function') {
        throw new Error(`Strategy must implement ${method} method`);
      }
    }
  }

  private wrapStrategyWithAspects(strategy: CategoryStrategy): CategoryStrategy {
    const wrappedStrategy = { ...strategy };

    // Wrap each method with aspects
    const methodsToWrap = ['getFilterConfiguration', 'validateSelection', 'transformListingData', 'getAnalyticsConfiguration'];

    for (const methodName of methodsToWrap) {
      const originalMethod = (strategy as any)[methodName];
      if (typeof originalMethod === 'function') {
        (wrappedStrategy as any)[methodName] = async (...args: any[]) => {
          return this.aspectManager.executeWithAspects(
            strategy,
            methodName,
            originalMethod,
            args
          );
        };
      }
    }

    return wrappedStrategy;
  }

  // Strategy Management Methods
  activateStrategy(vertical: string, category: string): void {
    const key = this.generateStrategyKey(vertical, category);
    const registration = this.strategies.get(key);
    
    if (registration) {
      this.strategies.set(key, { ...registration, isActive: true });
    }
  }

  deactivateStrategy(vertical: string, category: string): void {
    const key = this.generateStrategyKey(vertical, category);
    const registration = this.strategies.get(key);
    
    if (registration) {
      this.strategies.set(key, { ...registration, isActive: false });
      this.strategyInstances.delete(key);
    }
  }

  clearInstanceCache(): void {
    this.strategyInstances.clear();
  }

  getStrategyInfo(vertical: string, category: string): StrategyRegistration | undefined {
    const key = this.generateStrategyKey(vertical, category);
    return this.strategies.get(key);
  }

  getAllRegistrations(): StrategyRegistration[] {
    return Array.from(this.strategies.values());
  }
}

// Singleton factory instance
export const categoryStrategyFactory = new CategoryStrategyFactory();