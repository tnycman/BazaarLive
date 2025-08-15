// Centralized Fashion Route Service - Single source of truth for fashion routing
// Implements best practices for URL generation and validation
//
// @deprecated This service is being replaced by UnifiedCategoryRoutingService
// for consistency across all categories. Use UnifiedCategoryRoutingService instead.
// Migration: Replace fashionRouteService.generateFashionUrl() with 
// unifiedCategoryRoutingService.generateCategoryRoute()

export interface FashionRouteParams {
  section: string;
  subsection?: string;
  leaf?: string;
}

export interface FashionRouteConfig {
  section: string;
  displayName: string;
  path: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export class FashionRouteService {
  private static instance: FashionRouteService;
  private routeConfigs: Map<string, FashionRouteConfig> = new Map();

  private constructor() {
    this.initializeRouteConfigs();
  }

  public static getInstance(): FashionRouteService {
    if (!FashionRouteService.instance) {
      FashionRouteService.instance = new FashionRouteService();
    }
    return FashionRouteService.instance;
  }

  private initializeRouteConfigs(): void {
    const configs: FashionRouteConfig[] = [
      {
        section: 'women',
        displayName: 'Women',
        path: '/fashion/women',
        metadata: {
          title: "Women's Fashion - Clothing, Shoes & Accessories",
          description: "Shop women's clothing, shoes, bags, jewelry and accessories from top brands.",
          keywords: ['womens fashion', 'womens clothing', 'womens shoes', 'womens accessories', 'womens bags']
        }
      },
      {
        section: 'men',
        displayName: 'Men',
        path: '/fashion/men',
        metadata: {
          title: "Men's Fashion - Clothing, Shoes & Accessories",
          description: "Shop men's clothing, shoes, bags and accessories from top brands.",
          keywords: ['mens fashion', 'mens clothing', 'mens shoes', 'mens accessories', 'mens bags']
        }
      },
      {
        section: 'kids',
        displayName: 'Kids',
        path: '/fashion/kids',
        metadata: {
          title: "Kids' Fashion - Clothing, Shoes & Accessories",
          description: "Shop kids' clothing, shoes and accessories from top brands.",
          keywords: ['kids fashion', 'kids clothing', 'kids shoes', 'kids accessories', 'childrens clothing']
        }
      },
      {
        section: 'home',
        displayName: 'Home',
        path: '/fashion/home',
        metadata: {
          title: "Home & Garden - Furniture, Decor & Kitchen",
          description: "Shop home furniture, decor, kitchen items and garden supplies.",
          keywords: ['home decor', 'furniture', 'kitchen', 'garden', 'home accessories']
        }
      },
      {
        section: 'electronics',
        displayName: 'Electronics',
        path: '/fashion/electronics',
        metadata: {
          title: "Electronics - Phones, Computers & Gaming",
          description: "Shop electronics including phones, computers, gaming and accessories.",
          keywords: ['electronics', 'phones', 'computers', 'gaming', 'tech accessories']
        }
      },
      {
        section: 'pets',
        displayName: 'Pets',
        path: '/fashion/pets',
        metadata: {
          title: "Pet Supplies - Food, Toys & Accessories",
          description: "Shop pet supplies including food, toys, beds and accessories for all pets.",
          keywords: ['pet supplies', 'dog supplies', 'cat supplies', 'pet food', 'pet toys']
        }
      },
      {
        section: 'beauty',
        displayName: 'Beauty & Wellness',
        path: '/fashion/beauty',
        metadata: {
          title: "Beauty & Wellness - Skincare, Makeup & Wellness",
          description: "Shop beauty products, skincare, makeup and wellness items.",
          keywords: ['beauty', 'skincare', 'makeup', 'wellness', 'cosmetics']
        }
      },
      {
        section: 'sports',
        displayName: 'Sports & Outdoors',
        path: '/fashion/sports',
        metadata: {
          title: "Sports & Outdoors - Athletic Gear & Equipment",
          description: "Shop sports equipment, outdoor gear and athletic apparel.",
          keywords: ['sports', 'outdoors', 'athletic gear', 'fitness', 'outdoor equipment']
        }
      }
    ];

    configs.forEach(config => {
      this.routeConfigs.set(config.section, config);
    });
  }

  /**
   * Generate fashion URL with standardized parameters
   * @param section - Main category section (e.g., 'women', 'men')
   * @param subsection - Optional subcategory (e.g., 'bags', 'shoes')
   * @param leaf - Optional leaf category (e.g., 'backpacks', 'heels')
   * @returns Standardized fashion URL
   * @deprecated Use UnifiedCategoryRoutingService.generateCategoryRoute() instead
   */
  public generateFashionUrl(section: string, subsection?: string, leaf?: string): string {
    const normalizedSection = this.normalizeSection(section);
    const normalizedSubsection = subsection ? this.normalizeSubsection(subsection) : '';
    const normalizedLeaf = leaf ? this.normalizeLeaf(leaf) : '';

    let url = `/fashion/${normalizedSection}`;
    
    if (normalizedSubsection) {
      url += `/${normalizedSubsection}`;
    }
    
    if (normalizedLeaf) {
      url += `/${normalizedLeaf}`;
    }

    return url;
  }

  /**
   * Parse fashion URL parameters with validation
   * @param url - Fashion URL to parse
   * @returns Parsed route parameters or null if invalid
   */
  public parseFashionUrl(url: string): FashionRouteParams | null {
    const segments = url.split('/').filter(Boolean);
    
    if (segments.length < 2 || segments[0] !== 'fashion') {
      return null;
    }

    const section = segments[1];
    if (!this.isValidSection(section)) {
      return null;
    }

    const params: FashionRouteParams = {
      section: this.normalizeSection(section)
    };

    if (segments.length >= 3) {
      params.subsection = this.normalizeSubsection(segments[2]);
    }

    if (segments.length >= 4) {
      params.leaf = this.normalizeLeaf(segments[3]);
    }

    return params;
  }

  /**
   * Get route configuration for a section
   * @param section - Section identifier
   * @returns Route configuration or undefined if not found
   */
  public getRouteConfig(section: string): FashionRouteConfig | undefined {
    const normalizedSection = this.normalizeSection(section);
    return this.routeConfigs.get(normalizedSection);
  }

  /**
   * Get all available fashion sections
   * @returns Array of all fashion section configurations
   */
  public getAllSections(): FashionRouteConfig[] {
    return Array.from(this.routeConfigs.values());
  }

  /**
   * Validate if a section is supported
   * @param section - Section to validate
   * @returns True if section is valid
   */
  public isValidSection(section: string): boolean {
    const normalizedSection = this.normalizeSection(section);
    return this.routeConfigs.has(normalizedSection);
  }

  /**
   * Get metadata for a fashion route
   * @param section - Main section
   * @param subsection - Optional subsection
   * @param leaf - Optional leaf category
   * @returns Route metadata
   */
  public getRouteMetadata(section: string, subsection?: string, leaf?: string): {
    title: string;
    description: string;
    keywords: string[];
  } {
    const config = this.getRouteConfig(section);
    if (!config) {
      return {
        title: "Fashion - Clothing, Shoes & Accessories",
        description: "Shop fashion items including clothing, shoes and accessories.",
        keywords: ['fashion', 'clothing', 'shoes', 'accessories']
      };
    }

    let title = config.metadata.title;
    let description = config.metadata.description;
    let keywords = [...config.metadata.keywords];

    if (subsection) {
      const subsectionTitle = this.capitalize(subsection);
      title = `${subsectionTitle} - ${title}`;
      description = `Shop ${subsection} in our ${config.displayName.toLowerCase()} section. ${description}`;
      keywords.unshift(subsection);
    }

    if (leaf) {
      const leafTitle = this.capitalize(leaf);
      title = `${leafTitle} - ${title}`;
      description = `Shop ${leaf} in our ${subsection || config.displayName.toLowerCase()} section. ${description}`;
      keywords.unshift(leaf);
    }

    return { title, description, keywords };
  }

  /**
   * Normalize section parameter for consistent URL generation
   * @param section - Raw section parameter
   * @returns Normalized section
   */
  private normalizeSection(section: string): string {
    return section.toLowerCase().trim();
  }

  /**
   * Normalize subsection parameter for consistent URL generation
   * @param subsection - Raw subsection parameter
   * @returns Normalized subsection
   */
  private normalizeSubsection(subsection: string): string {
    return subsection.toLowerCase().trim();
  }

  /**
   * Normalize leaf parameter for consistent URL generation
   * @param leaf - Raw leaf parameter
   * @returns Normalized leaf
   */
  private normalizeLeaf(leaf: string): string {
    return leaf.toLowerCase().trim();
  }

  /**
   * Capitalize first letter of string
   * @param text - Text to capitalize
   * @returns Capitalized text
   */
  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}

// Export singleton instance
export const fashionRouteService = FashionRouteService.getInstance();




