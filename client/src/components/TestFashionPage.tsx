/**
 * TEST FASHION PAGE - HARD-CODED px-0 TO ISOLATE ASPECT
 * This bypasses the aspect to test if the layout path is sound
 */

import React from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import EnterprisePageLayout from '@/components/layout/EnterprisePageLayout';

export function TestFashionPage() {
  // HARD-CODED px-0 to bypass aspect and test layout path
  const hardCodedSpacing = "px-0";
  
  console.log('[TestFashionPage] HARD-CODED SPACING TEST:', { hardCodedSpacing });

  return (
    <div className="min-h-screen bg-gray-50" data-testid="test-fashion-page">
      <Header />
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-6" data-testid="test-page-container">
        <EnterprisePageLayout
          leftSidebar={
            <div className="bg-white p-4 rounded">
              <h3>Test Sidebar</h3>
              <p>Hard-coded px-0 test</p>
            </div>
          }
          mainContent={
            <div className="bg-white p-4 rounded">
              <h2>Test Main Content</h2>
              <p>This should have px-0 padding (hard-coded)</p>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-gray-100 p-4 rounded">
                    Product {i}
                  </div>
                ))}
              </div>
            </div>
          }
          rightSidebar={
            <div className="bg-white p-4 rounded">
              <h3>Test Right Sidebar</h3>
            </div>
          }
          dynamicPadding={hardCodedSpacing}
        />
      </div>
    </div>
  );
}