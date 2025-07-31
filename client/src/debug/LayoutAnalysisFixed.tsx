/**
 * LAYOUT ANALYSIS COMPONENT - FIXED VERSION
 * Systematic investigation of layout constraints
 */

import React, { useEffect, useRef } from 'react';

export function LayoutAnalysisFixed() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const analyzeLayout = () => {
      if (!containerRef.current) {
        console.log('Container ref not found');
        return;
      }
      
      const element = containerRef.current;
      const computedStyle = window.getComputedStyle(element);
      
      console.log('=== SYSTEMATIC LAYOUT ANALYSIS ===');
      console.log('Target Element:', element);
      console.log('Classes:', element.className);
      
      const measurements = {
        offsetWidth: element.offsetWidth,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        width: computedStyle.width,
        maxWidth: computedStyle.maxWidth,
        minWidth: computedStyle.minWidth,
        paddingLeft: computedStyle.paddingLeft,
        paddingRight: computedStyle.paddingRight,
        marginLeft: computedStyle.marginLeft,
        marginRight: computedStyle.marginRight,
        boxSizing: computedStyle.boxSizing,
        display: computedStyle.display,
        flexGrow: computedStyle.flexGrow,
        flexShrink: computedStyle.flexShrink,
        flexBasis: computedStyle.flexBasis
      };
      
      console.log('ELEMENT MEASUREMENTS:', measurements);
      
      // Parent analysis
      let parent = element.parentElement;
      let level = 0;
      console.log('=== PARENT CHAIN ANALYSIS ===');
      
      while (parent && level < 8) {
        const parentStyle = window.getComputedStyle(parent);
        const parentInfo = {
          level: level,
          tag: parent.tagName,
          className: parent.className,
          width: parentStyle.width,
          maxWidth: parentStyle.maxWidth,
          paddingLeft: parentStyle.paddingLeft,
          paddingRight: parentStyle.paddingRight,
          display: parentStyle.display,
          offsetWidth: parent.offsetWidth
        };
        console.log(`Parent ${level}:`, parentInfo);
        parent = parent.parentElement;
        level++;
      }
      
      // Sibling analysis
      if (element.parentElement) {
        console.log('=== SIBLING ANALYSIS ===');
        Array.from(element.parentElement.children).forEach((sibling, i) => {
          if (sibling !== element) {
            const siblingStyle = window.getComputedStyle(sibling);
            console.log(`Sibling ${i}:`, {
              tag: sibling.tagName,
              className: sibling.className,
              width: siblingStyle.width,
              offsetWidth: (sibling as HTMLElement).offsetWidth,
              flexGrow: siblingStyle.flexGrow,
              flexBasis: siblingStyle.flexBasis
            });
          }
        });
      }
      
      const viewport = {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      };
      console.log('=== VIEWPORT ===', viewport);
      
      // Summary analysis
      const analysis = {
        elementWidth: element.offsetWidth,
        viewportWidth: window.innerWidth,
        expectedMainContent: window.innerWidth - 256 - 320, // viewport - sidebars
        actualMainContent: element.offsetWidth,
        missingWidth: (window.innerWidth - 256 - 320) - element.offsetWidth,
        constraintFound: element.offsetWidth < (window.innerWidth - 256 - 320)
      };
      
      console.log('=== CONSTRAINT ANALYSIS ===', analysis);
      
      // Find the constraining parent
      let constrainingParent = null;
      let currentParent = element.parentElement;
      let parentLevel = 0;
      
      while (currentParent && parentLevel < 8) {
        const parentWidth = currentParent.offsetWidth;
        if (parentWidth < window.innerWidth && parentWidth > element.offsetWidth) {
          constrainingParent = {
            level: parentLevel,
            element: currentParent,
            tagName: currentParent.tagName,
            className: currentParent.className,
            width: parentWidth,
            computedMaxWidth: window.getComputedStyle(currentParent).maxWidth
          };
          console.log('=== CONSTRAINING PARENT FOUND ===', constrainingParent);
          break;
        }
        currentParent = currentParent.parentElement;
        parentLevel++;
      }
      
      alert(`CONSTRAINT ANALYSIS:
Element: ${element.offsetWidth}px
Expected: ${analysis.expectedMainContent}px  
Missing: ${analysis.missingWidth}px
${constrainingParent ? `Constraint: ${constrainingParent.className}` : 'No constraint found'}`);
    };
    
    // Run analysis immediately and after a delay
    setTimeout(analyzeLayout, 100);
    setTimeout(analyzeLayout, 1000);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex-1 min-w-0 max-w-none px-0 py-4 border-4 border-blue-500"
      data-testid="layout-analysis"
      style={{ background: 'yellow', minHeight: '200px' }}
    >
      <h2>LAYOUT ANALYSIS</h2>
      <p>Check console for systematic investigation</p>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-red-200 p-4 border">
            Item {i}
          </div>
        ))}
      </div>
    </div>
  );
}