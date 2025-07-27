/**
 * Enterprise Category Configuration Service
 * Centralized configuration for all marketplace categories with AOP principles
 */

import { z } from 'zod';

// ============================================================================
// TYPE DEFINITIONS AND VALIDATION SCHEMAS
// ============================================================================

const CategoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  count: z.string(),
  icon: z.string().optional(),
  description: z.string().optional(),
  isPopular: z.boolean().optional(),
  isTrending: z.boolean().optional(),
});

const CategoryConfigSchema = z.object({
  title: z.string(),
  description: z.string(),
  placeholder: z.string(),
  gradient: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categories: z.array(CategoryItemSchema),
  featured: z.array(z.string()).optional(),
  trending: z.array(z.string()).optional(),
});

const VerticalConfigSchema = z.record(z.string(), CategoryConfigSchema);

export type CategoryItem = z.infer<typeof CategoryItemSchema>;
export type CategoryConfig = z.infer<typeof CategoryConfigSchema>;
export type VerticalConfig = z.infer<typeof VerticalConfigSchema>;

// ============================================================================
// ENTERPRISE CATEGORY CONFIGURATION
// ============================================================================

export const CATEGORY_CONFIGURATIONS: Record<string, VerticalConfig> = {
  fashion: {
    women: {
      title: "Women's Fashion",
      description: "Discover the latest in women's clothing, shoes, and accessories",
      placeholder: "Search women's fashion...",
      gradient: "from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900",
      metaTitle: "Women's Fashion - Designer Clothes, Shoes & Accessories | BazaarLive",
      metaDescription: "Shop authentic women's fashion from top designers. Find clothing, shoes, accessories, jewelry, and bags at great prices.",
      categories: [
        { id: 'all', name: 'All Women', count: '50K+', isPopular: true },
        { id: 'clothing', name: 'Clothing', count: '25K+', isPopular: true },
        { id: 'shoes', name: 'Shoes', count: '12K+', isPopular: true },
        { id: 'accessories', name: 'Accessories', count: '8K+' },
        { id: 'jewelry', name: 'Jewelry', count: '5K+' },
        { id: 'bags', name: 'Bags', count: '7K+', isPopular: true },
        { id: 'makeup', name: 'Makeup', count: '3K+' },
        { id: 'swimwear', name: 'Swimwear', count: '2K+' },
        { id: 'activewear', name: 'Activewear', count: '4K+', isTrending: true },
      ],
      featured: ['clothing', 'shoes', 'bags'],
      trending: ['activewear', 'jewelry']
    },
    men: {
      title: "Men's Fashion",
      description: "Discover the latest in men's clothing, shoes, and accessories",
      placeholder: "Search men's fashion...",
      gradient: "from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900",
      metaTitle: "Men's Fashion - Designer Clothes, Shoes & Accessories | BazaarLive",
      metaDescription: "Shop authentic men's fashion from top brands. Find clothing, shoes, accessories, and more at unbeatable prices.",
      categories: [
        { id: 'all', name: 'All Men', count: '30K+', isPopular: true },
        { id: 'clothing', name: 'Clothing', count: '18K+', isPopular: true },
        { id: 'shoes', name: 'Shoes', count: '8K+', isPopular: true },
        { id: 'accessories', name: 'Accessories', count: '4K+' },
        { id: 'bags', name: 'Bags', count: '2K+' },
        { id: 'watches', name: 'Watches', count: '1.5K+' },
        { id: 'activewear', name: 'Activewear', count: '3K+', isTrending: true },
        { id: 'suits', name: 'Suits', count: '1K+' },
      ],
      featured: ['clothing', 'shoes', 'accessories'],
      trending: ['activewear', 'watches']
    },
    kids: {
      title: "Kids' Fashion",
      description: "Discover clothes, shoes, toys and accessories for children of all ages",
      placeholder: "Search kids' fashion...",
      gradient: "from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-yellow-900",
      metaTitle: "Kids' Fashion & Toys - Children's Clothing & Accessories | BazaarLive",
      metaDescription: "Shop kids' fashion, toys, and accessories. Find clothing, shoes, and toys for babies, toddlers, and children.",
      categories: [
        { id: 'all', name: 'All Kids', count: '20K+', isPopular: true },
        { id: 'clothing', name: 'Clothing', count: '10K+', isPopular: true },
        { id: 'shoes', name: 'Shoes', count: '5K+', isPopular: true },
        { id: 'toys', name: 'Toys', count: '8K+', isPopular: true },
        { id: 'accessories', name: 'Accessories', count: '3K+' },
        { id: 'baby', name: 'Baby', count: '4K+', isTrending: true },
        { id: 'school', name: 'School Supplies', count: '2K+' },
      ],
      featured: ['clothing', 'shoes', 'toys'],
      trending: ['baby', 'school']
    },
    home: {
      title: "Home & Living",
      description: "Transform your space with furniture, decor, and home essentials",
      placeholder: "Search home items...",
      gradient: "from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900",
      metaTitle: "Home & Living - Furniture, Decor & Home Essentials | BazaarLive",
      metaDescription: "Shop home decor, furniture, kitchen essentials, and more. Transform your space with unique finds.",
      categories: [
        { id: 'all', name: 'All Home', count: '15K+', isPopular: true },
        { id: 'furniture', name: 'Furniture', count: '8K+', isPopular: true },
        { id: 'decor', name: 'Decor', count: '5K+', isPopular: true },
        { id: 'kitchen', name: 'Kitchen', count: '4K+' },
        { id: 'bedding', name: 'Bedding', count: '3K+' },
        { id: 'bathroom', name: 'Bathroom', count: '2K+' },
        { id: 'lighting', name: 'Lighting', count: '1.5K+', isTrending: true },
      ],
      featured: ['furniture', 'decor', 'kitchen'],
      trending: ['lighting', 'bathroom']
    },
    electronics: {
      title: "Electronics & Tech",
      description: "Latest gadgets, computers, and electronic accessories",
      placeholder: "Search electronics...",
      gradient: "from-cyan-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-cyan-900",
      metaTitle: "Electronics & Tech - Gadgets, Computers & Accessories | BazaarLive",
      metaDescription: "Shop the latest electronics, computers, phones, gaming gear, and tech accessories at great prices.",
      categories: [
        { id: 'all', name: 'All Electronics', count: '20K+', isPopular: true },
        { id: 'computers', name: 'Computers', count: '8K+', isPopular: true },
        { id: 'phones', name: 'Phones', count: '6K+', isPopular: true },
        { id: 'gaming', name: 'Gaming', count: '4K+', isTrending: true },
        { id: 'audio', name: 'Audio', count: '3K+' },
        { id: 'cameras', name: 'Cameras', count: '2K+' },
        { id: 'wearables', name: 'Wearables', count: '1.5K+', isTrending: true },
      ],
      featured: ['computers', 'phones', 'gaming'],
      trending: ['gaming', 'wearables']
    },
    pets: {
      title: "Pet Supplies",
      description: "Everything your furry friends need for a happy, healthy life",
      placeholder: "Search pet supplies...",
      gradient: "from-amber-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-900",
      metaTitle: "Pet Supplies - Dog, Cat & Pet Accessories | BazaarLive",
      metaDescription: "Shop pet supplies, toys, food, and accessories for dogs, cats, and other pets. Everything for your furry friends.",
      categories: [
        { id: 'all', name: 'All Pets', count: '10K+', isPopular: true },
        { id: 'dogs', name: 'Dogs', count: '5K+', isPopular: true },
        { id: 'cats', name: 'Cats', count: '3K+', isPopular: true },
        { id: 'birds', name: 'Birds', count: '1K+' },
        { id: 'fish', name: 'Fish', count: '800' },
        { id: 'small-pets', name: 'Small Pets', count: '600' },
        { id: 'reptiles', name: 'Reptiles', count: '400' },
      ],
      featured: ['dogs', 'cats', 'birds'],
      trending: ['small-pets', 'fish']
    },
    'beauty-wellness': {
      title: "Beauty & Wellness",
      description: "Skincare, makeup, wellness products for your self-care routine",
      placeholder: "Search beauty & wellness...",
      gradient: "from-rose-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-rose-900",
      metaTitle: "Beauty & Wellness - Skincare, Makeup & Wellness Products | BazaarLive",
      metaDescription: "Shop beauty and wellness products including skincare, makeup, hair care, and wellness essentials.",
      categories: [
        { id: 'all', name: 'All Beauty', count: '10K+', isPopular: true },
        { id: 'skincare', name: 'Skincare', count: '4K+', isPopular: true },
        { id: 'makeup', name: 'Makeup', count: '3K+', isPopular: true },
        { id: 'haircare', name: 'Hair Care', count: '2K+' },
        { id: 'wellness', name: 'Wellness', count: '1K+', isTrending: true },
        { id: 'fragrance', name: 'Fragrance', count: '800' },
        { id: 'tools', name: 'Beauty Tools', count: '600' },
      ],
      featured: ['skincare', 'makeup', 'haircare'],
      trending: ['wellness', 'tools']
    },
    'sports-outdoors': {
      title: "Sports & Outdoors",
      description: "Gear up for your active lifestyle and outdoor adventures",
      placeholder: "Search sports & outdoors...",
      gradient: "from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900",
      metaTitle: "Sports & Outdoors - Athletic Gear & Outdoor Equipment | BazaarLive",
      metaDescription: "Shop sports and outdoor gear including fitness equipment, outdoor gear, and athletic accessories.",
      categories: [
        { id: 'all', name: 'All Sports', count: '16K+', isPopular: true },
        { id: 'fitness', name: 'Fitness', count: '6K+', isPopular: true },
        { id: 'outdoor', name: 'Outdoor', count: '5K+', isPopular: true },
        { id: 'sports', name: 'Sports', count: '4K+' },
        { id: 'cycling', name: 'Cycling', count: '1K+', isTrending: true },
        { id: 'water-sports', name: 'Water Sports', count: '800' },
        { id: 'winter-sports', name: 'Winter Sports', count: '600' },
      ],
      featured: ['fitness', 'outdoor', 'sports'],
      trending: ['cycling', 'water-sports']
    },
    brands: {
      title: "Designer Brands",
      description: "Luxury and designer brands across all categories",
      placeholder: "Search brands...",
      gradient: "from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900",
      metaTitle: "Designer Brands - Luxury & Premium Brands | BazaarLive",
      metaDescription: "Shop authentic designer and luxury brands. Find premium fashion, accessories, and lifestyle products.",
      categories: [
        { id: 'all', name: 'All Brands', count: '5K+', isPopular: true },
        { id: 'luxury', name: 'Luxury', count: '2K+', isPopular: true },
        { id: 'designer', name: 'Designer', count: '1.5K+', isPopular: true },
        { id: 'premium', name: 'Premium', count: '1K+' },
        { id: 'streetwear', name: 'Streetwear', count: '500', isTrending: true },
        { id: 'vintage', name: 'Vintage', count: '400', isTrending: true },
      ],
      featured: ['luxury', 'designer', 'premium'],
      trending: ['streetwear', 'vintage']
    }
  },
  marketplace: {
    jobs: {
      title: "Jobs & Career",
      description: "Find your next career opportunity or hire talented professionals",
      placeholder: "Search jobs...",
      gradient: "from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900",
      metaTitle: "Jobs & Career Opportunities | BazaarLive",
      metaDescription: "Find job opportunities and career advancement. Browse tech, finance, marketing, and other professional roles.",
      categories: [
        { id: 'all', name: 'All Jobs', count: '5K+', isPopular: true },
        { id: 'tech', name: 'Technology', count: '2K+', isPopular: true },
        { id: 'finance', name: 'Finance', count: '800', isPopular: true },
        { id: 'marketing', name: 'Marketing', count: '600' },
        { id: 'sales', name: 'Sales', count: '500' },
        { id: 'remote', name: 'Remote Jobs', count: '1.5K+', isTrending: true },
      ],
      featured: ['tech', 'finance', 'remote'],
      trending: ['remote', 'tech']
    },
    'real-estate': {
      title: "Real Estate",
      description: "Find your perfect home or investment property",
      placeholder: "Search properties...",
      gradient: "from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900",
      metaTitle: "Real Estate - Homes & Properties for Sale | BazaarLive",
      metaDescription: "Browse real estate listings including homes, apartments, commercial properties, and investment opportunities.",
      categories: [
        { id: 'all', name: 'All Properties', count: '10K+', isPopular: true },
        { id: 'homes', name: 'Homes', count: '6K+', isPopular: true },
        { id: 'apartments', name: 'Apartments', count: '3K+', isPopular: true },
        { id: 'commercial', name: 'Commercial', count: '800' },
        { id: 'land', name: 'Land', count: '600' },
        { id: 'luxury', name: 'Luxury', count: '400', isTrending: true },
      ],
      featured: ['homes', 'apartments', 'commercial'],
      trending: ['luxury', 'land']
    },
    cars: {
      title: "Cars & Vehicles",
      description: "Find your perfect vehicle from cars to motorcycles",
      placeholder: "Search vehicles...",
      gradient: "from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900",
      metaTitle: "Cars & Vehicles for Sale | BazaarLive",
      metaDescription: "Shop cars, motorcycles, trucks, and other vehicles. Find new and used vehicles at great prices.",
      categories: [
        { id: 'all', name: 'All Vehicles', count: '8K+', isPopular: true },
        { id: 'cars', name: 'Cars', count: '5K+', isPopular: true },
        { id: 'trucks', name: 'Trucks', count: '1.5K+', isPopular: true },
        { id: 'motorcycles', name: 'Motorcycles', count: '800' },
        { id: 'rvs', name: 'RVs', count: '400' },
        { id: 'electric', name: 'Electric', count: '600', isTrending: true },
      ],
      featured: ['cars', 'trucks', 'motorcycles'],
      trending: ['electric', 'trucks']
    },
    boats: {
      title: "Boats & Marine",
      description: "Discover boats, yachts, and marine equipment",
      placeholder: "Search boats...",
      gradient: "from-cyan-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-cyan-900",
      metaTitle: "Boats & Marine Equipment for Sale | BazaarLive",
      metaDescription: "Shop boats, yachts, and marine equipment. Find sailboats, motorboats, and marine accessories.",
      categories: [
        { id: 'all', name: 'All Boats', count: '2K+', isPopular: true },
        { id: 'sailboats', name: 'Sailboats', count: '800', isPopular: true },
        { id: 'motorboats', name: 'Motorboats', count: '700', isPopular: true },
        { id: 'yachts', name: 'Yachts', count: '300' },
        { id: 'kayaks', name: 'Kayaks', count: '200' },
        { id: 'accessories', name: 'Marine Accessories', count: '400', isTrending: true },
      ],
      featured: ['sailboats', 'motorboats', 'yachts'],
      trending: ['accessories', 'kayaks']
    },
    services: {
      title: "Services & Professional",
      description: "Find professional services and skilled providers",
      placeholder: "Search services...",
      gradient: "from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900",
      metaTitle: "Professional Services & Skilled Providers | BazaarLive",
      metaDescription: "Find professional services including home improvement, business services, and personal services.",
      categories: [
        { id: 'all', name: 'All Services', count: '3K+', isPopular: true },
        { id: 'home', name: 'Home Services', count: '1.2K+', isPopular: true },
        { id: 'business', name: 'Business Services', count: '800', isPopular: true },
        { id: 'personal', name: 'Personal Services', count: '600' },
        { id: 'creative', name: 'Creative Services', count: '400', isTrending: true },
        { id: 'consulting', name: 'Consulting', count: '300' },
      ],
      featured: ['home', 'business', 'personal'],
      trending: ['creative', 'consulting']
    }
  }
};

// ============================================================================
// ENTERPRISE CATEGORY CONFIGURATION SERVICE
// ============================================================================

class CategoryConfigService {
  private readonly configurations = CATEGORY_CONFIGURATIONS;

  /**
   * Get category configuration for a specific vertical and category
   */
  getCategoryConfig(vertical: string, category: string): CategoryConfig | null {
    try {
      const verticalConfig = this.configurations[vertical];
      if (!verticalConfig) {
        console.warn(`[CategoryConfigService] Vertical '${vertical}' not found`);
        return null;
      }

      const categoryConfig = verticalConfig[category];
      if (!categoryConfig) {
        console.warn(`[CategoryConfigService] Category '${category}' not found in vertical '${vertical}'`);
        return null;
      }

      // Validate configuration
      const validatedConfig = CategoryConfigSchema.parse(categoryConfig);
      return validatedConfig;
    } catch (error) {
      console.error(`[CategoryConfigService] Error getting category config:`, error);
      return null;
    }
  }

  /**
   * Get default configuration for unknown categories
   */
  getDefaultConfig(vertical: string, category: string): CategoryConfig {
    return {
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} ${vertical.charAt(0).toUpperCase() + vertical.slice(1)}`,
      description: `Discover amazing ${category} items in our ${vertical} marketplace`,
      placeholder: `Search ${category}...`,
      gradient: "from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
      metaTitle: `${category} | BazaarLive`,
      metaDescription: `Shop ${category} items on BazaarLive marketplace`,
      categories: [
        { id: 'all', name: `All ${category.charAt(0).toUpperCase() + category.slice(1)}`, count: '1K+' }
      ]
    };
  }

  /**
   * Get all available verticals
   */
  getAvailableVerticals(): string[] {
    return Object.keys(this.configurations);
  }

  /**
   * Get all available categories for a vertical
   */
  getAvailableCategories(vertical: string): string[] {
    const verticalConfig = this.configurations[vertical];
    return verticalConfig ? Object.keys(verticalConfig) : [];
  }

  /**
   * Check if a vertical/category combination exists
   */
  hasConfiguration(vertical: string, category: string): boolean {
    return !!(this.configurations[vertical]?.[category]);
  }

  /**
   * Get configuration with fallback
   */
  getConfigWithFallback(vertical: string, category: string): CategoryConfig {
    return this.getCategoryConfig(vertical, category) || this.getDefaultConfig(vertical, category);
  }

  /**
   * Get all configurations for analytics and debugging
   */
  getAllConfigurations(): Record<string, VerticalConfig> {
    return this.configurations;
  }
}

// ============================================================================
// SINGLETON INSTANCE EXPORT
// ============================================================================

export const categoryConfigService = new CategoryConfigService();
export default categoryConfigService;