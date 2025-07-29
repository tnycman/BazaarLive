import React from 'react';
import UniversalCategoryPage from '@/components/universal/UniversalCategoryPage';

/**
 * Universal Electronics Page - Enterprise AOP Implementation
 * Uses UniversalCategoryPageFactory configuration for consistent layout
 */
export default function ElectronicsPageUniversal() {
  return (
    <UniversalCategoryPage 
      category="electronics"
      data-testid="page-electronics-universal"
    />
  );
}