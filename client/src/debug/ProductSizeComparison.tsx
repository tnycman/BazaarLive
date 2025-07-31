/**
 * Product Size Comparison Tool
 * Measures and compares product grid sizes between different pages
 */

import React, { useEffect, useRef, useState } from 'react';

interface PageMeasurement {
  pageName: string;
  containerWidth: number;
  productWidth: number;
  productCount: number;
  actualProductWidth: number;
  gap: number;
  totalGridWidth: number;
}

export function ProductSizeComparison() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measurements, setMeasurements] = useState<PageMeasurement[]>([]);

  useEffect(() => {
    const measureCurrentPage = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const products = container.querySelectorAll('[data-testid*="product"]');
      
      if (products.length === 0) return;

      const firstProduct = products[0] as HTMLElement;
      const containerStyle = window.getComputedStyle(container);
      const productStyle = window.getComputedStyle(firstProduct);
      
      const measurement: PageMeasurement = {
        pageName: window.location.pathname,
        containerWidth: container.offsetWidth,
        productWidth: firstProduct.offsetWidth,
        productCount: products.length,
        actualProductWidth: firstProduct.getBoundingClientRect().width,
        gap: parseInt(containerStyle.gap || '0'),
        totalGridWidth: container.scrollWidth
      };

      console.log('=== PRODUCT SIZE MEASUREMENT ===', measurement);
      
      // Store in localStorage for comparison
      const existing = JSON.parse(localStorage.getItem('productMeasurements') || '[]');
      const updated = existing.filter((m: PageMeasurement) => m.pageName !== measurement.pageName);
      updated.push(measurement);
      localStorage.setItem('productMeasurements', JSON.stringify(updated));
      
      setMeasurements(updated);
    };

    // Run measurement
    setTimeout(measureCurrentPage, 1000);
  }, []);

  const clearMeasurements = () => {
    localStorage.removeItem('productMeasurements');
    setMeasurements([]);
  };

  return (
    <div 
      ref={containerRef}
      className="bg-yellow-100 border-2 border-yellow-500 p-4 mb-4"
      data-testid="product-size-comparison"
    >
      <h3 className="font-bold text-lg mb-2">Product Size Comparison Tool</h3>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[1,2,3,4].map(i => (
          <div 
            key={i} 
            className="bg-blue-200 p-4 border"
            data-testid={`product-sample-${i}`}
          >
            Sample Product {i}
          </div>
        ))}
      </div>
      
      {measurements.length > 0 && (
        <div className="bg-white p-4 rounded border">
          <h4 className="font-semibold mb-2">Measurements:</h4>
          {measurements.map((m, i) => (
            <div key={i} className="mb-2 p-2 bg-gray-50 rounded text-sm">
              <strong>{m.pageName}:</strong> 
              <br />Product Width: {m.actualProductWidth.toFixed(1)}px
              <br />Container: {m.containerWidth}px
              <br />Grid Gap: {m.gap}px
            </div>
          ))}
          
          {measurements.length >= 2 && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <strong>Comparison:</strong>
              <br />Size difference: {Math.abs(measurements[0].actualProductWidth - measurements[1].actualProductWidth).toFixed(1)}px
              <br />Match: {Math.abs(measurements[0].actualProductWidth - measurements[1].actualProductWidth) < 5 ? '✅ Yes' : '❌ No'}
            </div>
          )}
          
          <button 
            onClick={clearMeasurements}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Clear Measurements
          </button>
        </div>
      )}
      
      <p className="text-sm mt-2">Visit different pages to compare product sizes</p>
    </div>
  );
}