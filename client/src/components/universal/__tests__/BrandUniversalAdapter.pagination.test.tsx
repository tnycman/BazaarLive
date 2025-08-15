import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BrandUniversalAdapter from '@/components/universal/BrandUniversalAdapter';

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('BrandUniversalAdapter pagination', () => {
  it('uses nextCursor for subsequent requests', async () => {
    // First call returns nextCursor, second call should occur with cursor param
    const calls: string[] = [];
    // @ts-ignore
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      if (url.includes('/api/brands/')) {
        return { ok: true, json: async () => ({ id: 'gucci', name: 'Gucci' }) } as any;
      }
      if (!url.includes('cursor=')) {
        return { ok: true, json: async () => ({ items: [], nextCursor: 'c1' }) } as any;
      }
      return { ok: true, json: async () => ({ items: [], nextCursor: null }) } as any;
    }) as any;

    window.history.pushState({}, '', '/fashion/brands/gucci');
    render(
      <Wrapper>
        <Switch>
          <Route path="/fashion/brands/:brand" component={BrandUniversalAdapter} />
        </Switch>
      </Wrapper>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const first = calls.find((u) => u.includes('/api/listings/aggregate'))!;
    expect(first).not.toContain('cursor=');

    // Click 'Load more' button and assert cursor is used in subsequent request
    const loadMore = await screen.findByTestId('button-load-more');
    fireEvent.click(loadMore);
    await waitFor(() => expect(calls.some((u) => /cursor=c1/.test(u))).toBe(true));
  });
});


