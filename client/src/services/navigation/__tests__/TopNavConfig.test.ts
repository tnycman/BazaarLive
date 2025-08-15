import { TOP_NAV_CONFIG, ALLOWED_CATEGORY_LABELS as ALLOWED_FROM_TOPNAV } from '@/services/navigation/TopNavConfig';
import { ALLOWED_CATEGORY_LABELS as ALLOWED_FROM_CATEGORIES, TOP_CATEGORIES } from '@/services/navigation/NavigationCategories';

describe('TopNavConfig single source of truth', () => {
  it('derives allowlist labels exclusively from TOP_NAV_CONFIG', () => {
    const labelsFromTopNav = new Set(TOP_NAV_CONFIG.map((c) => c.label));
    const labelsFromAllowlist = new Set(ALLOWED_FROM_TOPNAV);
    expect(labelsFromAllowlist.size).toBe(labelsFromTopNav.size);
    for (const l of labelsFromTopNav) {
      expect(labelsFromAllowlist.has(l)).toBe(true);
    }
  });

  it('NavigationCategories mirrors TOP_NAV_CONFIG meta (label, vertical, fashion flags)', () => {
    const byLabel = new Map(TOP_NAV_CONFIG.map((c) => [c.label, c] as const));
    expect(TOP_CATEGORIES.length).toBe(TOP_NAV_CONFIG.length);
    for (const cat of TOP_CATEGORIES) {
      const src = byLabel.get(cat.label);
      expect(src).toBeDefined();
      expect(cat.vertical).toBe(src!.vertical);
      expect(!!cat.isFashionSection).toBe(!!src!.isFashionSection);
      expect(cat.fashionSectionId).toBe(src!.fashionSectionId);
    }
  });

  it('NavigationCategories allowlist equals TOP_NAV_CONFIG allowlist', () => {
    const a = Array.from(ALLOWED_FROM_TOPNAV).sort();
    const b = Array.from(ALLOWED_FROM_CATEGORIES).sort();
    expect(a).toEqual(b);
  });
});




