export type SidebarWidth = 'narrow' | 'standard' | 'wide' | undefined;

export interface CategoryLayoutPolicy {
  readonly containerClass: string; // e.g., 'w-full' or 'max-w-7xl mx-auto'
  readonly showRightSidebar: boolean;
  readonly rightSidebarWidth: SidebarWidth;
  readonly dynamicPadding?: string; // e.g., 'px-0' for fashion
}

/**
 * Returns layout policy for a given category/subcategory.
 * Centralizes layout rules to prevent regressions.
 */
export function getLayoutPolicyForCategory(
  category: string,
  _subcategory?: string,
  _subSubcategory?: string
): CategoryLayoutPolicy {
  const normalized = (category || '').toLowerCase();
  const subcategory = (_subcategory || '').toLowerCase();

  if (normalized === 'fashion') {
    // Fashion: use full-width container so the right rail sits further to the right of the 4× grid
    // Keep standard right rail width, and rely on page layout gap for separation
    return {
      containerClass: 'w-full',
      showRightSidebar: true,
      rightSidebarWidth: 'standard',
      dynamicPadding: undefined
    };
  }

  return {
    containerClass: 'max-w-7xl mx-auto',
    showRightSidebar: true,
    rightSidebarWidth: 'standard',
    dynamicPadding: undefined
  };
}



