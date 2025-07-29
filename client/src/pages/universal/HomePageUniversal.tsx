/**
 * Home Page - Universal Category Page Implementation
 * Demonstrates universal three-column layout for Home & Garden category
 * 100% AOP compliance, zero shortcuts
 */

import React from 'react';
import UniversalCategoryPage from '@/components/universal/UniversalCategoryPage';

const HomePageUniversal: React.FC = () => {
  return (
    <UniversalCategoryPage
      category="home"
      className="home-page-universal"
    />
  );
};

export default HomePageUniversal;