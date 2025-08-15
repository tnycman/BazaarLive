import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategoryListings } from '@/hooks/useCategoryListings';

describe('useCategoryListings (aggregate path)', () => {
  const queryClient = new QueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  function TestHookComponent() {
    const { products, nextCursor, isLoading, isError } = useCategoryListings({
      vertical: 'fashion',
      category: 'women',
      additionalCategories: ['men'],
      enabled: true,
      limit: 2
    });
    return (
      <div>
        <div data-testid="loading">{String(isLoading)}</div>
        <div data-testid="error">{String(isError)}</div>
        <div data-testid="count">{products.length}</div>
        <div data-testid="cursor">{nextCursor ?? ''}</div>
        {products.map((p) => (
          <div key={p.id} data-testid={`item-${p.id}`}>{p.sourceCategory || ''}</div>
        ))}
      </div>
    );
  }

  beforeEach(() => {
    queryClient.clear();
    // @ts-ignore
    global.fetch = jest.fn(async () => {
      return {
        ok: true,
        json: async () => ({
          items: [
            { id: '1', title: 'A', brand: 'nike', price: '$10', images: [], seller: { id: 's', username: 'u' }, stats: { likes: 0, comments: 0, shares: 0 }, createdAt: '2025-01-01', sourceCategory: 'women' },
            { id: '1', title: 'A-dup', brand: 'nike', price: '$10', images: [], seller: { id: 's', username: 'u' }, stats: { likes: 0, comments: 0, shares: 0 }, createdAt: '2025-01-01', sourceCategory: 'men' },
          ],
          nextCursor: 'CURSOR_1'
        })
      } as any;
    });
  });

  it('maps products, dedupes by id, and exposes nextCursor', async () => {
    render(<TestHookComponent />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    // Deduped length should be 1 (id '1')
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('item-1').textContent).toBe('women');
    expect(screen.getByTestId('cursor').textContent).toBe('CURSOR_1');
  });
});


