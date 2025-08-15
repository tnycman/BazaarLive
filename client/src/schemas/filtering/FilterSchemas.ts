import { z } from 'zod';

export const FilterStateSchema = z.object({
  selectedCategories: z.array(z.string()),
  selectedBrands: z.array(z.string()),
  selectedSizes: z.array(z.string()),
  selectedColors: z.array(z.string()),
  selectedPrices: z.array(z.string()),
  selectedAvailability: z.array(z.string()),
  selectedTypes: z.array(z.string()),
  brandSearchQuery: z.string(),
  expandedSections: z.array(z.string())
});

export const FilterSidebarPropsSchema = z.object({
  currentCategory: z.string().optional(),
  onFilterChange: z.function(),
  className: z.string().optional(),
  isLoading: z.boolean().optional()
});




