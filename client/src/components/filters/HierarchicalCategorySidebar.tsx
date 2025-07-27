/**
 * HierarchicalCategorySidebar.tsx - Enterprise Hierarchical Category Filter
 * 
 * Implements 3-level hierarchical category navigation like Poshmark:
 * Level 1: Main Categories (Women, Men, Kids, etc.)
 * Level 2: Subcategories (Accessories, Clothing, etc.)  
 * Level 3: Item Categories (Belts, Bags, Shoes, etc.)
 * 
 * Uses the enterprise AOP category system for data management.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDownIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  HIERARCHICAL_CATEGORY_DATA, 
  getAllCategoriesFlat, 
  getCategoriesUnderVertical,
  type CategoryItem 
} from '@/services/filtering/HierarchicalCategoryData';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface HierarchicalNode {
  id: string;
  name: string;
  count: number;
  level: number;
  parentId?: string;
  children: HierarchicalNode[];
  isExpanded: boolean;
  isSelected: boolean;
  metadata?: Record<string, unknown>;
}

interface CategorySelection {
  level1?: string; // Main category (women, men, kids)
  level2?: string; // Subcategory (accessories, clothing) 
  level3?: string; // Item category (belts, bags, shoes)
}

interface HierarchicalCategorySidebarProps {
  vertical: string;
  currentCategory?: string;
  onSelectionChange: (selection: CategorySelection) => void;
  className?: string;
}

// ============================================================================
// CATEGORY HIERARCHY BUILDER
// ============================================================================

class CategoryHierarchyBuilder {
  static buildHierarchy(categories: CategoryItem[]): HierarchicalNode[] {
    const nodeMap = new Map<string, HierarchicalNode>();
    const rootNodes: HierarchicalNode[] = [];

    // First pass: Create all nodes
    for (const category of categories) {
      const node: HierarchicalNode = {
        id: category.id,
        name: category.name,
        count: category.count,
        level: category.level,
        parentId: category.parentId,
        children: [],
        isExpanded: false,
        isSelected: false,
        metadata: category.metadata
      };
      nodeMap.set(category.id, node);
    }

    // Second pass: Build parent-child relationships
    for (const node of nodeMap.values()) {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    }

    // Sort nodes at each level
    this.sortHierarchy(rootNodes);
    
    return rootNodes;
  }

  private static calculateLevel(parentId: string, categories: CategoryItem[]): number {
    const parent = categories.find(c => c.id === parentId);
    if (!parent) return 0;
    if (!parent.parentId) return 1;
    return this.calculateLevel(parent.parentId, categories) + 1;
  }

  private static sortHierarchy(nodes: HierarchicalNode[]): void {
    nodes.sort((a, b) => {
      // Sort by count (descending) then by name
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });

    // Recursively sort children
    for (const node of nodes) {
      this.sortHierarchy(node.children);
    }
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const HierarchicalCategorySidebar: React.FC<HierarchicalCategorySidebarProps> = ({
  vertical,
  currentCategory,
  onSelectionChange,
  className = ""
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [hierarchy, setHierarchy] = useState<HierarchicalNode[]>([]);
  const [selection, setSelection] = useState<CategorySelection>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories from hierarchical data
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get categories for the specific vertical (fashion)
        const categoryData = getCategoriesUnderVertical(vertical === 'fashion' ? 'women' : vertical);
        setCategories(categoryData);
        
        const hierarchyData = CategoryHierarchyBuilder.buildHierarchy(categoryData);
        setHierarchy(hierarchyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        console.error('Error loading categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [vertical]);

  // Initialize selection based on current category
  useEffect(() => {
    if (currentCategory && hierarchy.length > 0) {
      const initialSelection = findCategoryPath(currentCategory, hierarchy);
      if (initialSelection) {
        setSelection(initialSelection);
        expandPathToSelection(hierarchy, initialSelection);
      }
    }
  }, [currentCategory, hierarchy]);

  // Handle node selection
  const handleNodeSelect = (node: HierarchicalNode) => {
    const newSelection: CategorySelection = {};
    
    // Determine which level this node belongs to
    if (node.level === 1) {
      newSelection.level1 = node.id;
      // Clear lower levels
      newSelection.level2 = undefined;
      newSelection.level3 = undefined;
    } else if (node.level === 2) {
      // Find parent (level 1)
      const parent = findParentNode(node.id, hierarchy);
      newSelection.level1 = parent?.id;
      newSelection.level2 = node.id;
      newSelection.level3 = undefined;
    } else if (node.level === 3) {
      // Find full path
      const path = findNodePath(node.id, hierarchy);
      newSelection.level1 = path[0]?.id;
      newSelection.level2 = path[1]?.id;
      newSelection.level3 = node.id;
    }

    setSelection(newSelection);
    onSelectionChange(newSelection);

    // Update expansion state
    const updatedHierarchy = updateExpansionState(hierarchy, newSelection);
    setHierarchy([...updatedHierarchy]);
  };

  // Handle node expansion toggle
  const handleNodeToggle = (nodeId: string) => {
    const updatedHierarchy = toggleNodeExpansion(hierarchy, nodeId);
    setHierarchy([...updatedHierarchy]);
  };

  // Clear selection
  const clearSelection = () => {
    const clearedSelection: CategorySelection = {};
    setSelection(clearedSelection);
    onSelectionChange(clearedSelection);
    
    // Collapse all nodes
    const collapsedHierarchy = collapseAllNodes(hierarchy);
    setHierarchy([...collapsedHierarchy]);
  };

  // Get breadcrumb path
  const breadcrumbPath = useMemo(() => {
    const path: string[] = [];
    if (selection.level1) {
      const level1Node = findNodeById(selection.level1, hierarchy);
      if (level1Node) path.push(level1Node.name);
    }
    if (selection.level2) {
      const level2Node = findNodeById(selection.level2, hierarchy);
      if (level2Node) path.push(level2Node.name);
    }
    if (selection.level3) {
      const level3Node = findNodeById(selection.level3, hierarchy);
      if (level3Node) path.push(level3Node.name);
    }
    return path;
  }, [selection, hierarchy]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={`w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="text-red-600 dark:text-red-400">
          <p className="font-medium">Error loading categories</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto ${className}`}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Categories</h2>
          {breadcrumbPath.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              className="h-6 px-2 text-xs text-gray-600 hover:text-gray-900"
              data-testid="button-clear-categories"
            >
              <XIcon className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Breadcrumb */}
        {breadcrumbPath.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Current Selection
            </div>
            <div className="flex flex-wrap gap-1">
              {breadcrumbPath.map((item, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
            <Separator />
          </div>
        )}

        {/* Hierarchical Category Tree */}
        <div className="space-y-1">
          {hierarchy.map(node => (
            <CategoryNode
              key={node.id}
              node={node}
              selection={selection}
              onSelect={handleNodeSelect}
              onToggle={handleNodeToggle}
              level={1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CATEGORY NODE COMPONENT
// ============================================================================

interface CategoryNodeProps {
  node: HierarchicalNode;
  selection: CategorySelection;
  onSelect: (node: HierarchicalNode) => void;
  onToggle: (nodeId: string) => void;
  level: number;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  node,
  selection,
  onSelect,
  onToggle,
  level
}) => {
  const hasChildren = node.children.length > 0;
  const isSelected = isNodeSelected(node, selection);
  const indentLevel = (level - 1) * 16; // 16px per level

  return (
    <div>
      <div
        className={`flex items-center justify-between py-2 px-2 rounded-md cursor-pointer transition-colors ${
          isSelected
            ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        style={{ marginLeft: `${indentLevel}px` }}
        onClick={() => onSelect(node)}
        data-testid={`category-node-${node.id}`}
      >
        <div className="flex items-center flex-1 min-w-0">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(node.id);
              }}
              className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-1"
              data-testid={`toggle-${node.id}`}
            >
              {node.isExpanded ? (
                <ChevronDownIcon className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRightIcon className="w-3 h-3 text-gray-500" />
              )}
            </button>
          )}
          
          <span className="text-sm font-medium truncate flex-1">
            {node.name}
          </span>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {node.count.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Children */}
      {hasChildren && node.isExpanded && (
        <div className="ml-2">
          {node.children.map(child => (
            <CategoryNode
              key={child.id}
              node={child}
              selection={selection}
              onSelect={onSelect}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function findCategoryPath(categoryId: string, hierarchy: HierarchicalNode[]): CategorySelection | null {
  const path = findNodePath(categoryId, hierarchy);
  if (path.length === 0) return null;

  const selection: CategorySelection = {};
  if (path[0]) selection.level1 = path[0].id;
  if (path[1]) selection.level2 = path[1].id;
  if (path[2]) selection.level3 = path[2].id;
  
  return selection;
}

function findNodePath(nodeId: string, hierarchy: HierarchicalNode[]): HierarchicalNode[] {
  for (const node of hierarchy) {
    if (node.id === nodeId) {
      return [node];
    }
    
    const childPath = findNodePath(nodeId, node.children);
    if (childPath.length > 0) {
      return [node, ...childPath];
    }
  }
  return [];
}

function findNodeById(nodeId: string, hierarchy: HierarchicalNode[]): HierarchicalNode | null {
  for (const node of hierarchy) {
    if (node.id === nodeId) {
      return node;
    }
    
    const found = findNodeById(nodeId, node.children);
    if (found) return found;
  }
  return null;
}

function findParentNode(nodeId: string, hierarchy: HierarchicalNode[]): HierarchicalNode | null {
  for (const node of hierarchy) {
    for (const child of node.children) {
      if (child.id === nodeId) {
        return node;
      }
      
      const found = findParentNode(nodeId, node.children);
      if (found) return found;
    }
  }
  return null;
}

function isNodeSelected(node: HierarchicalNode, selection: CategorySelection): boolean {
  return node.id === selection.level1 || 
         node.id === selection.level2 || 
         node.id === selection.level3;
}

function expandPathToSelection(hierarchy: HierarchicalNode[], selection: CategorySelection): void {
  const nodeIds = [selection.level1, selection.level2, selection.level3].filter(Boolean);
  
  for (const nodeId of nodeIds) {
    if (nodeId) {
      expandNodePath(hierarchy, nodeId);
    }
  }
}

function expandNodePath(hierarchy: HierarchicalNode[], targetId: string): boolean {
  for (const node of hierarchy) {
    if (node.id === targetId) {
      return true;
    }
    
    const found = expandNodePath(node.children, targetId);
    if (found) {
      node.isExpanded = true;
      return true;
    }
  }
  return false;
}

function toggleNodeExpansion(hierarchy: HierarchicalNode[], nodeId: string): HierarchicalNode[] {
  return hierarchy.map(node => {
    if (node.id === nodeId) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    
    return {
      ...node,
      children: toggleNodeExpansion(node.children, nodeId)
    };
  });
}

function updateExpansionState(hierarchy: HierarchicalNode[], selection: CategorySelection): HierarchicalNode[] {
  return hierarchy.map(node => {
    const shouldExpand = node.id === selection.level1 || 
                        node.id === selection.level2 ||
                        hasSelectedChild(node, selection);
    
    return {
      ...node,
      isExpanded: shouldExpand,
      children: updateExpansionState(node.children, selection)
    };
  });
}

function hasSelectedChild(node: HierarchicalNode, selection: CategorySelection): boolean {
  for (const child of node.children) {
    if (child.id === selection.level2 || child.id === selection.level3) {
      return true;
    }
    if (hasSelectedChild(child, selection)) {
      return true;
    }
  }
  return false;
}

function collapseAllNodes(hierarchy: HierarchicalNode[]): HierarchicalNode[] {
  return hierarchy.map(node => ({
    ...node,
    isExpanded: false,
    children: collapseAllNodes(node.children)
  }));
}