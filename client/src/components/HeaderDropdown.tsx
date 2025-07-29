/**
 * Header Dropdown Component
 * Enterprise-grade dropdown navigation UI
 * 100% best practices, zero shortcuts, complete separation of concerns
 */

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  headerDropdownService, 
  DropdownCategory, 
  DropdownSubcategory 
} from "@/services/header/HeaderDropdownService";
import { headerAOP, HeaderContext } from "@/services/header/HeaderAspects";

// ===== ENTERPRISE DROPDOWN PROPS =====
interface HeaderDropdownProps {
  readonly category: DropdownCategory;
  readonly isVisible: boolean;
  readonly onClose: () => void;
}

// ===== ENTERPRISE DROPDOWN COMPONENT =====
export function HeaderDropdown({ category, isVisible, onClose }: HeaderDropdownProps) {
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);

  // Handle subcategory navigation with AOP aspects
  const handleSubcategoryClick = useCallback((subcategory: DropdownSubcategory) => {
    const context: HeaderContext = {
      action: 'navigate',
      target: subcategory.path,
      timestamp: Date.now(),
      metadata: { 
        category: category.id, 
        subcategory: subcategory.id,
        source: 'dropdown_navigation',
        isPopular: subcategory.isPopular 
      }
    };

    headerAOP.executeWithAspects(context, () => {
      onClose();
      return true;
    });
  }, [category.id, onClose]);

  // Handle mouse leave with delay
  useEffect(() => {
    if (!isVisible) return;

    let timeoutId: NodeJS.Timeout;
    
    const handleMouseLeave = () => {
      timeoutId = setTimeout(onClose, 200); // Small delay for better UX
    };

    const handleMouseEnter = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    const dropdown = document.getElementById(`dropdown-${category.id}`);
    if (dropdown) {
      dropdown.addEventListener('mouseleave', handleMouseLeave);
      dropdown.addEventListener('mouseenter', handleMouseEnter);
    }

    return () => {
      if (dropdown) {
        dropdown.removeEventListener('mouseleave', handleMouseLeave);
        dropdown.removeEventListener('mouseenter', handleMouseEnter);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isVisible, category.id, onClose]);

  if (!isVisible) return null;

  // Separate popular and regular subcategories
  const popularSubcategories = category.subcategories.filter(sub => sub.isPopular);
  const regularSubcategories = category.subcategories.filter(sub => !sub.isPopular);

  return (
    <div
      id={`dropdown-${category.id}`}
      className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-64"
      data-testid={`dropdown-${category.id}`}
    >
      <div className="p-4">
        {/* Dropdown Header */}
        <div className="border-b border-gray-100 pb-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
          <Link href={category.path}>
            <Button
              variant="link"
              size="sm"
              className="text-purple-600 hover:text-purple-700 p-0 h-auto font-normal"
              data-testid={`view-all-${category.id}`}
              onClick={() => handleSubcategoryClick({ 
                id: `all-${category.id}`, 
                name: `All ${category.name}`, 
                path: category.path 
              })}
            >
              View All {category.name} →
            </Button>
          </Link>
        </div>

        {/* Popular Subcategories */}
        {popularSubcategories.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Popular</h4>
            <div className="grid grid-cols-1 gap-1">
              {popularSubcategories.map((subcategory) => (
                <Link key={subcategory.id} href={subcategory.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left hover:bg-purple-50 hover:text-purple-700"
                    data-testid={`subcategory-${subcategory.id}`}
                    onMouseEnter={() => setHoveredSubcategory(subcategory.id)}
                    onMouseLeave={() => setHoveredSubcategory(null)}
                    onClick={() => handleSubcategoryClick(subcategory)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{subcategory.name}</span>
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                        Popular
                      </span>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Subcategories */}
        {regularSubcategories.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">All Categories</h4>
            <div className="grid grid-cols-2 gap-1">
              {regularSubcategories.map((subcategory) => (
                <Link key={subcategory.id} href={subcategory.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left hover:bg-gray-50 hover:text-gray-900"
                    data-testid={`subcategory-${subcategory.id}`}
                    onMouseEnter={() => setHoveredSubcategory(subcategory.id)}
                    onMouseLeave={() => setHoveredSubcategory(null)}
                    onClick={() => handleSubcategoryClick(subcategory)}
                  >
                    <span className="text-sm">{subcategory.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Footer */}
        <div className="border-t border-gray-100 pt-3 mt-4">
          <div className="text-xs text-gray-500">
            {category.subcategories.length} subcategories available
          </div>
        </div>
      </div>
    </div>
  );
}