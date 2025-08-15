/**
 * Centralized, typed category registry for top navigation.
 * Provides a single source of truth for labels, vertical slugs,
 * and special handling flags used by routing and security aspects.
 */

export type VerticalSlug = 'fashion' | 'home' | 'electronics' | 'pets' | 'beauty' | 'sports' | 'brands';

export interface TopCategoryConfig {
  /** Display label in the UI */
  readonly label: string;
  /** Root vertical slug for routing */
  readonly vertical: VerticalSlug;
  /** True when this label corresponds to a fashion section that needs special fashion routing */
  readonly isFashionSection?: boolean;
  /** Optional fashion section id used by FashionRouteService */
  readonly fashionSectionId?: 'women' | 'men' | 'kids';
}

// Derive from TopNavConfig single source of truth
import { TOP_NAV_CONFIG } from './TopNavConfig';

export const TOP_CATEGORIES: readonly TopCategoryConfig[] = TOP_NAV_CONFIG.map(c => ({
  label: c.label,
  vertical: c.vertical,
  isFashionSection: c.isFashionSection,
  fashionSectionId: c.fashionSectionId
})) as const;

export const ALLOWED_CATEGORY_LABELS: ReadonlySet<string> = new Set(TOP_NAV_CONFIG.map((c) => c.label));

export function getCategoryConfigByLabel(label: string): TopCategoryConfig | undefined {
  return TOP_CATEGORIES.find((c) => c.label === label);
}

export function getVerticalForCategoryLabel(label: string): VerticalSlug | undefined {
  return getCategoryConfigByLabel(label)?.vertical;
}

export function isFashionCategoryLabel(label: string): boolean {
  return !!getCategoryConfigByLabel(label)?.isFashionSection;
}

export function getFashionSectionId(label: string): 'women' | 'men' | 'kids' | undefined {
  return getCategoryConfigByLabel(label)?.fashionSectionId;
}


