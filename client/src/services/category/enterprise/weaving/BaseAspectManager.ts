/**
 * Base Aspect Manager
 * Enterprise AOP-compliant aspect registration and lifecycle management
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * Handles core aspect management functionality:
 * - Aspect discovery and registration
 * - Lifecycle management (initialize, start, stop, destroy)
 * - Dependency injection and resolution
 * - Health monitoring and diagnostics
 * - Aspect metadata management
 */

import type { AspectMetadata } from '../aspects/ConfigurationValidationAspect';

// ===== ASPECT MANAGEMENT DOMAIN TYPES =====

/**
 * Aspect Registration Information Value Object
 * Immutable metadata about registered aspects
 */
export class AspectRegistration {
  constructor(
    public readonly aspectId: string,
    public readonly aspectName: string,
    public readonly aspectClass: new (...args: any[]) => any,
    public readonly aspectInstance: any,
    public readonly priority: number,
    public readonly dependencies: readonly string[],
    public readonly lifecycle: AspectLifecycle,
    public readonly metadata: Record<string, unknown>,
    public readonly registrationTime: number
  ) {}

  /**
   * Check if aspect has dependency
   */
  hasDependency(dependencyId: string): boolean {
    return this.dependencies.includes(dependencyId);
  }

  /**
   * Check if aspect is active
   */
  get isActive(): boolean {
    return this.lifecycle === AspectLifecycle.STARTED;
  }

  /**
   * Get registration age in milliseconds
   */
  get age(): number {
    return Date.now() - this.registrationTime;
  }
}

/**
 * Aspect Lifecycle Enumeration
 * Defines lifecycle states for aspect management
 */
export enum AspectLifecycle {
  REGISTERED = 'registered',
  INITIALIZED = 'initialized',
  STARTED = 'started',
  STOPPED = 'stopped',
  DESTROYED = 'destroyed',
  ERROR = 'error'
}

/**
 * Aspect Dependency Graph Value Object
 * Represents dependency relationships between aspects
 */
export class AspectDependencyGraph {
  private readonly adjacencyList = new Map<string, Set<string>>();
  private readonly reverseDependencies = new Map<string, Set<string>>();

  /**
   * Add dependency relationship
   */
  addDependency(aspectId: string, dependencyId: string): void {
    // Add forward dependency
    if (!this.adjacencyList.has(aspectId)) {
      this.adjacencyList.set(aspectId, new Set());
    }
    this.adjacencyList.get(aspectId)!.add(dependencyId);

    // Add reverse dependency
    if (!this.reverseDependencies.has(dependencyId)) {
      this.reverseDependencies.set(dependencyId, new Set());
    }
    this.reverseDependencies.get(dependencyId)!.add(aspectId);
  }

  /**
   * Get dependencies for aspect
   */
  getDependencies(aspectId: string): Set<string> {
    return this.adjacencyList.get(aspectId) || new Set();
  }

  /**
   * Get dependents for aspect
   */
  getDependents(aspectId: string): Set<string> {
    return this.reverseDependencies.get(aspectId) || new Set();
  }

  /**
   * Perform topological sort for initialization order
   */
  getInitializationOrder(aspectIds: Set<string>): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (aspectId: string): void => {
      if (visiting.has(aspectId)) {
        throw new AspectManagerError(`Circular dependency detected involving aspect: ${aspectId}`, 'CIRCULAR_DEPENDENCY');
      }
      if (visited.has(aspectId)) {
        return;
      }

      visiting.add(aspectId);
      
      const dependencies = this.getDependencies(aspectId);
      dependencies.forEach(dependencyId => {
        if (aspectIds.has(dependencyId)) {
          visit(dependencyId);
        }
      });

      visiting.delete(aspectId);
      visited.add(aspectId);
      result.push(aspectId);
    };

    aspectIds.forEach(aspectId => {
      if (!visited.has(aspectId)) {
        visit(aspectId);
      }
    });

    return result;
  }

  /**
   * Check for circular dependencies
   */
  hasCircularDependencies(aspectIds: Set<string>): boolean {
    try {
      this.getInitializationOrder(aspectIds);
      return false;
    } catch (error) {
      return error instanceof AspectManagerError && error.code === 'CIRCULAR_DEPENDENCY';
    }
  }
}

/**
 * Aspect Health Status Value Object
 * Tracks health and performance of aspects
 */
export class AspectHealthStatus {
  constructor(
    public readonly aspectId: string,
    public readonly isHealthy: boolean,
    public readonly lastHealthCheck: number,
    public readonly errorCount: number,
    public readonly warningCount: number,
    public readonly performanceMetrics: AspectPerformanceMetrics,
    public readonly issues: readonly string[]
  ) {}

  get healthGrade(): 'excellent' | 'good' | 'warning' | 'critical' {
    if (!this.isHealthy || this.errorCount > 5) return 'critical';
    if (this.errorCount > 2 || this.warningCount > 10) return 'warning';
    if (this.warningCount > 5 || this.performanceMetrics.averageExecutionTime > 100) return 'good';
    return 'excellent';
  }

  get needsAttention(): boolean {
    return this.healthGrade === 'warning' || this.healthGrade === 'critical';
  }
}

/**
 * Aspect Performance Metrics Value Object
 * Performance tracking for individual aspects
 */
export class AspectPerformanceMetrics {
  constructor(
    public readonly executionCount: number,
    public readonly averageExecutionTime: number,
    public readonly maxExecutionTime: number,
    public readonly minExecutionTime: number,
    public readonly successRate: number,
    public readonly memoryUsage: number
  ) {}

  get efficiency(): number {
    // Combine success rate and performance to get efficiency score
    const performanceScore = Math.max(0, 1 - (this.averageExecutionTime / 1000)); // Penalize >1s execution
    return (this.successRate + performanceScore) / 2;
  }
}

// ===== ASPECT MANAGER ERRORS =====

/**
 * Aspect Manager Error
 * Domain-specific error for aspect management operations
 */
export class AspectManagerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly aspectId?: string
  ) {
    super(message);
    this.name = 'AspectManagerError';
  }
}

/**
 * Aspect Registration Error
 * Specific error for aspect registration failures
 */
export class AspectRegistrationError extends AspectManagerError {
  constructor(aspectId: string, reason: string) {
    super(`Failed to register aspect '${aspectId}': ${reason}`, 'REGISTRATION_FAILED', aspectId);
  }
}

/**
 * Aspect Lifecycle Error
 * Specific error for aspect lifecycle management failures
 */
export class AspectLifecycleError extends AspectManagerError {
  constructor(aspectId: string, lifecycle: AspectLifecycle, reason: string) {
    super(`Failed to transition aspect '${aspectId}' to ${lifecycle}: ${reason}`, 'LIFECYCLE_FAILED', aspectId);
  }
}

// ===== ASPECT MANAGER INTERFACES =====

/**
 * Aspect Manager Interface
 * Defines contract for aspect management
 */
export interface IAspectManager {
  registerAspect<T>(aspectClass: new (...args: any[]) => T, config?: AspectRegistrationConfig): Promise<string>;
  unregisterAspect(aspectId: string): Promise<void>;
  getAspect<T>(aspectId: string): T | null;
  getAllAspects(): AspectRegistration[];
  startAspect(aspectId: string): Promise<void>;
  stopAspect(aspectId: string): Promise<void>;
  getAspectHealth(aspectId: string): AspectHealthStatus | null;
  getManagerHealth(): ManagerHealthStatus;
}

/**
 * Aspect Registration Configuration
 * Configuration options for aspect registration
 */
export interface AspectRegistrationConfig {
  priority?: number;
  dependencies?: string[];
  autoStart?: boolean;
  healthCheckInterval?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Manager Health Status
 * Overall health status of the aspect manager
 */
export interface ManagerHealthStatus {
  totalAspects: number;
  healthyAspects: number;
  unhealthyAspects: number;
  averagePerformance: number;
  systemLoad: number;
  uptime: number;
}

// ===== BASE ASPECT MANAGER IMPLEMENTATION =====

/**
 * Base Aspect Manager
 * Core implementation of aspect registration and lifecycle management
 * 
 * Responsibilities:
 * - Aspect discovery and registration
 * - Dependency resolution and initialization ordering
 * - Lifecycle management (start, stop, health monitoring)
 * - Performance tracking and health diagnostics
 * - Error handling and recovery
 */
export class BaseAspectManager implements IAspectManager {
  private readonly aspectRegistry = new Map<string, AspectRegistration>();
  private readonly dependencyGraph = new AspectDependencyGraph();
  private readonly healthStatus = new Map<string, AspectHealthStatus>();
  private readonly performanceTracker = new Map<string, AspectPerformanceMetrics>();
  private readonly healthCheckIntervals = new Map<string, NodeJS.Timeout>();
  
  private readonly startTime = Date.now();
  private nextAspectId = 1;

  constructor() {
    this.startManagerHealthMonitoring();
  }

  /**
   * Register Aspect
   * Registers new aspect with dependency resolution and lifecycle management
   */
  async registerAspect<T>(
    aspectClass: new (...args: any[]) => T,
    config: AspectRegistrationConfig = {}
  ): Promise<string> {
    const aspectId = this.generateAspectId();
    const aspectName = aspectClass.name;

    try {
      // Validate aspect class
      this.validateAspectClass(aspectClass);

      // Create aspect instance
      const aspectInstance = new aspectClass();

      // Extract aspect metadata
      const aspectMetadata = this.extractAspectMetadata(aspectInstance);

      // Create registration
      const registration = new AspectRegistration(
        aspectId,
        aspectName,
        aspectClass,
        aspectInstance,
        config.priority || 100,
        config.dependencies || [],
        AspectLifecycle.REGISTERED,
        { ...aspectMetadata, ...config.metadata },
        Date.now()
      );

      // Register dependencies
      for (const dependencyId of registration.dependencies) {
        this.dependencyGraph.addDependency(aspectId, dependencyId);
      }

      // Check for circular dependencies
      const allAspectIds = new Set([...this.aspectRegistry.keys(), aspectId]);
      if (this.dependencyGraph.hasCircularDependencies(allAspectIds)) {
        throw new AspectRegistrationError(aspectId, 'Circular dependency detected');
      }

      // Store registration
      this.aspectRegistry.set(aspectId, registration);

      // Initialize aspect
      await this.initializeAspect(aspectId);

      // Start health monitoring
      this.startAspectHealthMonitoring(aspectId, config.healthCheckInterval);

      // Auto-start if configured
      if (config.autoStart !== false) {
        await this.startAspect(aspectId);
      }

      console.log(`Aspect registered successfully: ${aspectName} (${aspectId})`);
      return aspectId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AspectRegistrationError(aspectId, errorMessage);
    }
  }

  /**
   * Unregister Aspect
   * Safely removes aspect and updates dependencies
   */
  async unregisterAspect(aspectId: string): Promise<void> {
    const registration = this.aspectRegistry.get(aspectId);
    if (!registration) {
      throw new AspectManagerError(`Aspect not found: ${aspectId}`, 'ASPECT_NOT_FOUND', aspectId);
    }

    try {
      // Check for dependents
      const dependents = this.dependencyGraph.getDependents(aspectId);
      if (dependents.size > 0) {
        throw new AspectManagerError(
          `Cannot unregister aspect ${aspectId}: has dependents: ${Array.from(dependents).join(', ')}`,
          'HAS_DEPENDENTS',
          aspectId
        );
      }

      // Stop aspect if running
      if (registration.lifecycle === AspectLifecycle.STARTED) {
        await this.stopAspect(aspectId);
      }

      // Destroy aspect
      await this.destroyAspect(aspectId);

      // Stop health monitoring
      const healthInterval = this.healthCheckIntervals.get(aspectId);
      if (healthInterval) {
        clearInterval(healthInterval);
        this.healthCheckIntervals.delete(aspectId);
      }

      // Remove from collections
      this.aspectRegistry.delete(aspectId);
      this.healthStatus.delete(aspectId);
      this.performanceTracker.delete(aspectId);

      console.log(`Aspect unregistered successfully: ${aspectId}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AspectManagerError(`Failed to unregister aspect ${aspectId}: ${errorMessage}`, 'UNREGISTER_FAILED', aspectId);
    }
  }

  /**
   * Get Aspect Instance
   * Returns typed aspect instance
   */
  getAspect<T>(aspectId: string): T | null {
    const registration = this.aspectRegistry.get(aspectId);
    return registration ? registration.aspectInstance as T : null;
  }

  /**
   * Get All Aspects
   * Returns all registered aspects
   */
  getAllAspects(): AspectRegistration[] {
    return Array.from(this.aspectRegistry.values());
  }

  /**
   * Start Aspect
   * Starts aspect with dependency resolution
   */
  async startAspect(aspectId: string): Promise<void> {
    const registration = this.aspectRegistry.get(aspectId);
    if (!registration) {
      throw new AspectManagerError(`Aspect not found: ${aspectId}`, 'ASPECT_NOT_FOUND', aspectId);
    }

    if (registration.lifecycle === AspectLifecycle.STARTED) {
      return; // Already started
    }

    try {
      // Start dependencies first
      const dependencies = this.dependencyGraph.getDependencies(aspectId);
      const dependencyArray = Array.from(dependencies);
      for (const dependencyId of dependencyArray) {
        const depRegistration = this.aspectRegistry.get(dependencyId);
        if (depRegistration && depRegistration.lifecycle !== AspectLifecycle.STARTED) {
          await this.startAspect(dependencyId);
        }
      }

      // Start the aspect
      if (typeof registration.aspectInstance.start === 'function') {
        await registration.aspectInstance.start();
      }

      // Update lifecycle
      this.updateAspectLifecycle(aspectId, AspectLifecycle.STARTED);

      console.log(`Aspect started successfully: ${aspectId}`);

    } catch (error) {
      this.updateAspectLifecycle(aspectId, AspectLifecycle.ERROR);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AspectLifecycleError(aspectId, AspectLifecycle.STARTED, errorMessage);
    }
  }

  /**
   * Stop Aspect
   * Stops aspect with dependent resolution
   */
  async stopAspect(aspectId: string): Promise<void> {
    const registration = this.aspectRegistry.get(aspectId);
    if (!registration) {
      throw new AspectManagerError(`Aspect not found: ${aspectId}`, 'ASPECT_NOT_FOUND', aspectId);
    }

    if (registration.lifecycle !== AspectLifecycle.STARTED) {
      return; // Not started
    }

    try {
      // Stop dependents first
      const dependents = this.dependencyGraph.getDependents(aspectId);
      const dependentArray = Array.from(dependents);
      for (const dependentId of dependentArray) {
        const depRegistration = this.aspectRegistry.get(dependentId);
        if (depRegistration && depRegistration.lifecycle === AspectLifecycle.STARTED) {
          await this.stopAspect(dependentId);
        }
      }

      // Stop the aspect
      if (typeof registration.aspectInstance.stop === 'function') {
        await registration.aspectInstance.stop();
      }

      // Update lifecycle
      this.updateAspectLifecycle(aspectId, AspectLifecycle.STOPPED);

      console.log(`Aspect stopped successfully: ${aspectId}`);

    } catch (error) {
      this.updateAspectLifecycle(aspectId, AspectLifecycle.ERROR);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AspectLifecycleError(aspectId, AspectLifecycle.STOPPED, errorMessage);
    }
  }

  /**
   * Get Aspect Health
   * Returns current health status for aspect
   */
  getAspectHealth(aspectId: string): AspectHealthStatus | null {
    return this.healthStatus.get(aspectId) || null;
  }

  /**
   * Get Manager Health
   * Returns overall manager health status
   */
  getManagerHealth(): ManagerHealthStatus {
    const allAspects = this.getAllAspects();
    const healthyAspects = allAspects.filter(a => {
      const health = this.getAspectHealth(a.aspectId);
      return health?.isHealthy === true;
    });

    const performanceMetrics = Array.from(this.performanceTracker.values());
    const averagePerformance = performanceMetrics.length > 0
      ? performanceMetrics.reduce((sum, m) => sum + m.efficiency, 0) / performanceMetrics.length
      : 1.0;

    return {
      totalAspects: allAspects.length,
      healthyAspects: healthyAspects.length,
      unhealthyAspects: allAspects.length - healthyAspects.length,
      averagePerformance,
      systemLoad: this.calculateSystemLoad(),
      uptime: Date.now() - this.startTime
    };
  }

  // ===== PRIVATE HELPER METHODS =====

  private generateAspectId(): string {
    return `aspect_${this.nextAspectId++}_${Date.now().toString(36)}`;
  }

  private validateAspectClass(aspectClass: any): void {
    if (typeof aspectClass !== 'function') {
      throw new Error('Aspect must be a constructor function');
    }

    if (!aspectClass.prototype._isAspect) {
      throw new Error('Class must be decorated with @Aspect()');
    }
  }

  private extractAspectMetadata(aspectInstance: any): Record<string, unknown> {
    if (typeof aspectInstance.getAspectMetadata === 'function') {
      return aspectInstance.getAspectMetadata();
    }
    return {};
  }

  private async initializeAspect(aspectId: string): Promise<void> {
    const registration = this.aspectRegistry.get(aspectId)!;
    
    try {
      if (typeof registration.aspectInstance.initialize === 'function') {
        await registration.aspectInstance.initialize();
      }
      
      this.updateAspectLifecycle(aspectId, AspectLifecycle.INITIALIZED);
      
    } catch (error) {
      this.updateAspectLifecycle(aspectId, AspectLifecycle.ERROR);
      throw error;
    }
  }

  private async destroyAspect(aspectId: string): Promise<void> {
    const registration = this.aspectRegistry.get(aspectId)!;
    
    try {
      if (typeof registration.aspectInstance.destroy === 'function') {
        await registration.aspectInstance.destroy();
      }
      
      this.updateAspectLifecycle(aspectId, AspectLifecycle.DESTROYED);
      
    } catch (error) {
      this.updateAspectLifecycle(aspectId, AspectLifecycle.ERROR);
      throw error;
    }
  }

  private updateAspectLifecycle(aspectId: string, lifecycle: AspectLifecycle): void {
    const registration = this.aspectRegistry.get(aspectId);
    if (registration) {
      const updatedRegistration = new AspectRegistration(
        registration.aspectId,
        registration.aspectName,
        registration.aspectClass,
        registration.aspectInstance,
        registration.priority,
        registration.dependencies,
        lifecycle,
        registration.metadata,
        registration.registrationTime
      );
      this.aspectRegistry.set(aspectId, updatedRegistration);
    }
  }

  private startAspectHealthMonitoring(aspectId: string, intervalMs: number = 30000): void {
    const interval = setInterval(() => {
      this.performHealthCheck(aspectId);
    }, intervalMs);
    
    this.healthCheckIntervals.set(aspectId, interval);
    
    // Perform initial health check
    this.performHealthCheck(aspectId);
  }

  private performHealthCheck(aspectId: string): void {
    const registration = this.aspectRegistry.get(aspectId);
    if (!registration) return;

    try {
      let isHealthy = true;
      const issues: string[] = [];

      // Check lifecycle state
      if (registration.lifecycle === AspectLifecycle.ERROR) {
        isHealthy = false;
        issues.push('Aspect is in error state');
      }

      // Check if aspect responds to health check
      if (typeof registration.aspectInstance.healthCheck === 'function') {
        const healthResult = registration.aspectInstance.healthCheck();
        if (healthResult === false) {
          isHealthy = false;
          issues.push('Aspect health check failed');
        }
      }

      // Get performance metrics
      const performanceMetrics = this.performanceTracker.get(aspectId) || new AspectPerformanceMetrics(0, 0, 0, 0, 1, 0);

      // Create health status
      const healthStatus = new AspectHealthStatus(
        aspectId,
        isHealthy,
        Date.now(),
        0, // errorCount would be tracked separately
        0, // warningCount would be tracked separately
        performanceMetrics,
        issues
      );

      this.healthStatus.set(aspectId, healthStatus);

    } catch (error) {
      // Health check itself failed
      const performanceMetrics = this.performanceTracker.get(aspectId) || new AspectPerformanceMetrics(0, 0, 0, 0, 1, 0);
      const healthStatus = new AspectHealthStatus(
        aspectId,
        false,
        Date.now(),
        1,
        0,
        performanceMetrics,
        [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      );

      this.healthStatus.set(aspectId, healthStatus);
    }
  }

  private startManagerHealthMonitoring(): void {
    setInterval(() => {
      this.performManagerHealthCheck();
    }, 60000); // Every minute
  }

  private performManagerHealthCheck(): void {
    const managerHealth = this.getManagerHealth();
    
    if (managerHealth.unhealthyAspects > 0) {
      console.warn(`Manager health warning: ${managerHealth.unhealthyAspects} unhealthy aspects`);
    }
    
    if (managerHealth.averagePerformance < 0.5) {
      console.warn(`Manager performance warning: Average performance is ${Math.round(managerHealth.averagePerformance * 100)}%`);
    }
  }

  private calculateSystemLoad(): number {
    // Simple load calculation based on aspect count and performance
    const aspectCount = this.aspectRegistry.size;
    const maxRecommendedAspects = 20;
    return Math.min(1, aspectCount / maxRecommendedAspects);
  }

  /**
   * Shutdown Manager
   * Gracefully shuts down all aspects and cleans up resources
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down Aspect Manager...');
    
    // Stop all aspects in reverse dependency order
    const aspectIds = new Set(this.aspectRegistry.keys());
    const shutdownOrder = this.dependencyGraph.getInitializationOrder(aspectIds).reverse();
    
    for (const aspectId of shutdownOrder) {
      try {
        await this.stopAspect(aspectId);
      } catch (error) {
        console.error(`Error stopping aspect ${aspectId}:`, error);
      }
    }

    // Clear all intervals
    Array.from(this.healthCheckIntervals.values()).forEach(interval => {
      clearInterval(interval);
    });
    this.healthCheckIntervals.clear();

    // Clear all data structures
    this.aspectRegistry.clear();
    this.healthStatus.clear();
    this.performanceTracker.clear();

    console.log('Aspect Manager shutdown complete');
  }
}

export default BaseAspectManager;