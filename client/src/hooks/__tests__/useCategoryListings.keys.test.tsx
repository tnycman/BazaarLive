import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategoryListings } from '@/hooks/useCategoryListings';

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

function TestComp({ additional }: { additional: string[] }) {
  useCategoryListings({ vertical: 'fashion', category: 'women', additionalCategories: additional, enabled: true });
  return null;
}

describe('useCategoryListings query key stability', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ items: [], nextCursor: null }) })) as any;
  });

  it('sorts categories in the aggregate request ensuring stable URL', async () => {
    render(<TestComp additional={['men', 'kids']} />, { wrapper: Wrapper });
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const firstUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(firstUrl).toContain('categories=kids%2Cmen');

    (global.fetch as jest.Mock).mockClear();
    render(<TestComp additional={['kids', 'men']} />, { wrapper: Wrapper });
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const secondUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(secondUrl).toContain('categories=kids%2Cmen');
  });

  it('includes brands in aggregate URL when provided', async () => {
    const TestBrands: React.FC = () => {
      useCategoryListings({ vertical: 'fashion', brands: ['gucci', 'prada'], enabled: true });
      return null;
    };

    // @ts-ignore
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ items: [], nextCursor: null }) })) as any;

    render(<TestBrands />, { wrapper: Wrapper });
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/api/listings/aggregate');
    expect(url).toContain('brands=gucci%2Cprada');
  });
});



