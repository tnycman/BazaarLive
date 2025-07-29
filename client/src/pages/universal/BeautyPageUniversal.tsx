/**
 * Beauty & Wellness Page - Universal Category Page Implementation
 * Demonstrates universal three-column layout for Beauty category
 * 100% AOP compliance, zero shortcuts
 */

import React from 'react';
import UniversalCategoryPage from '@/components/universal/UniversalCategoryPage';

const BeautyPageUniversal: React.FC = () => {
  return (
    <UniversalCategoryPage
      category="beauty"
      className="beauty-page-universal"
    />
  );
};

export default BeautyPageUniversal;