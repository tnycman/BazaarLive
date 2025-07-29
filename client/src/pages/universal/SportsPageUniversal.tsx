import React from 'react';
import UniversalCategoryPage from '@/components/universal/UniversalCategoryPage';

/**
 * Universal Sports & Outdoors Page - Enterprise AOP Implementation
 * Uses UniversalCategoryPageFactory configuration for consistent layout
 */
export default function SportsPageUniversal() {
  return (
    <UniversalCategoryPage 
      category="sports"
      data-testid="page-sports-universal"
    />
  );
}