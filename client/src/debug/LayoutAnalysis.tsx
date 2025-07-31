/**
 * LAYOUT ANALYSIS COMPONENT
 * Systematic investigation of layout constraints with no assumptions
 */

import React, { useEffect, useRef } from 'react';

export function LayoutAnalysis() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for next frame to ensure layout is complete
    requestAnimationFrame(() => {
      if (containerRef.current) {
        const element = containerRef.current;
        const computedStyle = window.getComputedStyle(element);
        
        console.log('=== SYSTEMATIC LAYOUT ANALYSIS ===');
        console.log('Target Element:', element);
        console.log('Element Classes:', element.className);
        console.log('Element Data Attributes:', {
          testid: element.getAttribute('data-testid'),
          style: element.getAttribute('style')
        });
        
        const styles = {
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
          flexBasis: computedStyle.flexBasis,
          position: computedStyle.position,
          overflow: computedStyle.overflow,
          overflowX: computedStyle.overflowX
        };
        
        console.log('ELEMENT COMPUTED STYLES:', styles);
        
        // Log raw pixel values
        console.log('RAW MEASUREMENTS:', {
          offsetWidth: element.offsetWidth,
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          boundingClientRect: element.getBoundingClientRect()
        });
      
      // Analyze parent chain systematically
      let parent = element.parentElement;
      let level = 0;
      console.log('=== PARENT CHAIN ANALYSIS ===');
      
      while (parent && level < 10) {
        const parentStyle = window.getComputedStyle(parent);
        console.log(`Parent Level ${level}:`, {
          tagName: parent.tagName,
          className: parent.className,
          id: parent.id,
          width: parentStyle.width,
          maxWidth: parentStyle.maxWidth,
          minWidth: parentStyle.minWidth,
          paddingLeft: parentStyle.paddingLeft,
          paddingRight: parentStyle.paddingRight,
          marginLeft: parentStyle.marginLeft,
          marginRight: parentStyle.marginRight,
          display: parentStyle.display,
          position: parentStyle.position,
          overflow: parentStyle.overflow,
          boxSizing: parentStyle.boxSizing
        });
        parent = parent.parentElement;
        level++;
      }
      
      // Viewport and container measurements
      const measurements = {
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.clientWidth,
        elementOffsetWidth: element.offsetWidth,
        elementClientWidth: element.clientWidth,
        elementScrollWidth: element.scrollWidth,
        elementBoundingRect: element.getBoundingClientRect()
      };
      
      console.log('=== MEASUREMENTS ===', measurements);
      
      // Find all siblings and their constraints
      if (element.parentElement) {
        const siblings = Array.from(element.parentElement.children);
        console.log('=== SIBLING ANALYSIS ===');
        siblings.forEach((sibling, index) => {
          if (sibling !== element) {
            const siblingStyle = window.getComputedStyle(sibling);
            console.log(`Sibling ${index}:`, {
              tagName: sibling.tagName,
              className: sibling.className,
              width: siblingStyle.width,
              flexGrow: siblingStyle.flexGrow,
              flexShrink: siblingStyle.flexShrink,
              flexBasis: siblingStyle.flexBasis
            });
          }
        });
      }
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex-1 min-w-0 max-w-none px-0 py-4 border-4 border-blue-500"
      data-testid="layout-analysis"
      style={{ background: 'yellow', minHeight: '200px' }}
    >
      <h2>LAYOUT ANALYSIS COMPONENT</h2>
      <p>Systematic investigation running - check console</p>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-red-200 p-4 border">
            Analysis Item {i}
          </div>
        ))}
      </div>
    </div>
  );
}