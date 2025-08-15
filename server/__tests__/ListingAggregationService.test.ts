import { aggregateListings } from '../services/ListingAggregationService';

// Mock storage
jest.mock('../storage', () => ({
  storage: {
    getListings: jest.fn(async (args: any) => {
      const { category } = args;
      // Return synthetic items with duplicates across categories
      const base = [
        { id: '1', title: 'A', brand: 'nike', price: '$10', createdAt: '2025-01-01T00:00:00.000Z', stats: { likes: 1 }, subcategory: 'accessories' },
        { id: '2', title: 'B', brand: 'adidas', price: '$20', createdAt: '2025-01-02T00:00:00.000Z', stats: { likes: 5 }, subcategory: 'accessories' },
        { id: '3', title: 'C', brand: 'puma', price: '$30', createdAt: '2025-01-03T00:00:00.000Z', stats: { likes: 2 }, subcategory: 'clothing' }
      ];
      if (category === 'men') {
        // introduce dup id '2' across categories
        return [base[1], { id: '4', title: 'D', brand: 'nike', price: '$40', createdAt: '2025-01-04T00:00:00.000Z', stats: { likes: 9 }, subcategory: 'accessories' }];
      }
      return base;
    })
  }
}));

describe('ListingAggregationService.aggregateListings', () => {
  const common = {
    traceId: 't',
    vertical: 'fashion',
    sortBy: 'newest' as const,
    limit: 10,
    cursor: null as string | null,
  };

  it('merges per-category results and dedupes by id', async () => {
    const { items, nextCursor } = await aggregateListings({
      ...common,
      categories: ['women', 'men'],
    });
    // Sorted newest desc by createdAt and tie-breaker; ids in returned order
    expect(items.map((i) => i.id)).toEqual(['4', '3', '2', '1']);
    expect(nextCursor).toBeNull();
  });

  it('applies subcategory filter', async () => {
    const { items } = await aggregateListings({
      ...common,
      categories: ['women', 'men'],
      subcategory: 'accessories'
    });
    expect(items.every((i) => String(i.subcategory).toLowerCase() === 'accessories')).toBe(true);
  });

  it('applies brand and price filters', async () => {
    const { items } = await aggregateListings({
      ...common,
      categories: ['women', 'men'],
      filters: { brands: ['nike'], minPrice: 15, maxPrice: 50 }
    });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i: any) => String(i.brand).toLowerCase() === 'nike')).toBe(true);
  });

  it('supports keyset pagination', async () => {
    const page1 = await aggregateListings({ ...common, categories: ['women', 'men'], limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).toBeTruthy();
    const page2 = await aggregateListings({ ...common, categories: ['women', 'men'], limit: 2, cursor: page1.nextCursor });
    // Ensure no overlap between pages
    const p1Ids = new Set(page1.items.map((i) => i.id));
    expect(page2.items.some((i) => p1Ids.has(i.id))).toBe(false);
  });
});



