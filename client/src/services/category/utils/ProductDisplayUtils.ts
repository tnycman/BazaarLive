import type { ProductItem } from '@/components/grid/EnterpriseProductGrid';

export type ProductFillStrategy = 'repeat';

export interface EnsureMinimumProductsOptions {
  readonly minCount?: number;
  readonly strategy?: ProductFillStrategy;
}

export function ensureMinimumProducts(
  sourceProducts: readonly ProductItem[] | undefined,
  options: EnsureMinimumProductsOptions = {}
): ProductItem[] {
  const min = options.minCount ?? 16;
  const strategy: ProductFillStrategy = options.strategy ?? 'repeat';

  if (!Array.isArray(sourceProducts) || sourceProducts.length === 0) {
    return [];
  }

  if (sourceProducts.length >= min) {
    return [...sourceProducts];
  }

  const result: ProductItem[] = [...sourceProducts];
  if (strategy === 'repeat') {
    let index = 0;
    let batch = 1;
    while (result.length < min) {
      const base = sourceProducts[index % sourceProducts.length];
      const suffix = `-x${batch}`;
      const nextId = `${base.id}${suffix}`;
      // Avoid accidental duplicate id if base list already had suffix
      const finalId = result.some(p => p.id === nextId)
        ? `${base.id}${suffix}-${result.length}`
        : nextId;

      result.push({
        ...base,
        id: finalId,
      });

      index++;
      if (index % sourceProducts.length === 0) batch++;
    }
  }

  return result;
}



