import React from 'react';
import { Link } from 'wouter';
import { HIERARCHICAL_CATEGORY_DATA } from '@/services/filtering/HierarchicalCategoryData';
import { ResolvedPath } from '@/services/category/CategoryTaxonomyService';
import { fashionRouteService } from '@/services/routing/FashionRouteService';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchCategoryProducts } from '@/hooks/useCategoryProducts';
import { fireCategoryNavigate } from '@/services/analytics/NavigationAnalytics';
import { addPrefetch } from '@/services/perf/HeadPrefetch';

interface CategoryDirectoryProps {
  path: ResolvedPath;
}

export const CategoryDirectory: React.FC<CategoryDirectoryProps> = ({ path }) => {
  const queryClient = useQueryClient();
  if (!path.section) return null;

  const section = HIERARCHICAL_CATEGORY_DATA[path.section.id];
  const subsection = path.subsection ? section.subcategories[path.subsection.id] : undefined;

  if (!subsection) {
    const entries = Object.entries(section.subcategories);
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6" data-testid="category-directory-section" role="list">
        {entries.map(([subId, sub]: [string, any]) => {
          const url = fashionRouteService.generateFashionUrl(path.section!.id, subId);
          return (
            <Link key={subId} href={url}>
              <div
                onMouseEnter={() => {
                  addPrefetch(url, 'fetch');
                  prefetchCategoryProducts(queryClient, { vertical: 'fashion', section: path.section!.id, subsection: subId }).catch(() => {});
                }}
                onClick={() => {
                  fireCategoryNavigate({ vertical: 'fashion', section: path.section!.id, subsection: subId, source: 'directory' }).catch(() => {});
                }}
                role="link"
                aria-label={`${sub.name} category`}
                className="px-3 py-2 rounded border border-gray-200 hover:border-purple-400 hover:text-purple-700 cursor-pointer"
              >
                {sub.name}
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  const items = subsection.items;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6" data-testid="category-directory-subsection" role="list">
      {items.map((leaf: any) => {
        const url = fashionRouteService.generateFashionUrl(path.section!.id, path.subsection!.id, leaf.id);
        return (
          <Link key={leaf.id} href={url}>
            <div
              onMouseEnter={() => {
                addPrefetch(url, 'fetch');
                prefetchCategoryProducts(
                  queryClient,
                  { vertical: 'fashion', section: path.section!.id, subsection: path.subsection!.id, leaf: leaf.id }
                ).catch(() => {});
              }}
              onClick={() => {
                fireCategoryNavigate({ vertical: 'fashion', section: path.section!.id, subsection: path.subsection!.id, leaf: leaf.id, source: 'directory' }).catch(() => {});
              }}
              role="link"
              aria-label={`${leaf.name} category`}
              className="px-3 py-2 rounded border border-gray-200 hover:border-purple-400 hover:text-purple-700 cursor-pointer"
            >
              {leaf.name}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
