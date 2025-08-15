// Compatibility stub for legacy FilterSidebar to satisfy dev server HMR.
// Use EnterpriseFilterSidebar or the integration adapter instead.
import React from 'react';

export interface FilterSidebarProps {
  onFilterChange: (criteria: any) => void;
  appliedFiltersCount?: number;
  isLoading?: boolean;
  category?: string;
}

export function FilterSidebar(_props: FilterSidebarProps) {
  return null;
}

export default FilterSidebar;








