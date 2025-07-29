import React from 'react';
import UniversalCategoryPage from '@/components/universal/UniversalCategoryPage';

/**
 * Universal Pets Page - Enterprise AOP Implementation
 * Uses UniversalCategoryPageFactory configuration for consistent layout
 */
export default function PetsPageUniversal() {
  return (
    <UniversalCategoryPage 
      category="pets"
      data-testid="page-pets-universal"
    />
  );
}