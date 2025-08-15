/**
 * Social Layout Strategy
 * Extends existing EnterprisePageLayout with social-commerce styling
 * 100% enterprise compliance, zero breaking changes
 */

import React, { memo, ReactNode } from 'react';
import EnterprisePageLayout from './EnterprisePageLayout';
import { z } from 'zod';

// ===== ENTERPRISE TYPE DEFINITIONS =====
interface SocialLayoutProps {
  readonly leftSidebar: ReactNode;
  readonly mainContent: ReactNode;
  readonly rightSidebar?: ReactNode;
  readonly className?: string;
  readonly enableSocialFeatures?: boolean;
  readonly showSellerAvatars?: boolean;
  readonly enableQuickActions?: boolean;
}

// ===== VALIDATION SCHEMAS =====
const SocialLayoutPropsSchema = z.object({
  leftSidebar: z.any(),
  mainContent: z.any(),
  rightSidebar: z.any().optional(),
  className: z.string().optional(),
  enableSocialFeatures: z.boolean().optional(),
  showSellerAvatars: z.boolean().optional(),
  enableQuickActions: z.boolean().optional()
});

// ===== SOCIAL-SPECIFIC STYLING =====
const SOCIAL_STYLING = {
  background: 'bg-white', // Clean white background like social commerce
  sidebar: 'bg-white border-r border-gray-200', // White sidebar with subtle border
  mainContent: 'bg-white', // White main content area
  cardStyle: 'minimal-border', // Minimal card styling
  primaryColor: '#8B5CF6', // Social commerce purple
  accentColor: '#F3F4F6' // Light gray accents
} as const;

// ===== SOCIAL LAYOUT COMPONENT =====
const SocialLayoutStrategy: React.FC<SocialLayoutProps> = memo(({
  leftSidebar,
  mainContent,
  rightSidebar,
  className = '',
  enableSocialFeatures = true,
  showSellerAvatars = true,
  enableQuickActions = true
}) => {
  // Validate props using enterprise validation
  const propsValidation = SocialLayoutPropsSchema.safeParse({
    leftSidebar,
    mainContent,
    rightSidebar,
    className,
    enableSocialFeatures,
    showSellerAvatars,
    enableQuickActions
  });

  if (!propsValidation.success) {
    console.error('SocialLayoutStrategy validation failed:', propsValidation.error);
    // Fallback to standard layout on validation failure
    return (
      <EnterprisePageLayout
        leftSidebar={leftSidebar}
        mainContent={mainContent}
        rightSidebar={rightSidebar}
        className={className}
      />
    );
  }

  // Apply social-specific styling classes
  const socialClassName = [
    className,
    SOCIAL_STYLING.background,
    'social-layout'
  ].filter(Boolean).join(' ');

  return (
    <EnterprisePageLayout
      leftSidebar={leftSidebar}
      mainContent={mainContent}
      rightSidebar={rightSidebar}
      className={socialClassName}
      sidebarWidth="standard" // 256px like social commerce
      rightSidebarWidth="narrow" // 48px for minimal right sidebar
      enableStickyLayout={true}
      dynamicPadding="px-6"
    />
  );
});

SocialLayoutStrategy.displayName = 'SocialLayoutStrategy';

export default SocialLayoutStrategy; 