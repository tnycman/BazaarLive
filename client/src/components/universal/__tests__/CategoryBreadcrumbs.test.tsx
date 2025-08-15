import React from 'react';
import { render, screen } from '@testing-library/react';
import { CategoryBreadcrumbs } from '@/components/universal/CategoryBreadcrumbs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('CategoryBreadcrumbs', () => {
  it('renders section-only breadcrumb and marks it current', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CategoryBreadcrumbs
          path={{ section: { id: 'women', name: 'Women', level: 1 } }}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText('Women')).toBeInTheDocument();
    expect(screen.getByText('Women')).toHaveAttribute('aria-current', 'page');
  });

  it('renders section and subsection with correct ordering', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CategoryBreadcrumbs
          path={{
            section: { id: 'women', name: 'Women', level: 1 },
            subsection: { id: 'bags', name: 'Bags', level: 2, parentId: 'women' },
          }}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText('Women')).toBeInTheDocument();
    expect(screen.getByText('Bags')).toBeInTheDocument();
    expect(screen.getByText('Bags')).toHaveAttribute('aria-current', 'page');
  });
});


