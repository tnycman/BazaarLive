// Legacy Compatibility Middleware - Enterprise-grade backward compatibility
import { Request, Response, NextFunction } from 'express';
import { Logger } from './Logger';
import { AnalyticsService } from '../services/AnalyticsService';

export interface CompatibilityConfig {
  enableDeprecationWarnings: boolean;
  enableUsageTracking: boolean;
  enableResponseHeaders: boolean;
  migrationDeadline: Date;
  supportedLegacyVersions: string[];
}

export interface LegacyApiMapping {
  oldPath: string;
  newPath: string;
  method: string;
  transformRequest?: (req: Request) => any;
  transformResponse?: (data: any) => any;
  deprecationMessage?: string;
  removalDate?: Date;
}

export class LegacyCompatibilityMiddleware {
  private logger: Logger;
  private analyticsService: AnalyticsService;
  private config: CompatibilityConfig;
  private apiMappings: LegacyApiMapping[];

  constructor(
    analyticsService: AnalyticsService,
    config: CompatibilityConfig
  ) {
    this.logger = new Logger('LegacyCompatibilityMiddleware');
    this.analyticsService = analyticsService;
    this.config = config;
    this.apiMappings = this.initializeApiMappings();
  }

  /**
   * Main middleware function for handling legacy API compatibility
   */
  handleLegacyRequests() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Check if this is a legacy API request
        const mapping = this.findApiMapping(req.path, req.method);
        
        if (!mapping) {
          // Not a legacy request, continue normally
          return next();
        }

        // Track legacy API usage
        if (this.config.enableUsageTracking) {
          await this.trackLegacyUsage(req, mapping);
        }

        // Add deprecation headers
        if (this.config.enableResponseHeaders) {
          this.addDeprecationHeaders(res, mapping);
        }

        // Log deprecation warning
        if (this.config.enableDeprecationWarnings) {
          this.logDeprecationWarning(req, mapping);
        }

        // Transform request if needed
        if (mapping.transformRequest) {
          req.body = mapping.transformRequest(req);
        }

        // Redirect to new API endpoint
        await this.redirectToNewApi(req, res, mapping);

      } catch (error) {
        this.logger.error('Legacy compatibility middleware error', {
          path: req.path,
          method: req.method,
          error: error.message
        });
        next(error);
      }
    };
  }

  /**
   * Initialize API mappings for legacy endpoints
   */
  private initializeApiMappings(): LegacyApiMapping[] {
    return [
      // Legacy listing creation (fashion only)
      {
        oldPath: '/api/listings',
        newPath: '/api/fashion/listings',
        method: 'POST',
        transformRequest: this.transformLegacyListingRequest,
        transformResponse: this.transformFashionListingResponse,
        deprecationMessage: 'POST /api/listings is deprecated for fashion items. Use POST /api/fashion/listings instead.',
        removalDate: new Date('2024-12-31')
      },
      
      // Legacy listing retrieval with fashion category
      {
        oldPath: '/api/listings',
        newPath: '/api/fashion/listings',
        method: 'GET',
        transformRequest: this.transformLegacyListingQuery,
        transformResponse: this.transformFashionListingsResponse,
        deprecationMessage: 'GET /api/listings with category=fashion is deprecated. Use GET /api/fashion/listings instead.',
        removalDate: new Date('2024-12-31')
      },

      // Legacy single listing retrieval
      {
        oldPath: '/api/listings/:id',
        newPath: '/api/fashion/listings/:id',
        method: 'GET',
        transformResponse: this.transformFashionListingResponse,
        deprecationMessage: 'GET /api/listings/:id for fashion items is deprecated. Use GET /api/fashion/listings/:id instead.',
        removalDate: new Date('2024-12-31')
      },

      // Legacy listing update
      {
        oldPath: '/api/listings/:id',
        newPath: '/api/fashion/listings/:id',
        method: 'PUT',
        transformRequest: this.transformLegacyListingRequest,
        transformResponse: this.transformFashionListingResponse,
        deprecationMessage: 'PUT /api/listings/:id for fashion items is deprecated. Use PUT /api/fashion/listings/:id instead.',
        removalDate: new Date('2024-12-31')
      },

      // Legacy listing deletion
      {
        oldPath: '/api/listings/:id',
        newPath: '/api/fashion/listings/:id',
        method: 'DELETE',
        deprecationMessage: 'DELETE /api/listings/:id for fashion items is deprecated. Use DELETE /api/fashion/listings/:id instead.',
        removalDate: new Date('2024-12-31')
      },

      // Legacy likes
      {
        oldPath: '/api/likes',
        newPath: '/api/fashion/listings/:listingId/like',
        method: 'POST',
        transformRequest: this.transformLegacyLikeRequest,
        deprecationMessage: 'POST /api/likes for fashion items is deprecated. Use POST /api/fashion/listings/:listingId/like instead.',
        removalDate: new Date('2024-12-31')
      },

      // Legacy unlike
      {
        oldPath: '/api/likes/:listingId',
        newPath: '/api/fashion/listings/:listingId/like',
        method: 'DELETE',
        deprecationMessage: 'DELETE /api/likes/:listingId for fashion items is deprecated. Use DELETE /api/fashion/listings/:listingId/like instead.',
        removalDate: new Date('2024-12-31')
      }
    ];
  }

  /**
   * Find API mapping for given path and method
   */
  private findApiMapping(path: string, method: string): LegacyApiMapping | null {
    return this.apiMappings.find(mapping => {
      // Handle parameterized paths
      const pathPattern = mapping.oldPath.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pathPattern}$`);
      return regex.test(path) && mapping.method === method;
    }) || null;
  }

  /**
   * Track usage of legacy APIs for analytics
   */
  private async trackLegacyUsage(req: Request, mapping: LegacyApiMapping): Promise<void> {
    try {
      await this.analyticsService.trackEvent('legacy_api_usage', {
        oldPath: mapping.oldPath,
        newPath: mapping.newPath,
        method: mapping.method,
        userAgent: req.get('User-Agent'),
        clientIp: req.ip,
        referer: req.get('Referer')
      });
    } catch (error) {
      this.logger.warn('Failed to track legacy API usage', {
        error: error.message,
        path: req.path
      });
    }
  }

  /**
   * Add deprecation headers to response
   */
  private addDeprecationHeaders(res: Response, mapping: LegacyApiMapping): void {
    // Standard deprecation headers
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', mapping.removalDate?.toISOString() || this.config.migrationDeadline.toISOString());
    res.setHeader('Link', `<${mapping.newPath}>; rel="successor-version"`);
    
    // Custom headers for additional information
    res.setHeader('X-API-Deprecation-Message', mapping.deprecationMessage || 'This endpoint is deprecated');
    res.setHeader('X-Migration-Guide', 'https://docs.bazaarlive.com/api/migration-guide');
    res.setHeader('X-Support-Contact', 'api-support@bazaarlive.com');
  }

  /**
   * Log deprecation warning
   */
  private logDeprecationWarning(req: Request, mapping: LegacyApiMapping): void {
    this.logger.warn('Legacy API endpoint accessed', {
      oldPath: mapping.oldPath,
      newPath: mapping.newPath,
      method: mapping.method,
      clientIp: req.ip,
      userAgent: req.get('User-Agent'),
      deprecationMessage: mapping.deprecationMessage
    });
  }

  /**
   * Redirect request to new API endpoint
   */
  private async redirectToNewApi(
    req: Request, 
    res: Response, 
    mapping: LegacyApiMapping
  ): Promise<void> {
    try {
      // Build new URL with parameters
      let newUrl = mapping.newPath;
      const pathParams = this.extractPathParams(req.path, mapping.oldPath);
      
      // Replace parameters in new path
      for (const [param, value] of Object.entries(pathParams)) {
        newUrl = newUrl.replace(`:${param}`, value);
      }

      // Add query parameters
      const queryString = new URLSearchParams(req.query as any).toString();
      if (queryString) {
        newUrl += `?${queryString}`;
      }

      // Forward the request internally
      req.url = newUrl;
      req.path = newUrl.split('?')[0];

      this.logger.debug('Redirected legacy API request', {
        oldPath: req.originalUrl,
        newPath: newUrl,
        method: req.method
      });

    } catch (error) {
      this.logger.error('Failed to redirect legacy API request', {
        oldPath: req.path,
        newPath: mapping.newPath,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Extract path parameters from URL
   */
  private extractPathParams(actualPath: string, templatePath: string): Record<string, string> {
    const params: Record<string, string> = {};
    const templateParts = templatePath.split('/');
    const actualParts = actualPath.split('/');

    for (let i = 0; i < templateParts.length; i++) {
      const templatePart = templateParts[i];
      const actualPart = actualParts[i];

      if (templatePart.startsWith(':') && actualPart) {
        const paramName = templatePart.substring(1);
        params[paramName] = actualPart;
      }
    }

    return params;
  }

  // Request transformation functions

  private transformLegacyListingRequest(req: Request): any {
    const body = req.body;

    // Only transform fashion category requests
    if (body.category !== 'fashion') {
      throw new Error('Only fashion listings are supported in the new API');
    }

    // Transform legacy request to new fashion format
    return {
      title: body.title,
      description: body.description,
      fashionCategory: body.subcategory || 'women', // Default to women if no subcategory
      subcategory: body.subSubcategory,
      brand: body.brand,
      size: body.size,
      color: body.color,
      material: body.material,
      styleTags: body.tags?.filter((tag: string) => tag.startsWith('style:')).map((tag: string) => tag.replace('style:', '')),
      condition: body.condition,
      price: body.price,
      originalPrice: body.originalPrice,
      images: body.images,
      tags: body.tags?.filter((tag: string) => !tag.startsWith('style:')),
      location: body.location,
      isPriceNegotiable: body.negotiable,
      isShippingIncluded: body.shippingIncluded
    };
  }

  private transformLegacyListingQuery(req: Request): any {
    const query = req.query;

    // Only allow fashion category queries
    if (query.category && query.category !== 'fashion') {
      throw new Error('Only fashion listings are supported in the new API');
    }

    // Transform query parameters
    const transformedQuery: any = {};

    if (query.subcategory) {
      transformedQuery.fashionCategory = query.subcategory;
    }
    if (query.subSubcategory) {
      transformedQuery.subcategory = query.subSubcategory;
    }
    if (query.brands) {
      transformedQuery.brands = query.brands;
    }
    if (query.minPrice) {
      transformedQuery.minPrice = query.minPrice;
    }
    if (query.maxPrice) {
      transformedQuery.maxPrice = query.maxPrice;
    }
    if (query.conditions) {
      transformedQuery.conditions = query.conditions;
    }

    // Update request query
    req.query = { ...req.query, ...transformedQuery };
    return req.body;
  }

  private transformLegacyLikeRequest(req: Request): any {
    // Transform like request format
    return {
      // Legacy format had listingId in body, new format uses URL parameter
    };
  }

  // Response transformation functions

  private transformFashionListingResponse(data: any): any {
    if (!data) return data;

    // Transform fashion listing back to legacy format
    return {
      id: data.id,
      sellerId: data.sellerId,
      title: data.title,
      description: data.description,
      category: 'fashion',
      subcategory: data.fashionCategory,
      subSubcategory: data.subcategory,
      brand: data.brand,
      size: data.size,
      color: data.color,
      material: data.material,
      condition: data.condition,
      price: data.price,
      originalPrice: data.originalPrice,
      images: data.images,
      tags: [
        ...(data.tags || []),
        ...(data.styleTags || []).map((tag: string) => `style:${tag}`)
      ],
      status: data.status,
      viewsCount: data.viewsCount,
      likesCount: data.likesCount,
      sharesCount: data.sharesCount,
      commentsCount: data.commentsCount,
      location: data.location,
      isPromoted: data.isPromoted,
      negotiable: data.isPriceNegotiable,
      shippingIncluded: data.isShippingIncluded,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      // Add legacy compatibility flag
      _legacy: true,
      _deprecationWarning: 'This response format is deprecated. Please migrate to the new fashion API.'
    };
  }

  private transformFashionListingsResponse(data: any): any {
    if (!data || !data.items) return data;

    return {
      ...data,
      items: data.items.map((item: any) => this.transformFashionListingResponse(item)),
      _legacy: true,
      _deprecationWarning: 'This response format is deprecated. Please migrate to the new fashion API.'
    };
  }

  /**
   * Check if a request should be blocked based on configuration
   */
  shouldBlockRequest(req: Request): boolean {
    // Block requests for unsupported legacy versions
    const clientVersion = req.get('X-API-Version');
    if (clientVersion && !this.config.supportedLegacyVersions.includes(clientVersion)) {
      return true;
    }

    // Block requests after migration deadline
    if (new Date() > this.config.migrationDeadline) {
      return true;
    }

    return false;
  }

  /**
   * Generate migration guide response
   */
  generateMigrationGuideResponse(): any {
    return {
      message: 'API Migration Required',
      migrationDeadline: this.config.migrationDeadline,
      supportedVersions: this.config.supportedLegacyVersions,
      migrationGuide: 'https://docs.bazaarlive.com/api/migration-guide',
      newApiDocumentation: 'https://docs.bazaarlive.com/api/fashion',
      contactSupport: 'api-support@bazaarlive.com',
      apiMappings: this.apiMappings.map(mapping => ({
        old: `${mapping.method} ${mapping.oldPath}`,
        new: `${mapping.method} ${mapping.newPath}`,
        deprecationMessage: mapping.deprecationMessage,
        removalDate: mapping.removalDate
      }))
    };
  }
}

// Factory function
export function createLegacyCompatibilityMiddleware(
  analyticsService: AnalyticsService,
  config?: Partial<CompatibilityConfig>
): LegacyCompatibilityMiddleware {
  const defaultConfig: CompatibilityConfig = {
    enableDeprecationWarnings: true,
    enableUsageTracking: true,
    enableResponseHeaders: true,
    migrationDeadline: new Date('2024-12-31'),
    supportedLegacyVersions: ['1.0', '1.1', '1.2']
  };

  return new LegacyCompatibilityMiddleware(
    analyticsService,
    { ...defaultConfig, ...config }
  );
}
