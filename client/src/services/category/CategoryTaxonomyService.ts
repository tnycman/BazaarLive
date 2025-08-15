import { HIERARCHICAL_CATEGORY_DATA } from "@/services/filtering/HierarchicalCategoryData";

export interface TaxonomyNode {
  id: string;
  name: string;
  level: number; // 1 section, 2 subsection, 3 leaf
  parentId?: string;
}

export interface ResolvedPath {
  section?: TaxonomyNode;
  subsection?: TaxonomyNode;
  leaf?: TaxonomyNode;
}

class CategoryTaxonomyService {
  public resolve(sectionSlug?: string, subsectionSlug?: string, leafSlug?: string): ResolvedPath | null {
    if (!sectionSlug) return null;

    const section = HIERARCHICAL_CATEGORY_DATA[sectionSlug];
    if (!section) return null;

    const resolved: ResolvedPath = {
      section: { id: sectionSlug, name: section.name, level: 1 }
    };

    if (!subsectionSlug) return resolved;

    const subsection = section.subcategories[subsectionSlug];
    if (!subsection) return null;

    resolved.subsection = { id: subsectionSlug, name: subsection.name, level: 2, parentId: sectionSlug };

    if (!leafSlug) return resolved;

    const leaf = subsection.items.find(i => i.id === leafSlug);
    if (!leaf) return null;

    resolved.leaf = { id: leaf.id, name: leaf.name, level: 3, parentId: subsectionSlug };
    return resolved;
  }

  public getBreadcrumbs(path: ResolvedPath): TaxonomyNode[] {
    const crumbs: TaxonomyNode[] = [];
    if (path.section) crumbs.push(path.section);
    if (path.subsection) crumbs.push(path.subsection);
    if (path.leaf) crumbs.push(path.leaf);
    return crumbs;
  }
}

export const categoryTaxonomyService = new CategoryTaxonomyService();




