/**
 * Memory Management Service
 * Enterprise-grade memory management for filter components
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { EventEmitter } from 'events';

// ===== MEMORY MANAGEMENT INTERFACES =====

export interface SubscriptionInfo {
  id: string;
  componentName: string;
  unsubscribeFn: () => void;
  createdAt: number;
  lastAccessed: number;
  memoryUsage: number;
  isActive: boolean;
}

export interface MemoryStats {
  activeSubscriptions: number;
  totalMemoryUsage: number;
  averageMemoryPerSubscription: number;
  memoryThreshold: number;
  cleanupIntervals: number;
  lastCleanupTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  isHealthy: boolean;
}

export interface MemoryAlert {
  type: 'WARNING' | 'CRITICAL' | 'RECOVERY';
  message: string;
  timestamp: number;
  memoryUsage: number;
  threshold: number;
}

export interface MemoryConfig {
  maxSubscriptions: number;
  memoryThreshold: number;
  cleanupInterval: number;
  maxSubscriptionAge: number;
  maxInactiveTime: number;
  enableMonitoring: boolean;
  enableAlerts: boolean;
}

// ===== MEMORY MANAGEMENT SERVICE =====

export class MemoryManagementService extends EventEmitter {
  private static instance: MemoryManagementService;
  private subscriptions: Map<string, SubscriptionInfo> = new Map();
  private cleanupIntervals: Map<string, NodeJS.Timeout> = new Map();
  private memoryThreshold: number = 1000; // Max subscriptions
  private memoryUsageThreshold: number = 50 * 1024 * 1024; // 50MB
  private cleanupInterval: number = 30 * 60 * 1000; // 30 minutes
  private maxSubscriptionAge: number = 5 * 60 * 1000; // 5 minutes
  private maxInactiveTime: number = 10 * 60 * 1000; // 10 minutes
  private isMonitoring: boolean = true;
  private isAlerting: boolean = true;
  private lastCleanupTime: number = Date.now();
  private memoryMonitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.setupMemoryMonitoring();
  }

  static getInstance(): MemoryManagementService {
    if (!MemoryManagementService.instance) {
      MemoryManagementService.instance = new MemoryManagementService();
    }
    return MemoryManagementService.instance;
  }

  /**
   * Register a subscription with memory management
   */
  public registerSubscription(
    id: string,
    componentName: string,
    unsubscribeFn: () => void
  ): void {
    // Check memory threshold
    if (this.subscriptions.size >= this.memoryThreshold) {
      this.performCleanup();
    }

    const subscriptionInfo: SubscriptionInfo = {
      id,
      componentName,
      unsubscribeFn,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      memoryUsage: this.estimateMemoryUsage(componentName),
      isActive: true
    };

    this.subscriptions.set(id, subscriptionInfo);
    this.setupCleanupInterval(id);
    
    console.log(`[MemoryManagementService] Registered subscription: ${id} for ${componentName}`);
  }

  /**
   * Unregister a subscription and cleanup resources
   */
  public unregisterSubscription(id: string): void {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      try {
        subscription.unsubscribeFn();
        subscription.isActive = false;
      } catch (error) {
        console.error('[MemoryManagementService] Error unsubscribing:', error);
      }
      
      this.subscriptions.delete(id);
      
      // Clear cleanup interval
      const interval = this.cleanupIntervals.get(id);
      if (interval) {
        clearTimeout(interval);
        this.cleanupIntervals.delete(id);
      }

      console.log(`[MemoryManagementService] Unregistered subscription: ${id}`);
    }
  }

  /**
   * Update subscription access time
   */
  public updateSubscriptionAccess(id: string): void {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      subscription.lastAccessed = Date.now();
      subscription.memoryUsage = this.estimateMemoryUsage(subscription.componentName);
    }
  }

  /**
   * Perform comprehensive memory cleanup
   */
  public performCleanup(): void {
    const now = Date.now();
    const cleanedSubscriptions: string[] = [];

    for (const [id, subscription] of this.subscriptions.entries()) {
      const age = now - subscription.createdAt;
      const inactiveTime = now - subscription.lastAccessed;
      
      if (age > this.maxSubscriptionAge || inactiveTime > this.maxInactiveTime) {
        this.unregisterSubscription(id);
        cleanedSubscriptions.push(id);
      }
    }

    this.lastCleanupTime = now;
    
    if (cleanedSubscriptions.length > 0) {
      console.log(`[MemoryManagementService] Cleaned up ${cleanedSubscriptions.length} subscriptions`);
      this.emit('cleanup', { cleanedSubscriptions, timestamp: now });
    }
  }

  /**
   * Force cleanup of all subscriptions
   */
  public forceCleanup(): void {
    const subscriptionIds = Array.from(this.subscriptions.keys());
    
    for (const id of subscriptionIds) {
      this.unregisterSubscription(id);
    }

    console.log(`[MemoryManagementService] Force cleaned up ${subscriptionIds.length} subscriptions`);
    this.emit('forceCleanup', { cleanedCount: subscriptionIds.length, timestamp: Date.now() });
  }

  /**
   * Get comprehensive memory statistics
   */
  public getMemoryStats(): MemoryStats {
    const totalMemoryUsage = Array.from(this.subscriptions.values())
      .reduce((total, sub) => total + sub.memoryUsage, 0);
    
    const averageMemoryPerSubscription = this.subscriptions.size > 0 
      ? totalMemoryUsage / this.subscriptions.size 
      : 0;

    const memoryUsage = process.memoryUsage();
    const isHealthy = this.isMemoryHealthy(memoryUsage);

    return {
      activeSubscriptions: this.subscriptions.size,
      totalMemoryUsage,
      averageMemoryPerSubscription,
      memoryThreshold: this.memoryThreshold,
      cleanupIntervals: this.cleanupIntervals.size,
      lastCleanupTime: this.lastCleanupTime,
      memoryUsage,
      isHealthy
    };
  }

  /**
   * Check if memory usage is healthy
   */
  private isMemoryHealthy(memoryUsage: NodeJS.MemoryUsage): boolean {
    return memoryUsage.heapUsed < this.memoryUsageThreshold;
  }

  /**
   * Estimate memory usage for a component
   */
  private estimateMemoryUsage(componentName: string): number {
    // Base memory estimation based on component type
    const baseMemoryMap: Record<string, number> = {
      'EnterpriseFilterSidebar': 1024 * 1024, // 1MB
      'HierarchicalCategorySidebar': 512 * 1024, // 512KB
      'FilterSidebar': 768 * 1024, // 768KB
      'UnifiedFilterSidebar': 1024 * 1024, // 1MB
      'useUnifiedFilterState': 256 * 1024, // 256KB
      'useFilterState': 256 * 1024, // 256KB
      'default': 512 * 1024 // 512KB default
    };

    return baseMemoryMap[componentName] || baseMemoryMap.default;
  }

  /**
   * Setup cleanup interval for a subscription
   */
  private setupCleanupInterval(id: string): void {
    const interval = setTimeout(() => {
      this.unregisterSubscription(id);
    }, this.cleanupInterval);
    
    this.cleanupIntervals.set(id, interval);
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.memoryMonitoringInterval = setInterval(() => {
      this.checkMemoryHealth();
    }, 60 * 1000); // Check every minute
  }

  /**
   * Check memory health and emit alerts if needed
   */
  private checkMemoryHealth(): void {
    const memoryUsage = process.memoryUsage();
    const stats = this.getMemoryStats();

    if (!this.isMemoryHealthy(memoryUsage)) {
      const alert: MemoryAlert = {
        type: 'CRITICAL',
        message: `Memory usage exceeded threshold: ${memoryUsage.heapUsed} bytes`,
        timestamp: Date.now(),
        memoryUsage: memoryUsage.heapUsed,
        threshold: this.memoryUsageThreshold
      };

      this.emit('memoryAlert', alert);
      console.error('[MemoryManagementService] Memory alert:', alert);
    } else if (stats.activeSubscriptions > this.memoryThreshold * 0.8) {
      const alert: MemoryAlert = {
        type: 'WARNING',
        message: `Subscription count approaching threshold: ${stats.activeSubscriptions}/${this.memoryThreshold}`,
        timestamp: Date.now(),
        memoryUsage: memoryUsage.heapUsed,
        threshold: this.memoryThreshold
      };

      this.emit('memoryAlert', alert);
      console.warn('[MemoryManagementService] Memory warning:', alert);
    }
  }

  /**
   * Get subscription information
   */
  public getSubscriptionInfo(id: string): SubscriptionInfo | null {
    return this.subscriptions.get(id) || null;
  }

  /**
   * Get all active subscriptions
   */
  public getActiveSubscriptions(): SubscriptionInfo[] {
    return Array.from(this.subscriptions.values()).filter(sub => sub.isActive);
  }

  /**
   * Get subscriptions by component name
   */
  public getSubscriptionsByComponent(componentName: string): SubscriptionInfo[] {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.componentName === componentName && sub.isActive);
  }

  /**
   * Set memory management configuration
   */
  public setConfig(config: Partial<MemoryConfig>): void {
    if (config.maxSubscriptions !== undefined) {
      this.memoryThreshold = config.maxSubscriptions;
    }
    
    if (config.memoryThreshold !== undefined) {
      this.memoryUsageThreshold = config.memoryThreshold;
    }
    
    if (config.cleanupInterval !== undefined) {
      this.cleanupInterval = config.cleanupInterval;
    }
    
    if (config.maxSubscriptionAge !== undefined) {
      this.maxSubscriptionAge = config.maxSubscriptionAge;
    }
    
    if (config.maxInactiveTime !== undefined) {
      this.maxInactiveTime = config.maxInactiveTime;
    }
    
    if (config.enableMonitoring !== undefined) {
      this.isMonitoring = config.enableMonitoring;
      if (this.isMonitoring && !this.memoryMonitoringInterval) {
        this.setupMemoryMonitoring();
      } else if (!this.isMonitoring && this.memoryMonitoringInterval) {
        clearInterval(this.memoryMonitoringInterval);
        this.memoryMonitoringInterval = null;
      }
    }
    
    if (config.enableAlerts !== undefined) {
      this.isAlerting = config.enableAlerts;
    }

    console.log('[MemoryManagementService] Configuration updated:', config);
  }

  /**
   * Get current configuration
   */
  public getConfig(): MemoryConfig {
    return {
      maxSubscriptions: this.memoryThreshold,
      memoryThreshold: this.memoryUsageThreshold,
      cleanupInterval: this.cleanupInterval,
      maxSubscriptionAge: this.maxSubscriptionAge,
      maxInactiveTime: this.maxInactiveTime,
      enableMonitoring: this.isMonitoring,
      enableAlerts: this.isAlerting
    };
  }

  /**
   * Cleanup service on shutdown
   */
  public cleanup(): void {
    // Clear all intervals
    for (const interval of this.cleanupIntervals.values()) {
      clearTimeout(interval);
    }
    this.cleanupIntervals.clear();

    // Clear monitoring interval
    if (this.memoryMonitoringInterval) {
      clearInterval(this.memoryMonitoringInterval);
      this.memoryMonitoringInterval = null;
    }

    // Force cleanup all subscriptions
    this.forceCleanup();

    console.log('[MemoryManagementService] Cleanup completed');
  }

  /**
   * Get memory usage breakdown
   */
  public getMemoryBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    for (const subscription of this.subscriptions.values()) {
      const component = subscription.componentName;
      breakdown[component] = (breakdown[component] || 0) + subscription.memoryUsage;
    }
    
    return breakdown;
  }

  /**
   * Check if subscription exists and is active
   */
  public isSubscriptionActive(id: string): boolean {
    const subscription = this.subscriptions.get(id);
    return subscription?.isActive || false;
  }

  /**
   * Get subscription count by component
   */
  public getSubscriptionCountByComponent(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const subscription of this.subscriptions.values()) {
      const component = subscription.componentName;
      counts[component] = (counts[component] || 0) + 1;
    }
    
    return counts;
  }
}

// ===== MEMORY UTILITY FUNCTIONS =====

export const createMemoryId = (): string => {
  return `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatMemoryUsage = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export const calculateMemoryEfficiency = (stats: MemoryStats): number => {
  if (stats.activeSubscriptions === 0) {
    return 100;
  }
  
  const efficiency = (stats.totalMemoryUsage / stats.activeSubscriptions) / 1024; // KB per subscription
  return Math.max(0, Math.min(100, 100 - efficiency));
};

export const isMemoryCritical = (stats: MemoryStats): boolean => {
  return !stats.isHealthy || stats.activeSubscriptions >= stats.memoryThreshold * 0.95;
};

export const getMemoryRecommendations = (stats: MemoryStats): string[] => {
  const recommendations: string[] = [];
  
  if (!stats.isHealthy) {
    recommendations.push('Memory usage is critical - consider reducing component complexity');
  }
  
  if (stats.activeSubscriptions >= stats.memoryThreshold * 0.8) {
    recommendations.push('Subscription count is high - review component lifecycle management');
  }
  
  if (stats.averageMemoryPerSubscription > 1024 * 1024) { // 1MB
    recommendations.push('Average memory per subscription is high - optimize component memory usage');
  }
  
  return recommendations;
}; 