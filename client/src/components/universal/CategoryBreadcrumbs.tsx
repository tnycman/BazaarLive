import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { ResolvedPath, TaxonomyNode } from '@/services/category/CategoryTaxonomyService';
import { fashionRouteService } from '@/services/routing/FashionRouteService';
import { useQueryClient } from '@tanstack/react-query';
import { buildCategoryProductsKey, prefetchCategoryProducts } from '@/hooks/useCategoryProducts';
import { fireCategoryNavigate } from '@/services/analytics/NavigationAnalytics';
import { addPrefetch } from '@/services/perf/HeadPrefetch';

interface CategoryBreadcrumbsProps {
  path: ResolvedPath;
}

export const CategoryBreadcrumbs: React.FC<CategoryBreadcrumbsProps> = ({ path }) => {
  const queryClient = useQueryClient();
  const crumbs: TaxonomyNode[] = [];
  if (path.section) crumbs.push(path.section);
  if (path.subsection) crumbs.push(path.subsection);
  if (path.leaf) crumbs.push(path.leaf);

  const toUrl = (idx: number): string => {
    const section = crumbs[0]?.id;
    const subsection = crumbs[1]?.id;
    const leaf = crumbs[2]?.id;
    if (idx === 0) return fashionRouteService.generateFashionUrl(section!);
    if (idx === 1) return fashionRouteService.generateFashionUrl(section!, subsection);
    return fashionRouteService.generateFashionUrl(section!, subsection, leaf);
  };

  const prefetchParams = useMemo(() => {
    const section = crumbs[0]?.id;
    const subsection = crumbs[1]?.id;
    const leaf = crumbs[2]?.id;
    return [
      { vertical: 'fashion', section, subsection: undefined, leaf: undefined },
      { vertical: 'fashion', section, subsection, leaf: undefined },
      { vertical: 'fashion', section, subsection, leaf }
    ];
  }, [crumbs]);

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm" data-testid="category-breadcrumbs">
      <ol className="flex items-center gap-2 text-gray-600" role="list">
        {crumbs.map((node, idx) => (
          <li key={node.id} className="flex items-center gap-2" role="listitem">
            {idx > 0 && <span className="text-gray-400">/</span>}
            <Link href={toUrl(idx)}>
              <span
                onMouseEnter={() => {
                  const url = toUrl(idx);
                  addPrefetch(url, 'fetch');
                  const p = prefetchParams[idx];
                  if (p && p.section) prefetchCategoryProducts(queryClient, p).catch(() => {});
                }}
                onClick={() => {
                  const section = crumbs[0]?.id;
                  const subsection = crumbs[1]?.id;
                  const leaf = crumbs[2]?.id;
                  fireCategoryNavigate({ vertical: 'fashion', section, subsection: idx >= 1 ? subsection : undefined, leaf: idx >= 2 ? leaf : undefined, source: 'breadcrumbs' }).catch(() => {});
                }}
                aria-current={idx === crumbs.length - 1 ? 'page' : undefined}
                className={`hover:text-purple-600 ${idx === crumbs.length - 1 ? 'text-gray-900 font-medium' : ''}`}
              >
                {node.name}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};


