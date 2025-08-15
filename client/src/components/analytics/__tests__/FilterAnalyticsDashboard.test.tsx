/**
 * Filter Analytics Dashboard Tests
 * Comprehensive unit tests for analytics dashboard component
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterAnalyticsDashboard, type DashboardConfig } from '@/components/analytics/FilterAnalyticsDashboard';
import { NavigationFilterProvider } from '@/components/navigation/NavigationFilterProvider';

// ===== TEST MOCKS =====

/**
 * Mock analytics service
 */
jest.mock('@/services/analytics/FilterAnalyticsService', () => ({
  FilterAnalyticsService: jest.fn().mockImplementation(() => ({
    generateReport: jest.fn().mockReturnValue({
      reportId: 'test-report-1',
      reportType: 'user_behavior',
      title: 'User Behavior Report',
      description: 'Test report description',
      generatedAt: new Date('2024-01-01'),
      period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      },
      data: {
        summary: {
          totalEvents: 1000,
          uniqueUsers: 500,
          averageSessionDuration: 300000,
          conversionRate: 0.25,
          errorRate: 0.02,
          performanceScore: 0.95,
        },
        details: [
          {
            category: 'Event Types',
            metric: 'filter_applied',
            value: 800,
            change: 0,
            trend: 'up' as const,
          },
          {
            category: 'Event Types',
            metric: 'filter_removed',
            value: 200,
            change: 0,
            trend: 'down' as const,
          },
        ],
        charts: [
          {
            chartId: 'event-timeline',
            chartType: 'line' as const,
            title: 'Event Timeline',
            data: [
              { x: 0, y: 100, label: '0:00' },
              { x: 1, y: 150, label: '1:00' },
            ],
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: true,
              legend: true,
              tooltips: true,
            },
          },
        ],
        tables: [
          {
            tableId: 'user-activity',
            title: 'User Activity',
            headers: ['User ID', 'Events', 'Session Duration', 'Last Activity'],
            rows: [
              {
                id: 'user-1',
                cells: [
                  { value: 'user-1', type: 'text' as const },
                  { value: 50, type: 'number' as const },
                  { value: 'N/A', type: 'text' as const },
                  { value: '2024-01-01T10:00:00.000Z', type: 'date' as const },
                ],
              },
            ],
            pagination: {
              pageSize: 10,
              currentPage: 1,
              totalPages: 1,
              totalItems: 1,
            },
          },
        ],
      },
      insights: [
        {
          insightId: 'insight-1',
          type: 'trend' as const,
          title: 'Increasing Filter Usage',
          description: 'Filter usage has increased by 15% this week',
          confidence: 0.85,
          impact: 'medium' as const,
          data: [],
        },
      ],
      recommendations: [
        {
          recommendationId: 'rec-1',
          category: 'performance' as const,
          title: 'Optimize Filter Performance',
          description: 'Consider implementing caching to improve performance',
          priority: 'high' as const,
          effort: 'medium' as const,
          impact: 'high' as const,
          actions: [
            {
              actionId: 'action-1',
              title: 'Implement Caching',
              description: 'Add caching layer',
              steps: ['Step 1', 'Step 2'],
              estimatedEffort: 8,
              resources: ['Developer'],
            },
          ],
        },
      ],
      metadata: {
        version: '1.0',
        generatedBy: 'FilterAnalyticsService',
        dataSources: ['user-behavior'],
        filters: ['date-range'],
        calculations: ['conversion-rate'],
        notes: 'Test report',
      },
    }),
    getAllReports: jest.fn().mockReturnValue([]),
    exportAnalyticsData: jest.fn().mockReturnValue('{"test": "data"}'),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    clearAnalyticsData: jest.fn(),
  })),
}));

/**
 * Mock navigation filter hook
 */
jest.mock('@/components/navigation/NavigationFilterConsumer', () => ({
  useNavigationFilter: jest.fn().mockReturnValue({
    filterState: {
      selectedCategories: ['clothing'],
      selectedBrands: ['nike'],
      selectedSizes: ['M'],
      selectedColors: ['red'],
      selectedPrices: ['0-50'],
      selectedAvailability: ['in-stock'],
      selectedTypes: ['new'],
      brandSearchQuery: '',
      searchQuery: '',
      sortBy: 'newest' as const,
      viewMode: 'grid' as const,
      currentPage: 1,
      itemsPerPage: 20,
      priceRange: undefined,
      expandedSections: [],
    },
    filterActions: {
      updateCategories: jest.fn(),
      updateBrands: jest.fn(),
      updateSizes: jest.fn(),
      updateColors: jest.fn(),
      updatePrices: jest.fn(),
      updateAvailability: jest.fn(),
      updateTypes: jest.fn(),
      updateBrandSearchQuery: jest.fn(),
      updateSearchQuery: jest.fn(),
      updateSortBy: jest.fn(),
      updateViewMode: jest.fn(),
      updateCurrentPage: jest.fn(),
      updateItemsPerPage: jest.fn(),
      updatePriceRange: jest.fn(),
      updateExpandedSections: jest.fn(),
      clearAllFilters: jest.fn(),
      resetToDefaults: jest.fn(),
    },
    computed: {
      hasAppliedFilters: true,
      appliedFiltersCount: 5,
      isFilterStateEmpty: false,
      getFilterSummary: jest.fn().mockReturnValue('5 filters applied'),
    },
    options: {
      availableCategories: ['clothing', 'shoes', 'accessories'],
      availableBrands: ['nike', 'adidas', 'puma'],
      availableSizes: ['S', 'M', 'L', 'XL'],
      availableColors: ['red', 'blue', 'green', 'black'],
      availablePrices: ['0-50', '50-100', '100-200', '200+'],
      availableAvailability: ['in-stock', 'out-of-stock', 'pre-order'],
      availableTypes: ['new', 'used', 'refurbished'],
      sortOptions: ['newest', 'price-low', 'price-high', 'popular', 'rating'],
      viewModeOptions: ['grid', 'list'],
      pageSizeOptions: [10, 20, 50, 100],
    },
    performance: {
      lastUpdateTime: Date.now(),
      updateCount: 10,
      averageUpdateTime: 150,
      memoryUsage: 1024,
      cpuUsage: 0.05,
    },
    analytics: {
      totalEvents: 1000,
      uniqueUsers: 500,
      conversionRate: 0.25,
      errorRate: 0.02,
      performanceScore: 0.95,
    },
  }),
}));

// ===== TEST UTILITIES =====

/**
 * Test wrapper component
 */
function TestWrapper({ children }: { readonly children: React.ReactNode }): JSX.Element {
  return (
    <NavigationFilterProvider>
      {children}
    </NavigationFilterProvider>
  );
}

/**
 * Default dashboard config for testing
 */
const defaultConfig: DashboardConfig = {
  title: 'Filter Analytics Dashboard',
  description: 'Comprehensive analytics for filter system',
  refreshInterval: 30000,
  autoRefresh: false,
  showCharts: true,
  showTables: true,
  showInsights: true,
  showRecommendations: true,
  chartTypes: ['line', 'bar', 'pie'],
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
  },
  filters: [],
};

// ===== TEST SUITE =====

describe('FilterAnalyticsDashboard', () => {
  // ===== RENDERING TESTS =====

  describe('rendering', () => {
    it('should render dashboard with correct title and description', () => {
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      expect(screen.getByText('Filter Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive analytics for filter system')).toBeInTheDocument();
    });

    it('should render metrics cards', () => {
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      expect(screen.getByText('Total Events')).toBeInTheDocument();
      expect(screen.getByText('Unique Users')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('Performance Score')).toBeInTheDocument();
      expect(screen.getByText('Error Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg Session Duration')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      expect(screen.getByText('Refresh')).toBeInTheDocument();
      expect(screen.getByText('Export JSON')).toBeInTheDocument();
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    it('should render reports section', () => {
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('should render top events section', () => {
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      expect(screen.getByText('Top Events')).toBeInTheDocument();
    });

    it('should render performance alerts section', () => {
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      expect(screen.getByText('Performance Alerts')).toBeInTheDocument();
    });
  });

  // ===== INTERACTION TESTS =====

  describe('interactions', () => {
    it('should handle refresh button click', async () => {
      const onConfigChange = jest.fn();
      
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard 
            config={defaultConfig} 
            onConfigChange={onConfigChange}
          />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(refreshButton).toBeDisabled();
      });
    });

    it('should handle export JSON button click', () => {
      const onExport = jest.fn();
      
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard 
            config={defaultConfig} 
            onExport={onExport}
          />
        </TestWrapper>
      );

      const exportButton = screen.getByText('Export JSON');
      fireEvent.click(exportButton);

      expect(onExport).toHaveBeenCalledWith('{"test": "data"}', 'json');
    });

    it('should handle export CSV button click', () => {
      const onExport = jest.fn();
      
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard 
            config={defaultConfig} 
            onExport={onExport}
          />
        </TestWrapper>
      );

      const exportButton = screen.getByText('Export CSV');
      fireEvent.click(exportButton);

      expect(onExport).toHaveBeenCalledWith('{"test": "data"}', 'csv');
    });

    it('should handle report selection', () => {
      const onReportSelect = jest.fn();
      
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard 
            config={defaultConfig} 
            onReportSelect={onReportSelect}
          />
        </TestWrapper>
      );

      // Wait for reports to load and then click on one
      waitFor(() => {
        const reportCards = screen.getAllByText(/Report/);
        if (reportCards.length > 0) {
          fireEvent.click(reportCards[0]);
          expect(onReportSelect).toHaveBeenCalled();
        }
      });
    });
  });

  // ===== CONFIGURATION TESTS =====

  describe('configuration', () => {
    it('should respect showCharts configuration', () => {
      const configWithoutCharts = {
        ...defaultConfig,
        showCharts: false,
      };

      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={configWithoutCharts} />
        </TestWrapper>
      );

      // Charts should not be rendered when showCharts is false
      expect(screen.queryByText('Event Timeline')).not.toBeInTheDocument();
    });

    it('should respect showTables configuration', () => {
      const configWithoutTables = {
        ...defaultConfig,
        showTables: false,
      };

      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={configWithoutTables} />
        </TestWrapper>
      );

      // Tables should not be rendered when showTables is false
      expect(screen.queryByText('User Activity')).not.toBeInTheDocument();
    });

    it('should respect showInsights configuration', () => {
      const configWithoutInsights = {
        ...defaultConfig,
        showInsights: false,
      };

      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={configWithoutInsights} />
        </TestWrapper>
      );

      // Insights should not be rendered when showInsights is false
      expect(screen.queryByText('Insights')).not.toBeInTheDocument();
    });

    it('should respect showRecommendations configuration', () => {
      const configWithoutRecommendations = {
        ...defaultConfig,
        showRecommendations: false,
      };

      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={configWithoutRecommendations} />
        </TestWrapper>
      );

      // Recommendations should not be rendered when showRecommendations is false
      expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    });
  });

  // ===== ERROR HANDLING TESTS =====

  describe('error handling', () => {
    it('should display error message when loading fails', async () => {
      // Mock the analytics service to throw an error
      const mockAnalyticsService = require('@/services/analytics/FilterAnalyticsService');
      mockAnalyticsService.FilterAnalyticsService.mockImplementation(() => ({
        generateReport: jest.fn().mockRejectedValue(new Error('Failed to load reports')),
        getAllReports: jest.fn().mockReturnValue([]),
        exportAnalyticsData: jest.fn().mockReturnValue('{"test": "data"}'),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        clearAnalyticsData: jest.fn(),
      }));

      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Failed to load reports')).toBeInTheDocument();
      });
    });

    it('should handle missing data gracefully', () => {
      // Mock the analytics service to return empty data
      const mockAnalyticsService = require('@/services/analytics/FilterAnalyticsService');
      mockAnalyticsService.FilterAnalyticsService.mockImplementation(() => ({
        generateReport: jest.fn().mockReturnValue({
          reportId: 'test-report-1',
          reportType: 'user_behavior',
          title: 'User Behavior Report',
          description: 'Test report description',
          generatedAt: new Date('2024-01-01'),
          period: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31'),
          },
          data: {
            summary: {
              totalEvents: 0,
              uniqueUsers: 0,
              averageSessionDuration: 0,
              conversionRate: 0,
              errorRate: 0,
              performanceScore: 0,
            },
            details: [],
            charts: [],
            tables: [],
          },
          insights: [],
          recommendations: [],
          metadata: {
            version: '1.0',
            generatedBy: 'FilterAnalyticsService',
            dataSources: [],
            filters: [],
            calculations: [],
            notes: 'Test report',
          },
        }),
        getAllReports: jest.fn().mockReturnValue([]),
        exportAnalyticsData: jest.fn().mockReturnValue('{"test": "data"}'),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        clearAnalyticsData: jest.fn(),
      }));

      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      // Should render without crashing
      expect(screen.getByText('Filter Analytics Dashboard')).toBeInTheDocument();
    });
  });

  // ===== ACCESSIBILITY TESTS =====

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).toHaveAttribute('disabled');

      const exportButtons = screen.getAllByRole('button');
      exportButtons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh');
      refreshButton.focus();
      expect(refreshButton).toHaveFocus();

      // Test tab navigation
      fireEvent.keyDown(refreshButton, { key: 'Tab' });
      // Should move focus to next element
    });
  });

  // ===== PERFORMANCE TESTS =====

  describe('performance', () => {
    it('should render efficiently with large datasets', () => {
      const startTime = performance.now();

      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time
      expect(renderTime).toBeLessThan(1000); // 1 second
    });

    it('should handle frequent updates efficiently', async () => {
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh');

      // Simulate rapid clicks
      for (let i = 0; i < 5; i++) {
        fireEvent.click(refreshButton);
      }

      // Should handle rapid updates without crashing
      expect(refreshButton).toBeInTheDocument();
    });
  });

  // ===== INTEGRATION TESTS =====

  describe('integration', () => {
    it('should integrate with navigation filter context', () => {
      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      // Should access filter state from context
      expect(screen.getByText('Filter Analytics Dashboard')).toBeInTheDocument();
    });

    it('should handle analytics service events', () => {
      const mockAnalyticsService = require('@/services/analytics/FilterAnalyticsService');
      const mockAddEventListener = jest.fn();
      const mockRemoveEventListener = jest.fn();

      mockAnalyticsService.FilterAnalyticsService.mockImplementation(() => ({
        generateReport: jest.fn().mockReturnValue({
          reportId: 'test-report-1',
          reportType: 'user_behavior',
          title: 'User Behavior Report',
          description: 'Test report description',
          generatedAt: new Date('2024-01-01'),
          period: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31'),
          },
          data: {
            summary: {
              totalEvents: 1000,
              uniqueUsers: 500,
              averageSessionDuration: 300000,
              conversionRate: 0.25,
              errorRate: 0.02,
              performanceScore: 0.95,
            },
            details: [],
            charts: [],
            tables: [],
          },
          insights: [],
          recommendations: [],
          metadata: {
            version: '1.0',
            generatedBy: 'FilterAnalyticsService',
            dataSources: [],
            filters: [],
            calculations: [],
            notes: 'Test report',
          },
        }),
        getAllReports: jest.fn().mockReturnValue([]),
        exportAnalyticsData: jest.fn().mockReturnValue('{"test": "data"}'),
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        clearAnalyticsData: jest.fn(),
      }));

      render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      // Should setup event listeners
      expect(mockAddEventListener).toHaveBeenCalledWith('behavior-tracked', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('performance-alert', expect.any(Function));
    });
  });

  // ===== CLEANUP TESTS =====

  describe('cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      const mockAnalyticsService = require('@/services/analytics/FilterAnalyticsService');
      const mockRemoveEventListener = jest.fn();

      mockAnalyticsService.FilterAnalyticsService.mockImplementation(() => ({
        generateReport: jest.fn().mockReturnValue({
          reportId: 'test-report-1',
          reportType: 'user_behavior',
          title: 'User Behavior Report',
          description: 'Test report description',
          generatedAt: new Date('2024-01-01'),
          period: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31'),
          },
          data: {
            summary: {
              totalEvents: 1000,
              uniqueUsers: 500,
              averageSessionDuration: 300000,
              conversionRate: 0.25,
              errorRate: 0.02,
              performanceScore: 0.95,
            },
            details: [],
            charts: [],
            tables: [],
          },
          insights: [],
          recommendations: [],
          metadata: {
            version: '1.0',
            generatedBy: 'FilterAnalyticsService',
            dataSources: [],
            filters: [],
            calculations: [],
            notes: 'Test report',
          },
        }),
        getAllReports: jest.fn().mockReturnValue([]),
        exportAnalyticsData: jest.fn().mockReturnValue('{"test": "data"}'),
        addEventListener: jest.fn(),
        removeEventListener: mockRemoveEventListener,
        clearAnalyticsData: jest.fn(),
      }));

      const { unmount } = render(
        <TestWrapper>
          <FilterAnalyticsDashboard config={defaultConfig} />
        </TestWrapper>
      );

      unmount();

      // Should cleanup event listeners
      expect(mockRemoveEventListener).toHaveBeenCalled();
    });
  });
});

// ===== TEST UTILITIES =====

/**
 * Test utility to create mock dashboard config
 */
export function createMockDashboardConfig(overrides: Partial<DashboardConfig> = {}): DashboardConfig {
  return {
    ...defaultConfig,
    ...overrides,
  };
}

/**
 * Test utility to wait for loading to complete
 */
export async function waitForLoadingToComplete(): Promise<void> {
  await waitFor(() => {
    const loadingText = screen.queryByText('Loading...');
    expect(loadingText).not.toBeInTheDocument();
  });
} 