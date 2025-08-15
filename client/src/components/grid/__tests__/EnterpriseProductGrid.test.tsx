import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EnterpriseProductGrid from '@/components/grid/EnterpriseProductGrid';

describe('EnterpriseProductGrid sourceCategory badge', () => {
  const base = {
    onProductClick: jest.fn(),
    onLikeToggle: jest.fn(),
    onSellerClick: jest.fn(),
    onShare: jest.fn(),
    isLoading: false,
  };

  const product = {
    id: '1',
    title: 'Item',
    brand: 'Nike',
    price: '$10',
    size: 'M',
    images: ['https://example.com/x.jpg'],
    seller: { id: 's1', username: 'user' },
    stats: { likes: 0, comments: 0, shares: 0 },
    isLiked: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    sourceCategory: 'women'
  } as any;

  it('renders sourceCategory badge when present', () => {
    render(
      <EnterpriseProductGrid
        title="Grid"
        products={[product]}
        {...base}
      />
    );

    expect(screen.getByTestId('badge-source-1')).toBeInTheDocument();
    expect(screen.getByTestId('badge-source-1').textContent).toBe('Women');
  });
});



