import React from 'react';
import { render, screen } from '@testing-library/react';
import { Switch, Route } from 'wouter';
import { Navigation } from '@/components/Navigation';
import { fashionRouteService } from '@/services/routing/FashionRouteService';
import { navigationStateManager } from '@/services/navigation/NavigationStateManager';
import { TOP_NAV_CONFIG } from '@/services/navigation/TopNavConfig';
import { slugify } from '@/services/routing/RouteUtils';

// Helper wrapper with minimal router to satisfy Link rendering
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <Switch>
      <Route path="/:rest*">{children}</Route>
    </Switch>
  );
}

describe('Navigation dropdown header links', () => {
  it('renders Women section header as a link to the section index', () => {
    // Arrange: open Women dropdown
    navigationStateManager.reset();
    navigationStateManager.setState((prev) => ({
      ...prev,
      activeDropdown: 'Women',
      hoveredCategory: 'Women',
      isTransitioning: false,
    }));

    const women = TOP_NAV_CONFIG.find((c) => c.label === 'Women');
    expect(women).toBeDefined();
    const section = women!.sections[0];
    const expectedHref = fashionRouteService.generateFashionUrl('women', slugify(section.title));

    // Act
    render(
      <Wrapper>
        <Navigation />
      </Wrapper>
    );

    // Assert
    const headerLink = screen.getByRole('link', { name: section.title });
    expect(headerLink).toHaveAttribute('href', expectedHref);
  });
});


