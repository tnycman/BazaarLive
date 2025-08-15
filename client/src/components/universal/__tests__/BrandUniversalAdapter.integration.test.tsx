import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BrandUniversalAdapter from '@/components/universal/BrandUniversalAdapter';

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('BrandUniversalAdapter integration', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/brands/')) {
        return { ok: true, json: async () => ({ id: 'gucci', name: 'Gucci' }) } as any;
      }
      return { ok: true, json: async () => ({ items: [], nextCursor: null }) } as any;
    }) as any;
  });

  it('issues a request that includes brands param for the selected brand', async () => {
    // Simulate router at /fashion/brands/gucci
    window.history.pushState({}, '', '/fashion/brands/gucci');
    render(
      <Wrapper>
        <Switch>
          <Route path="/fashion/brands/:brand" component={BrandUniversalAdapter} />
        </Switch>
      </Wrapper>
    );
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/api/listings/aggregate');
    expect(url).toMatch(/brands=.*gucci/i);
  });

  it('renders with universal layout and brand title only (no legacy intro)', async () => {
    window.history.pushState({}, '', '/fashion/brands/gucci');
    const { findByText, queryByText } = render(
      <Wrapper>
        <Switch>
          <Route path="/fashion/brands/:brand" component={BrandUniversalAdapter} />
        </Switch>
      </Wrapper>
    );
    expect(await findByText(/Gucci/)).toBeInTheDocument();
    // Ensure legacy intro line is not rendered
    expect(queryByText(/across categories from verified sellers/i)).toBeNull();
  });
});


