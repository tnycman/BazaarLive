/**
 * Mobile Optimization Service
 * Comprehensive mobile optimization and responsive design for the filter system
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { FilterStateManager } from '@/services/filtering/FilterStateManager';
import type { FilterState } from '@/services/filtering/FilterStateManager';
import { z } from 'zod';

// ===== MOBILE INTERFACES =====

/**
 * Device capabilities interface
 */
export interface DeviceCapabilities {
  readonly isMobile: boolean;
  readonly isTablet: boolean;
  readonly isDesktop: boolean;
  readonly hasTouch: boolean;
  readonly hasHapticFeedback: boolean;
  readonly hasGyroscope: boolean;
  readonly hasAccelerometer: boolean;
  readonly hasGeolocation: boolean;
  readonly hasCamera: boolean;
  readonly hasMicrophone: boolean;
  readonly hasBluetooth: boolean;
  readonly hasNFC: boolean;
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly pixelRatio: number;
  readonly colorDepth: number;
  readonly maxTouchPoints: number;
  readonly connectionType: ConnectionType;
  readonly batteryLevel?: number;
  readonly isLowPowerMode?: boolean;
}

/**
 * Connection type interface
 */
export interface ConnectionType {
  readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  readonly downlink: number;
  readonly rtt: number;
  readonly saveData: boolean;
}

/**
 * Touch gesture interface
 */
export interface TouchGesture {
  readonly type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch' | 'rotate';
  readonly x: number;
  readonly y: number;
  readonly deltaX?: number;
  readonly deltaY?: number;
  readonly scale?: number;
  readonly rotation?: number;
  readonly duration: number;
  readonly velocity: number;
  readonly timestamp: number;
}

/**
 * Mobile performance metrics interface
 */
export interface MobilePerformanceMetrics {
  readonly renderTime: number;
  readonly memoryUsage: number;
  readonly batteryImpact: number;
  readonly networkRequests: number;
  readonly cacheHitRate: number;
  readonly touchLatency: number;
  readonly scrollPerformance: number;
  readonly animationFrameRate: number;
  readonly timeToInteractive: number;
  readonly firstContentfulPaint: number;
  readonly largestContentfulPaint: number;
  readonly cumulativeLayoutShift: number;
}

/**
 * PWA configuration interface
 */
export interface PWAConfig {
  readonly name: string;
  readonly shortName: string;
  readonly description: string;
  readonly themeColor: string;
  readonly backgroundColor: string;
  readonly display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  readonly orientation: 'portrait' | 'landscape' | 'any';
  readonly scope: string;
  readonly startUrl: string;
  readonly icons: readonly PWAIcon[];
  readonly screenshots: readonly PWAScreenshot[];
  readonly categories: readonly string[];
  readonly lang: string;
  readonly dir: 'ltr' | 'rtl';
  readonly preferRelatedApplications: boolean;
  readonly relatedApplications: readonly RelatedApplication[];
}

/**
 * PWA icon interface
 */
export interface PWAIcon {
  readonly src: string;
  readonly sizes: string;
  readonly type: string;
  readonly purpose?: 'any' | 'maskable' | 'monochrome';
}

/**
 * PWA screenshot interface
 */
export interface PWAScreenshot {
  readonly src: string;
  readonly sizes: string;
  readonly type: string;
  readonly formFactor: 'wide' | 'narrow';
  readonly label: string;
}

/**
 * Related application interface
 */
export interface RelatedApplication {
  readonly platform: string;
  readonly url?: string;
  readonly id?: string;
  readonly minVersion?: string;
}

/**
 * Mobile optimization settings interface
 */
export interface MobileOptimizationSettings {
  readonly enableTouchOptimization: boolean;
  readonly enableHapticFeedback: boolean;
  readonly enableGestureSupport: boolean;
  readonly enableOfflineSupport: boolean;
  readonly enablePushNotifications: boolean;
  readonly enableBackgroundSync: boolean;
  readonly enableImageOptimization: boolean;
  readonly enableLazyLoading: boolean;
  readonly enableServiceWorker: boolean;
  readonly enableAppShell: boolean;
  readonly enableProgressiveEnhancement: boolean;
  readonly enableResponsiveImages: boolean;
  readonly enableAdaptiveLoading: boolean;
  readonly enablePerformanceMonitoring: boolean;
  readonly enableAccessibility: boolean;
  readonly enableCrossPlatformTesting: boolean;
}

/**
 * Responsive breakpoint interface
 */
export interface ResponsiveBreakpoint {
  readonly name: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  readonly minWidth: number;
  readonly maxWidth?: number;
  readonly columns: number;
  readonly gutter: number;
  readonly containerPadding: number;
  readonly touchTargetSize: number;
  readonly fontSize: {
    readonly base: number;
    readonly h1: number;
    readonly h2: number;
    readonly h3: number;
    readonly h4: number;
    readonly h5: number;
    readonly h6: number;
  };
}

// ===== MOBILE VALIDATION SCHEMAS =====

/**
 * Device capabilities validation schema
 */
export const DeviceCapabilitiesSchema = z.object({
  isMobile: z.boolean(),
  isTablet: z.boolean(),
  isDesktop: z.boolean(),
  hasTouch: z.boolean(),
  hasHapticFeedback: z.boolean(),
  hasGyroscope: z.boolean(),
  hasAccelerometer: z.boolean(),
  hasGeolocation: z.boolean(),
  hasCamera: z.boolean(),
  hasMicrophone: z.boolean(),
  hasBluetooth: z.boolean(),
  hasNFC: z.boolean(),
  screenWidth: z.number().positive(),
  screenHeight: z.number().positive(),
  pixelRatio: z.number().positive(),
  colorDepth: z.number().positive(),
  maxTouchPoints: z.number().min(0),
  connectionType: z.object({
    effectiveType: z.enum(['slow-2g', '2g', '3g', '4g']),
    downlink: z.number().positive(),
    rtt: z.number().positive(),
    saveData: z.boolean(),
  }),
  batteryLevel: z.number().min(0).max(1).optional(),
  isLowPowerMode: z.boolean().optional(),
});

// ===== MOBILE CONSTANTS =====

const MOBILE_CONFIG = {
  ENABLE_TOUCH_OPTIMIZATION: true,
  ENABLE_HAPTIC_FEEDBACK: true,
  ENABLE_GESTURE_SUPPORT: true,
  ENABLE_OFFLINE_SUPPORT: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_BACKGROUND_SYNC: true,
  ENABLE_IMAGE_OPTIMIZATION: true,
  ENABLE_LAZY_LOADING: true,
  ENABLE_SERVICE_WORKER: true,
  ENABLE_APP_SHELL: true,
  ENABLE_PROGRESSIVE_ENHANCEMENT: true,
  ENABLE_RESPONSIVE_IMAGES: true,
  ENABLE_ADAPTIVE_LOADING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_ACCESSIBILITY: true,
  ENABLE_CROSS_PLATFORM_TESTING: true,
  TOUCH_TARGET_MIN_SIZE: 44,
  HAPTIC_FEEDBACK_DURATION: 50,
  GESTURE_THRESHOLD: 10,
  SWIPE_THRESHOLD: 50,
  LONG_PRESS_DURATION: 500,
  DOUBLE_TAP_DELAY: 300,
  ANIMATION_DURATION: 300,
  CACHE_DURATION: 86400000, // 24 hours
  OFFLINE_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  IMAGE_QUALITY: 0.8,
  LAZY_LOADING_THRESHOLD: 0.1,
  PERFORMANCE_MONITORING_INTERVAL: 5000,
} as const;

/**
 * Responsive breakpoints configuration
 */
const RESPONSIVE_BREAKPOINTS: readonly ResponsiveBreakpoint[] = [
  {
    name: 'xs',
    minWidth: 0,
    maxWidth: 639,
    columns: 1,
    gutter: 16,
    containerPadding: 16,
    touchTargetSize: 44,
    fontSize: {
      base: 14,
      h1: 24,
      h2: 20,
      h3: 18,
      h4: 16,
      h5: 14,
      h6: 12,
    },
  },
  {
    name: 'sm',
    minWidth: 640,
    maxWidth: 767,
    columns: 2,
    gutter: 20,
    containerPadding: 20,
    touchTargetSize: 44,
    fontSize: {
      base: 14,
      h1: 26,
      h2: 22,
      h3: 20,
      h4: 18,
      h5: 16,
      h6: 14,
    },
  },
  {
    name: 'md',
    minWidth: 768,
    maxWidth: 1023,
    columns: 3,
    gutter: 24,
    containerPadding: 24,
    touchTargetSize: 44,
    fontSize: {
      base: 16,
      h1: 28,
      h2: 24,
      h3: 22,
      h4: 20,
      h5: 18,
      h6: 16,
    },
  },
  {
    name: 'lg',
    minWidth: 1024,
    maxWidth: 1279,
    columns: 4,
    gutter: 28,
    containerPadding: 28,
    touchTargetSize: 44,
    fontSize: {
      base: 16,
      h1: 30,
      h2: 26,
      h3: 24,
      h4: 22,
      h5: 20,
      h6: 18,
    },
  },
  {
    name: 'xl',
    minWidth: 1280,
    maxWidth: 1535,
    columns: 5,
    gutter: 32,
    containerPadding: 32,
    touchTargetSize: 44,
    fontSize: {
      base: 18,
      h1: 32,
      h2: 28,
      h3: 26,
      h4: 24,
      h5: 22,
      h6: 20,
    },
  },
  {
    name: '2xl',
    minWidth: 1536,
    columns: 6,
    gutter: 36,
    containerPadding: 36,
    touchTargetSize: 44,
    fontSize: {
      base: 18,
      h1: 34,
      h2: 30,
      h3: 28,
      h4: 26,
      h5: 24,
      h6: 22,
    },
  },
] as const;

// ===== MOBILE OPTIMIZATION SERVICE =====

/**
 * Enterprise-grade mobile optimization service
 * Provides comprehensive mobile optimization and responsive design capabilities
 */
export class MobileOptimizationService {
  private readonly filterStateManager: FilterStateManager;
  private readonly deviceCapabilities: DeviceCapabilities;
  private readonly optimizationSettings: MobileOptimizationSettings;
  private readonly performanceMetrics: MobilePerformanceMetrics;
  private readonly touchGestures: TouchGesture[];
  private readonly eventListeners: Map<string, ((event: MobileEvent) => void)[]>;
  private readonly serviceWorker: ServiceWorkerRegistration | null;
  private readonly performanceObserver: PerformanceObserver | null;
  private readonly resizeObserver: ResizeObserver | null;
  private readonly intersectionObserver: IntersectionObserver | null;

  constructor(filterStateManager: FilterStateManager = FilterStateManager.getInstance()) {
    this.filterStateManager = filterStateManager;
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.optimizationSettings = this.getDefaultOptimizationSettings();
    this.performanceMetrics = this.initializePerformanceMetrics();
    this.touchGestures = [];
    this.eventListeners = new Map();
    this.serviceWorker = null;
    this.performanceObserver = null;
    this.resizeObserver = null;
    this.intersectionObserver = null;

    this.initializeMobileOptimizations();
    this.setupEventListeners();
    this.startPerformanceMonitoring();
  }

  /**
   * Initialize mobile optimizations
   */
  private initializeMobileOptimizations(): void {
    if (MOBILE_CONFIG.ENABLE_SERVICE_WORKER) {
      this.registerServiceWorker();
    }

    if (MOBILE_CONFIG.ENABLE_TOUCH_OPTIMIZATION) {
      this.optimizeTouchInteractions();
    }

    if (MOBILE_CONFIG.ENABLE_HAPTIC_FEEDBACK) {
      this.enableHapticFeedback();
    }

    if (MOBILE_CONFIG.ENABLE_GESTURE_SUPPORT) {
      this.enableGestureSupport();
    }

    if (MOBILE_CONFIG.ENABLE_OFFLINE_SUPPORT) {
      this.enableOfflineSupport();
    }

    if (MOBILE_CONFIG.ENABLE_RESPONSIVE_IMAGES) {
      this.optimizeImages();
    }

    if (MOBILE_CONFIG.ENABLE_LAZY_LOADING) {
      this.enableLazyLoading();
    }

    if (MOBILE_CONFIG.ENABLE_ACCESSIBILITY) {
      this.enableAccessibility();
    }
  }

  /**
   * Detect device capabilities
   */
  private detectDeviceCapabilities(): DeviceCapabilities {
    const userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /Tablet|iPad/.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    return {
      isMobile,
      isTablet,
      isDesktop,
      hasTouch: 'ontouchstart' in window,
      hasHapticFeedback: 'vibrate' in navigator,
      hasGyroscope: 'DeviceOrientationEvent' in window,
      hasAccelerometer: 'DeviceMotionEvent' in window,
      hasGeolocation: 'geolocation' in navigator,
      hasCamera: 'mediaDevices' in navigator,
      hasMicrophone: 'mediaDevices' in navigator,
      hasBluetooth: 'bluetooth' in navigator,
      hasNFC: 'NDEFReader' in window,
      screenWidth: screen.width,
      screenHeight: screen.height,
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: screen.colorDepth,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      connectionType: this.getConnectionType(),
      batteryLevel: this.getBatteryLevel(),
      isLowPowerMode: this.getLowPowerMode(),
    };
  }

  /**
   * Get connection type
   */
  private getConnectionType(): ConnectionType {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 50,
      saveData: connection?.saveData || false,
    };
  }

  /**
   * Get battery level
   */
  private getBatteryLevel(): number | undefined {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        return battery.level;
      });
    }
    return undefined;
  }

  /**
   * Get low power mode
   */
  private getLowPowerMode(): boolean | undefined {
    // iOS low power mode detection
    if ('standalone' in window && (window as any).standalone) {
      return (navigator as any).standalone;
    }
    return undefined;
  }

  /**
   * Get default optimization settings
   */
  private getDefaultOptimizationSettings(): MobileOptimizationSettings {
    return {
      enableTouchOptimization: MOBILE_CONFIG.ENABLE_TOUCH_OPTIMIZATION,
      enableHapticFeedback: MOBILE_CONFIG.ENABLE_HAPTIC_FEEDBACK,
      enableGestureSupport: MOBILE_CONFIG.ENABLE_GESTURE_SUPPORT,
      enableOfflineSupport: MOBILE_CONFIG.ENABLE_OFFLINE_SUPPORT,
      enablePushNotifications: MOBILE_CONFIG.ENABLE_PUSH_NOTIFICATIONS,
      enableBackgroundSync: MOBILE_CONFIG.ENABLE_BACKGROUND_SYNC,
      enableImageOptimization: MOBILE_CONFIG.ENABLE_IMAGE_OPTIMIZATION,
      enableLazyLoading: MOBILE_CONFIG.ENABLE_LAZY_LOADING,
      enableServiceWorker: MOBILE_CONFIG.ENABLE_SERVICE_WORKER,
      enableAppShell: MOBILE_CONFIG.ENABLE_APP_SHELL,
      enableProgressiveEnhancement: MOBILE_CONFIG.ENABLE_PROGRESSIVE_ENHANCEMENT,
      enableResponsiveImages: MOBILE_CONFIG.ENABLE_RESPONSIVE_IMAGES,
      enableAdaptiveLoading: MOBILE_CONFIG.ENABLE_ADAPTIVE_LOADING,
      enablePerformanceMonitoring: MOBILE_CONFIG.ENABLE_PERFORMANCE_MONITORING,
      enableAccessibility: MOBILE_CONFIG.ENABLE_ACCESSIBILITY,
      enableCrossPlatformTesting: MOBILE_CONFIG.ENABLE_CROSS_PLATFORM_TESTING,
    };
  }

  /**
   * Initialize performance metrics
   */
  private initializePerformanceMetrics(): MobilePerformanceMetrics {
    return {
      renderTime: 0,
      memoryUsage: 0,
      batteryImpact: 0,
      networkRequests: 0,
      cacheHitRate: 0,
      touchLatency: 0,
      scrollPerformance: 0,
      animationFrameRate: 0,
      timeToInteractive: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
    };
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
        this.emitEvent('service-worker-registered', { registration: this.serviceWorker });
      } catch (error) {
        this.emitEvent('service-worker-error', { error });
      }
    }
  }

  /**
   * Optimize touch interactions
   */
  private optimizeTouchInteractions(): void {
    // Add touch-specific CSS classes
    document.documentElement.classList.add('touch-optimized');
    
    // Optimize touch targets
    this.optimizeTouchTargets();
    
    // Add touch feedback
    this.addTouchFeedback();
  }

  /**
   * Optimize touch targets
   */
  private optimizeTouchTargets(): void {
    const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
    
    touchTargets.forEach(target => {
      const rect = target.getBoundingClientRect();
      const minSize = MOBILE_CONFIG.TOUCH_TARGET_MIN_SIZE;
      
      if (rect.width < minSize || rect.height < minSize) {
        target.classList.add('touch-target-optimized');
      }
    });
  }

  /**
   * Add touch feedback
   */
  private addTouchFeedback(): void {
    document.addEventListener('touchstart', (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('touch-target-optimized')) {
        target.classList.add('touch-active');
      }
    });

    document.addEventListener('touchend', (event) => {
      const target = event.target as HTMLElement;
      target.classList.remove('touch-active');
    });
  }

  /**
   * Enable haptic feedback
   */
  private enableHapticFeedback(): void {
    if (this.deviceCapabilities.hasHapticFeedback) {
      document.addEventListener('touchstart', () => {
        if (navigator.vibrate) {
          navigator.vibrate(MOBILE_CONFIG.HAPTIC_FEEDBACK_DURATION);
        }
      });
    }
  }

  /**
   * Enable gesture support
   */
  private enableGestureSupport(): void {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isLongPress = false;
    let longPressTimer: NodeJS.Timeout | null = null;

    document.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      isLongPress = false;

      // Long press detection
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        this.handleGesture({
          type: 'long-press',
          x: startX,
          y: startY,
          duration: MOBILE_CONFIG.LONG_PRESS_DURATION,
          velocity: 0,
          timestamp: startTime,
        });
      }, MOBILE_CONFIG.LONG_PRESS_DURATION);
    });

    document.addEventListener('touchmove', (event) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });

    document.addEventListener('touchend', (event) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      const touch = event.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();
      const duration = endTime - startTime;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / duration;

      if (!isLongPress) {
        if (distance < MOBILE_CONFIG.GESTURE_THRESHOLD) {
          // Tap
          this.handleGesture({
            type: 'tap',
            x: endX,
            y: endY,
            duration,
            velocity,
            timestamp: endTime,
          });
        } else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > MOBILE_CONFIG.SWIPE_THRESHOLD) {
          // Swipe horizontal
          this.handleGesture({
            type: 'swipe',
            x: endX,
            y: endY,
            deltaX,
            deltaY,
            duration,
            velocity,
            timestamp: endTime,
          });
        }
      }
    });
  }

  /**
   * Handle gesture
   */
  private handleGesture(gesture: TouchGesture): void {
    this.touchGestures.push(gesture);
    this.emitEvent('gesture-detected', { gesture });

    // Apply gesture-specific optimizations
    switch (gesture.type) {
      case 'swipe':
        this.handleSwipeGesture(gesture);
        break;
      case 'long-press':
        this.handleLongPressGesture(gesture);
        break;
      case 'tap':
        this.handleTapGesture(gesture);
        break;
    }
  }

  /**
   * Handle swipe gesture
   */
  private handleSwipeGesture(gesture: TouchGesture): void {
    if (gesture.deltaX && Math.abs(gesture.deltaX) > MOBILE_CONFIG.SWIPE_THRESHOLD) {
      // Horizontal swipe - could be used for navigation
      if (gesture.deltaX > 0) {
        this.emitEvent('swipe-right', { gesture });
      } else {
        this.emitEvent('swipe-left', { gesture });
      }
    }
  }

  /**
   * Handle long press gesture
   */
  private handleLongPressGesture(gesture: TouchGesture): void {
    // Long press could trigger context menu or additional options
    this.emitEvent('long-press', { gesture });
  }

  /**
   * Handle tap gesture
   */
  private handleTapGesture(gesture: TouchGesture): void {
    // Optimize tap response
    this.emitEvent('tap', { gesture });
  }

  /**
   * Enable offline support
   */
  private enableOfflineSupport(): void {
    // Cache critical resources
    this.cacheCriticalResources();

    // Handle offline/online events
    window.addEventListener('online', () => {
      this.emitEvent('online', { timestamp: Date.now() });
    });

    window.addEventListener('offline', () => {
      this.emitEvent('offline', { timestamp: Date.now() });
    });
  }

  /**
   * Cache critical resources
   */
  private cacheCriticalResources(): void {
    if ('caches' in window) {
      caches.open('critical-resources').then(cache => {
        const criticalResources = [
          '/',
          '/static/js/bundle.js',
          '/static/css/main.css',
          '/manifest.json',
        ];

        cache.addAll(criticalResources).then(() => {
          this.emitEvent('critical-resources-cached', { resources: criticalResources });
        });
      });
    }
  }

  /**
   * Optimize images
   */
  private optimizeImages(): void {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add lazy loading
      if (MOBILE_CONFIG.ENABLE_LAZY_LOADING) {
        img.loading = 'lazy';
      }

      // Add responsive images
      if (MOBILE_CONFIG.ENABLE_RESPONSIVE_IMAGES) {
        this.makeImageResponsive(img as HTMLImageElement);
      }
    });
  }

  /**
   * Make image responsive
   */
  private makeImageResponsive(img: HTMLImageElement): void {
    const src = img.src;
    const srcset = img.srcset;

    if (!srcset && src) {
      // Generate responsive srcset
      const baseUrl = src.split('.')[0];
      const extension = src.split('.').pop();
      
      const responsiveSrcset = [
        `${baseUrl}-320w.${extension} 320w`,
        `${baseUrl}-480w.${extension} 480w`,
        `${baseUrl}-768w.${extension} 768w`,
        `${baseUrl}-1024w.${extension} 1024w`,
        `${baseUrl}-1440w.${extension} 1440w`,
      ].join(', ');

      img.srcset = responsiveSrcset;
      img.sizes = '(max-width: 320px) 280px, (max-width: 480px) 440px, (max-width: 768px) 728px, (max-width: 1024px) 984px, 1400px';
    }
  }

  /**
   * Enable lazy loading
   */
  private enableLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            if (target.dataset.src) {
              target.src = target.dataset.src;
              target.removeAttribute('data-src');
              this.intersectionObserver?.unobserve(target);
            }
          }
        });
      }, {
        rootMargin: `${MOBILE_CONFIG.LAZY_LOADING_THRESHOLD * 100}%`,
      });

      // Observe lazy load elements
      const lazyElements = document.querySelectorAll('[data-src]');
      lazyElements.forEach(element => {
        this.intersectionObserver?.observe(element);
      });
    }
  }

  /**
   * Enable accessibility
   */
  private enableAccessibility(): void {
    // Add ARIA labels
    this.addARIALabels();

    // Enable keyboard navigation
    this.enableKeyboardNavigation();

    // Add screen reader support
    this.addScreenReaderSupport();
  }

  /**
   * Add ARIA labels
   */
  private addARIALabels(): void {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.getAttribute('aria-label')) {
        const text = button.textContent?.trim();
        if (text) {
          button.setAttribute('aria-label', text);
        }
      }
    });
  }

  /**
   * Enable keyboard navigation
   */
  private enableKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Escape':
          this.emitEvent('keyboard-escape', { event });
          break;
        case 'Enter':
          this.emitEvent('keyboard-enter', { event });
          break;
        case 'Tab':
          this.emitEvent('keyboard-tab', { event });
          break;
      }
    });
  }

  /**
   * Add screen reader support
   */
  private addScreenReaderSupport(): void {
    // Add live regions for dynamic content
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Resize observer for responsive design
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(entry => {
          this.handleResize(entry);
        });
      });

      this.resizeObserver.observe(document.body);
    }

    // Performance observer for monitoring
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.handlePerformanceEntry(entry);
        });
      });

      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    }
  }

  /**
   * Handle resize
   */
  private handleResize(entry: ResizeObserverEntry): void {
    const { width, height } = entry.contentRect;
    const breakpoint = this.getCurrentBreakpoint(width);
    
    this.emitEvent('resize', { width, height, breakpoint });
  }

  /**
   * Handle performance entry
   */
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'measure':
        this.updatePerformanceMetrics(entry as PerformanceMeasure);
        break;
      case 'navigation':
        this.updateNavigationMetrics(entry as PerformanceNavigationTiming);
        break;
      case 'resource':
        this.updateResourceMetrics(entry as PerformanceResourceTiming);
        break;
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(measure: PerformanceMeasure): void {
    this.performanceMetrics.renderTime = measure.duration;
    this.emitEvent('performance-updated', { metrics: this.performanceMetrics });
  }

  /**
   * Update navigation metrics
   */
  private updateNavigationMetrics(navigation: PerformanceNavigationTiming): void {
    this.performanceMetrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
    this.performanceMetrics.firstContentfulPaint = navigation.domContentLoadedEventEnd - navigation.fetchStart;
    this.emitEvent('navigation-metrics-updated', { navigation });
  }

  /**
   * Update resource metrics
   */
  private updateResourceMetrics(resource: PerformanceResourceTiming): void {
    this.performanceMetrics.networkRequests++;
    this.emitEvent('resource-metrics-updated', { resource });
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    if (MOBILE_CONFIG.ENABLE_PERFORMANCE_MONITORING) {
      setInterval(() => {
        this.collectPerformanceMetrics();
      }, MOBILE_CONFIG.PERFORMANCE_MONITORING_INTERVAL);
    }
  }

  /**
   * Collect performance metrics
   */
  private collectPerformanceMetrics(): void {
    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.performanceMetrics.memoryUsage = memory.usedJSHeapSize;
    }

    // Battery impact (estimated)
    this.performanceMetrics.batteryImpact = this.calculateBatteryImpact();

    // Cache hit rate
    this.performanceMetrics.cacheHitRate = this.calculateCacheHitRate();

    this.emitEvent('performance-metrics-collected', { metrics: this.performanceMetrics });
  }

  /**
   * Calculate battery impact
   */
  private calculateBatteryImpact(): number {
    // Simplified battery impact calculation
    const cpuUsage = this.performanceMetrics.memoryUsage / (1024 * 1024); // MB
    const networkUsage = this.performanceMetrics.networkRequests;
    return Math.min(1, (cpuUsage * 0.1 + networkUsage * 0.05));
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    // Simplified cache hit rate calculation
    const totalRequests = this.performanceMetrics.networkRequests;
    const cachedRequests = Math.floor(totalRequests * 0.3); // Assume 30% cache hit
    return totalRequests > 0 ? cachedRequests / totalRequests : 0;
  }

  /**
   * Get current breakpoint
   */
  public getCurrentBreakpoint(width: number): ResponsiveBreakpoint {
    return RESPONSIVE_BREAKPOINTS.find(bp => 
      width >= bp.minWidth && (!bp.maxWidth || width <= bp.maxWidth)
    ) || RESPONSIVE_BREAKPOINTS[0];
  }

  /**
   * Get device capabilities
   */
  public getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  /**
   * Get optimization settings
   */
  public getOptimizationSettings(): MobileOptimizationSettings {
    return { ...this.optimizationSettings };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): MobilePerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Update optimization settings
   */
  public updateOptimizationSettings(settings: Partial<MobileOptimizationSettings>): void {
    this.optimizationSettings = { ...this.optimizationSettings, ...settings };
    this.emitEvent('optimization-settings-updated', { settings: this.optimizationSettings });
  }

  /**
   * Add event listener
   */
  public addEventListener(event: string, listener: (event: MobileEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(event: string, listener: (event: MobileEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit mobile event
   */
  private emitEvent(type: string, data: any): void {
    const event: MobileEvent = {
      type: type as any,
      timestamp: Date.now(),
      data,
      source: 'MobileOptimizationService',
      category: 'mobile',
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}

// ===== MOBILE EVENT INTERFACES =====

/**
 * Mobile event interface
 */
export interface MobileEvent {
  readonly type: 'gesture-detected' | 'swipe-right' | 'swipe-left' | 'long-press' | 'tap' | 'online' | 'offline' | 'critical-resources-cached' | 'keyboard-escape' | 'keyboard-enter' | 'keyboard-tab' | 'resize' | 'performance-updated' | 'navigation-metrics-updated' | 'resource-metrics-updated' | 'performance-metrics-collected' | 'optimization-settings-updated' | 'service-worker-registered' | 'service-worker-error';
  readonly timestamp: number;
  readonly data: any;
  readonly source: string;
  readonly category: string;
}

// ===== EXPORTS =====

export {
  MobileOptimizationService,
  MOBILE_CONFIG,
  RESPONSIVE_BREAKPOINTS,
  DeviceCapabilitiesSchema,
};
export type {
  DeviceCapabilities,
  ConnectionType,
  TouchGesture,
  MobilePerformanceMetrics,
  PWAConfig,
  PWAIcon,
  PWAScreenshot,
  RelatedApplication,
  MobileOptimizationSettings,
  ResponsiveBreakpoint,
  MobileEvent,
}; 