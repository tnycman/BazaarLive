/**
 * Men's Fashion Page - Universal Category Page Implementation
 * Demonstrates universal three-column layout for Men's Fashion category
 * 100% AOP compliance, zero shortcuts
 */

import React from 'react';
import UniversalCategoryPage from '@/components/universal/UniversalCategoryPage';

const MenPageUniversal: React.FC = () => {
  return (
    <UniversalCategoryPage
      category="fashion"
      subcategory="men"
      className="men-page-universal"
    />
  );
};

export default MenPageUniversal;