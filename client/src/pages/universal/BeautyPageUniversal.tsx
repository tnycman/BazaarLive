import React from 'react';
import UniversalCategoryPage from '@/components/universal/UniversalCategoryPage';

/**
 * Universal Beauty & Wellness Page - Enterprise AOP Implementation
 * Uses UniversalCategoryPageFactory configuration for consistent layout
 */
export default function BeautyPageUniversal() {
  return (
    <UniversalCategoryPage 
      category="beauty"
      data-testid="page-beauty-universal"
    />
  );
}