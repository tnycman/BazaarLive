import React from 'react';
import { render, screen } from '@testing-library/react';
import { CategoryDirectory } from '@/components/universal/CategoryDirectory';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('CategoryDirectory', () => {
  it('lists subsections for a section-only path', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CategoryDirectory
          path={{ section: { id: 'women', name: 'Women', level: 1 } }}
        />
      </QueryClientProvider>
    );

    // Expect some known subsections from data (accessories, bags)
    expect(screen.getByText('Accessories')).toBeInTheDocument();
    expect(screen.getByText('Bags')).toBeInTheDocument();
  });
});


