/**
 * Kids Category Strategy Implementation
 * Enterprise-grade strategy pattern implementation for kids' fashion category
 * Implements domain-specific business logic with AOP compliance
 */

import { 
  CategoryStrategy, 
  KidsFashionDomain,
  FilterConfiguration,
  CategorySelection,
  ValidationResult,
  RawListingData,
  CategorySpecificListingData,
  AnalyticsConfiguration,
  SubcategoryDefinition,
  KidsSizeChart
} from '../CategoryDomainTypes';

export class KidsCategoryStrategy implements CategoryStrategy {
  readonly domain: KidsFashionDomain;

  constructor() {
    this.domain = {
      vertical: 'fashion',
      category: 'kids',
      metadata: {
        title: "Kids' Fashion",
        description: "Adorable and comfortable clothing for children of all ages",
        gradient: "from-yellow-400 via-orange-500 to-red-500",
        placeholder: "Search kids' fashion...",
        icon: "👶",
        seoKeywords: ["kids fashion", "children clothing", "baby clothes", "toddler", "youth"]
      },
      sizeChart: KidsSizeChart,
      subcategories: [
        {
          id: 'baby',
          name: 'Baby (0-24M)',
          description: 'Clothing for babies and infants',
          filterTags: ['baby', 'infant', 'onesie', 'bodysuit', 'sleeper', 'bib']
        },
        {
          id: 'toddler',
          name: 'Toddler (2T-5T)',
          description: 'Clothing for toddlers and preschoolers',
          filterTags: ['toddler', 'preschool', 'play clothes', 'overalls', 'dress']
        },
        {
          id: 'boys',
          name: 'Boys (6-16)',
          description: 'Clothing for school-age boys',
          filterTags: ['boys', 'school', 'pants', 'shirts', 'shorts', 'activewear']
        },
        {
          id: 'girls',
          name: 'Girls (6-16)',
          description: 'Clothing for school-age girls',
          filterTags: ['girls', 'school', 'dresses', 'skirts', 'tops', 'leggings']
        },
        {
          id: 'shoes',
          name: 'Kids Shoes',
          description: 'Footwear for all ages',
          filterTags: ['shoes', 'sneakers', 'sandals', 'boots', 'dress shoes']
        },
        {
          id: 'accessories',
          name: 'Accessories',
          description: 'Hats, bags, and fun accessories',
          filterTags: ['hat', 'bag', 'backpack', 'hair accessories', 'jewelry']
        }
      ],
      preferredBrands: [
        'Carter\'s', 'OshKosh B\'gosh', 'Gerber', 'Nike Kids', 'Adidas Kids',
        'Gap Kids', 'H&M Kids', 'Zara Kids', 'Old Navy Kids', 'Target Cat & Jack',
        'Disney', 'Peppa Pig', 'PAW Patrol', 'Frozen', 'Marvel'
      ]
    };
  }

  getFilterConfiguration(): FilterConfiguration {
    return {
      availableFilters: [
        'subcategory',
        'ageGroup',
        'size',
        'brand',
        'color',
        'priceRange',
        'condition',
        'gender',
        'occasion',
        'character'
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'new_without_tags', 'excellent', 'good'],
        priceRange: { min: 0, max: 200 }
      },
      filterValidationRules: {
        size: {
          required: false,
          type: 'array',
          validator: (sizes: string[]) => sizes.every(size => 
            this.domain.sizeChart.sizes.includes(size)
          ),
          errorMessage: 'Invalid size selection for kids\' clothing'
        },
        ageGroup: {
          required: false,
          type: 'array',
          validator: (ageGroups: string[]) => {
            const validAgeGroups = ['baby', 'toddler', 'preschool', 'school-age', 'teen'];
            return ageGroups.every(age => validAgeGroups.includes(age));
          },
          errorMessage: 'Invalid age group selection'
        },
        gender: {
          required: false,
          type: 'array',
          validator: (genders: string[]) => {
            const validGenders = ['boys', 'girls', 'unisex'];
            return genders.every(gender => validGenders.includes(gender));
          },
          errorMessage: 'Invalid gender selection'
        }
      }
    };
  }

  validateSelection(selection: CategorySelection): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (selection.level1 && selection.level1 !== 'kids') {
      errors.push('Level 1 selection must be "kids" for kids\' fashion');
    }

    if (selection.level2) {
      const validSubcategories = this.domain.subcategories.map(sc => sc.id);
      if (!validSubcategories.includes(selection.level2)) {
        errors.push(`Invalid subcategory: ${selection.level2}`);
      }
    }

    // Validate age-appropriate sizing
    if (selection.metadata?.size && selection.metadata?.ageGroup) {
      const isValidCombination = this.validateSizeAgeCombo(
        selection.metadata.size as string,
        selection.metadata.ageGroup as string
      );
      if (!isValidCombination) {
        warnings.push('Size may not be appropriate for selected age group');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  transformListingData(rawData: RawListingData[]): CategorySpecificListingData[] {
    return rawData.map(listing => {
      const domainSpecificData: Record<string, any> = {};

      // Age group inference
      if (listing.size) {
        domainSpecificData.inferredAgeGroup = this.inferAgeGroup(listing.size);
      }

      // Gender classification
      domainSpecificData.genderClassification = this.classifyGender(listing);

      // Character/theme detection
      domainSpecificData.characterTheme = this.detectCharacterTheme(listing);

      // Safety considerations
      domainSpecificData.safetyNotes = this.assessSafety(listing);

      // Seasonal appropriateness
      domainSpecificData.seasonality = this.classifySeasonality(listing);

      const categoryValidation = this.validateListingForKids(listing);
      const recommendedFilters = this.generateRecommendedFilters(listing);

      return {
        ...listing,
        domainSpecificData,
        categoryValidation,
        recommendedFilters
      };
    });
  }

  getAnalyticsConfiguration(): AnalyticsConfiguration {
    return {
      trackingEvents: [
        'kids_category_view',
        'kids_age_group_select',
        'kids_gender_filter',
        'kids_character_filter',
        'kids_size_filter',
        'kids_brand_filter',
        'kids_listing_click'
      ],
      conversionGoals: [
        'kids_listing_view',
        'kids_character_merchandise_interest',
        'kids_seasonal_clothing_interest',
        'kids_purchase_intent'
      ],
      segmentationRules: {
        age_targeting: 'Track age group preferences',
        character_preferences: 'Track popular character themes',
        seasonal_shopping: 'Track seasonal clothing patterns',
        safety_awareness: 'Track safety-focused shopping behavior'
      }
    };
  }

  private inferAgeGroup(size: string): string {
    const sizeToAge: Record<string, string> = {
      '2T': 'toddler',
      '3T': 'toddler',
      '4T': 'toddler',
      '5T': 'preschool',
      '6': 'school-age',
      '7': 'school-age',
      '8': 'school-age',
      '10': 'school-age',
      '12': 'school-age',
      '14': 'teen',
      '16': 'teen'
    };
    
    return sizeToAge[size] || 'unknown';
  }

  private classifyGender(listing: RawListingData): string {
    const text = (listing.title + ' ' + listing.description).toLowerCase();
    
    const boysKeywords = ['boys', 'boy\'s', 'masculine', 'trucks', 'cars', 'superhero'];
    const girlsKeywords = ['girls', 'girl\'s', 'feminine', 'princess', 'dolls', 'unicorn'];
    
    const hasBoysKeywords = boysKeywords.some(keyword => text.includes(keyword));
    const hasGirlsKeywords = girlsKeywords.some(keyword => text.includes(keyword));
    
    if (hasBoysKeywords && !hasGirlsKeywords) return 'boys';
    if (hasGirlsKeywords && !hasBoysKeywords) return 'girls';
    
    return 'unisex';
  }

  private detectCharacterTheme(listing: RawListingData): string[] {
    const text = (listing.title + ' ' + listing.description).toLowerCase();
    const themes: string[] = [];
    
    const characterThemes = {
      disney: ['disney', 'mickey', 'minnie', 'frozen', 'elsa', 'anna', 'moana'],
      superhero: ['superman', 'batman', 'spiderman', 'wonder woman', 'avengers', 'marvel'],
      cartoon: ['peppa pig', 'paw patrol', 'dora', 'blues clues', 'sesame street'],
      animal: ['animal', 'zoo', 'farm', 'jungle', 'safari', 'pets']
    };
    
    for (const [theme, keywords] of Object.entries(characterThemes)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        themes.push(theme);
      }
    }
    
    return themes;
  }

  private assessSafety(listing: RawListingData): string[] {
    const safetyNotes: string[] = [];
    const text = (listing.title + ' ' + listing.description).toLowerCase();
    
    if (text.includes('small parts')) {
      safetyNotes.push('Contains small parts - choking hazard for children under 3');
    }
    
    if (text.includes('flame resistant') || text.includes('fire retardant')) {
      safetyNotes.push('Flame resistant material');
    }
    
    if (text.includes('organic') || text.includes('cotton')) {
      safetyNotes.push('Made with organic/natural materials');
    }
    
    return safetyNotes;
  }

  private classifySeasonality(listing: RawListingData): string[] {
    const text = (listing.title + ' ' + listing.description).toLowerCase();
    const seasons: string[] = [];
    
    const seasonalKeywords = {
      spring: ['spring', 'light jacket', 'rain coat'],
      summer: ['summer', 'shorts', 'tank top', 'swimwear', 'sandals'],
      fall: ['fall', 'autumn', 'sweater', 'jacket'],
      winter: ['winter', 'coat', 'boots', 'warm', 'fleece', 'thermal']
    };
    
    for (const [season, keywords] of Object.entries(seasonalKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        seasons.push(season);
      }
    }
    
    return seasons.length > 0 ? seasons : ['year-round'];
  }

  private validateSizeAgeCombo(size: string, ageGroup: string): boolean {
    const validCombos: Record<string, string[]> = {
      'baby': ['2T', '3T'],
      'toddler': ['2T', '3T', '4T', '5T'],
      'preschool': ['4T', '5T', '6'],
      'school-age': ['6', '7', '8', '10', '12'],
      'teen': ['12', '14', '16']
    };
    
    return validCombos[ageGroup]?.includes(size) || false;
  }

  private validateListingForKids(listing: RawListingData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!listing.title) errors.push('Title is required');
    if (!listing.price) errors.push('Price is required');

    // Kids-specific safety validations
    const text = (listing.title + ' ' + listing.description).toLowerCase();
    if (text.includes('choking hazard') && !text.includes('age 3+')) {
      warnings.push('Item may contain choking hazards - verify age appropriateness');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private generateRecommendedFilters(listing: RawListingData): string[] {
    const recommended: string[] = [];

    if (listing.size) {
      recommended.push('size');
      recommended.push('ageGroup');
    }
    
    if (listing.brand) recommended.push('brand');
    
    // Add character filter if character theme detected
    const characterThemes = this.detectCharacterTheme(listing);
    if (characterThemes.length > 0) {
      recommended.push('character');
    }
    
    // Add gender filter if clearly gendered
    const gender = this.classifyGender(listing);
    if (gender !== 'unisex') {
      recommended.push('gender');
    }

    return recommended;
  }
}