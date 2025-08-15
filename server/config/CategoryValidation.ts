// Server-side allowlists and slug normalization for category validation
import { getCategories, getSubcategories, getLeaves } from '../../shared/taxonomy';

export const allowedVerticals = new Set<string>(['fashion']);

// Allowed top-level categories for vertical 'fashion'
export const allowedCategoriesByVertical = new Map<string, Set<string>>([
  ['fashion', new Set<string>(getCategories('fashion').map((c) => c.id))]
]);

// Subcategory allowlist for categories with defined structures in the repo
export const allowedSubcategoriesByCategory = new Map<string, Set<string>>(
  getCategories('fashion').map((cat) => [cat.id, new Set(getSubcategories('fashion', cat.id).map((s) => s.id))]) as [string, Set<string>][]
);

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

export function validateVertical(rawVertical: string): { ok: boolean; value?: string; reason?: string } {
  const v = normalizeSlug(rawVertical);
  if (!allowedVerticals.has(v)) return { ok: false, reason: `unsupported vertical: ${v}` };
  return { ok: true, value: v };
}

export function validateCategories(vertical: string, rawCategories: string[]): { ok: boolean; values?: string[]; reason?: string } {
  const allow = allowedCategoriesByVertical.get(vertical);
  if (!allow) return { ok: false, reason: `no categories configured for vertical: ${vertical}` };
  const values = rawCategories.map(normalizeSlug);
  for (const c of values) {
    if (!allow.has(c)) return { ok: false, reason: `unsupported category: ${c}` };
  }
  // ensure unique
  const unique = Array.from(new Set(values));
  return { ok: true, values: unique };
}

export function validateSubcategoryForCategories(categories: string[], rawSubcategory?: string): { ok: boolean; value?: string; reason?: string } {
  if (!rawSubcategory) return { ok: true };
  const sub = normalizeSlug(rawSubcategory);
  // For categories that have defined subcategory allowlists, the subcategory must be present in ALL
  for (const cat of categories) {
    const allowed = allowedSubcategoriesByCategory.get(cat);
    if (allowed) {
      if (!allowed.has(sub)) return { ok: false, reason: `unsupported subcategory: ${sub} for category: ${cat}` };
    } else {
      // Category has no subcategory mapping → reject subcategory for strictness
      return { ok: false, reason: `subcategory not supported for category: ${cat}` };
    }
  }
  return { ok: true, value: sub };
}

// Leaf allowlists per category/subcategory derived from taxonomy
const allowedLeavesByCategorySubcategory = new Map<string, Map<string, Set<string>>>(
  getCategories('fashion').map((cat) => [
    cat.id,
    new Map<string, Set<string>>(
      getSubcategories('fashion', cat.id).map((sub) => [sub.id, new Set(getLeaves('fashion', cat.id, sub.id).map((l) => l.id))]) as [string, Set<string>][]
    )
  ]) as [string, Map<string, Set<string>>][]
);

export function validateLeafForCategories(categories: string[], subcategory?: string, rawLeaf?: string): { ok: boolean; value?: string; reason?: string } {
  if (!rawLeaf) return { ok: true };
  const leaf = normalizeSlug(rawLeaf);
  if (!subcategory) return { ok: false, reason: 'leaf requires subcategory' };
  const sub = normalizeSlug(subcategory);

  // Leaf is valid if it exists under the provided subcategory for at least one category in the set
  for (const cat of categories) {
    const catLeaves = allowedLeavesByCategorySubcategory.get(cat)?.get(sub);
    if (catLeaves && catLeaves.has(leaf)) {
      return { ok: true, value: leaf };
    }
  }
  return { ok: false, reason: `unsupported leaf: ${leaf} for subcategory: ${sub}` };
}


