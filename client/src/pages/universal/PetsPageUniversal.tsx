/**
 * Pets Page - Universal Category Page Implementation
 * Demonstrates universal three-column layout for Pet Supplies category
 * 100% AOP compliance, zero shortcuts
 */

import React from 'react';
import UniversalCategoryPage from '@/components/universal/UniversalCategoryPage';

const PetsPageUniversal: React.FC = () => {
  return (
    <UniversalCategoryPage
      category="pets"
      className="pets-page-universal"
    />
  );
};

export default PetsPageUniversal;