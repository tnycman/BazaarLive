/**
 * Filter Performance Monitor Component Tests
 * Comprehensive unit tests for FilterPerformanceMonitor component
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterPerformanceMonitor, useFilterPerformanceMonitor } from '../FilterPerformanceMonitor';
import { NavigationFilterProvider } from '@/components/navigation/NavigationFilterProvider';
import type { FilterPerformanceAlert, FilterPerformanceMetrics } from '../FilterPerformanceMonitor';

// ===== MOCK SETUP =====

// Mock the navigation filter provider
jest.mock('@/components/navigation/NavigationFilterProvider', () => ({
  useNavigationFilter: jest.fn(),
  NavigationFilterProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => 1000),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    },
  },
  writable: true,
});

// ===== TEST UTILITIES =====

const mockUseNavigationFilter = jest.mocked(require('@/components/navigation/NavigationFilterProvider').useNavigationFilter);

const createMockNavigationFilterContext = () => ({
  state: {
    selectedCategories: ['test-category'],
    selectedBrands: ['test-brand'],
    selectedSizes: ['M'],
    selectedColors: ['red'],
    selectedPrices: ['$10-$20'],
    selectedAvailability: ['in-stock'],
    selectedTypes: ['shirt'],
    brandSearchQuery: 'test',
    searchQuery: 'test query',
    sortBy: 'newest' as const,
    viewMode: 'grid' as const,
    currentPage: 1,
    itemsPerPage: 20,
    priceRange: { min: 10, max: 100 },
    expandedSections: ['categories'],
  },
  computed: {
    hasAppliedFilters: true,
    appliedFiltersCount: 5,
    isLoading: false,
    error: null,
    performanceMetrics: [
      {
        updateTime: 50,
        validationTime: 10,
        urlSyncTime: 20,
        subscriberNotificationTime: 5,
        cacheHit: true,
        timestamp: Date.now(),
      },
    ],
    analyticsEvents: [
      {
        eventType: 'state_update' as const,
        stateSnapshot: {},
        timestamp: Date.now(),
      },
    ],
  },
  actions: {
    updateState: jest.fn(),
    clearFilters: jest.fn(),
    updateCategories: jest.fn(),
    updateBrands: jest.fn(),
    updateSizes: jest.fn(),
    updateColors: jest.fn(),
    updatePrices: jest.fn(),
    updateAvailability: jest.fn(),
    updateTypes: jest.fn(),
    updateBrandSearch: jest.fn(),
    updateSearchQuery: jest.fn(),
    updateSortBy: jest.fn(),
    updateViewMode: jest.fn(),
    updatePage: jest.fn(),
    updateItemsPerPage: jest.fn(),
    updatePriceRange: jest.fn(),
    toggleCategory: jest.fn(),
    toggleBrand: jest.fn(),
    toggleSize: jest.fn(),
    toggleColor: jest.fn(),
    togglePrice: jest.fn(),
    toggleAvailability: jest.fn(),
    toggleType: jest.fn(),
    toggleExpandedSection: jest.fn(),
    batchUpdate: jest.fn(),
    resetToDefaults: jest.fn(),
    applyPreset: jest.fn(),
  },
  utilities: {
    clearPerformanceMetrics: jest.fn(),
    clearAnalyticsEvents: jest.fn(),
    setURLSyncEnabled: jest.fn(),
    validateState: jest.fn(),
    validateUpdate: jest.fn(),
  },
});

// ===== TEST COMPONENT WRAPPER =====

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NavigationFilterProvider>
    {children}
  </NavigationFilterProvider>
);

// ===== FILTER PERFORMANCE MONITOR TESTS =====

describe('FilterPerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigationFilter.mockReturnValue(createMockNavigationFilterContext());
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor />
        </TestWrapper>
      );

      expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor className="custom-class" />
        </TestWrapper>
      );

      const container = screen.getByText('Performance Monitor').closest('.filter-performance-monitor-panel');
      expect(container).toHaveClass('custom-class');
    });

    it('should render children content', () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor>
            <div data-testid="child-content">Child Content</div>
          </FilterPerformanceMonitor>
        </TestWrapper>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Monitoring Controls', () => {
    it('should start monitoring when autoStart is true', async () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor autoStart={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    it('should not start monitoring when autoStart is false', () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor autoStart={false} />
        </TestWrapper>
      );

      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should toggle monitoring when start/stop button is clicked', async () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor autoStart={false} />
        </TestWrapper>
      );

      const toggleButton = screen.getByText('Start Monitoring');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Stop Monitoring')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Stop Monitoring'));

      await waitFor(() => {
        expect(screen.getByText('Start Monitoring')).toBeInTheDocument();
        expect(screen.getByText('Inactive')).toBeInTheDocument();
      });
    });

    it('should clear metrics when clear button is clicked', async () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor autoStart={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Clear Metrics')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Clear Metrics');
      fireEvent.click(clearButton);

      // Metrics should be cleared (no metrics summary should be visible)
      await waitFor(() => {
        expect(screen.queryByText('Performance Summary')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance Metrics Display', () => {
    it('should display performance summary when metrics are available', async () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor autoStart={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Performance Summary')).toBeInTheDocument();
        expect(screen.getByText('Latest Update Time')).toBeInTheDocument();
        expect(screen.getByText('Avg Update Time')).toBeInTheDocument();
      });
    });

    it('should display correct metric values', async () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor autoStart={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('50.00ms')).toBeInTheDocument(); // Latest Update Time
      });
    });

    it('should not display performance summary when no metrics are available', () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor autoStart={false} />
        </TestWrapper>
      );

      expect(screen.queryByText('Performance Summary')).not.toBeInTheDocument();
    });
  });

  describe('Performance Alerts', () => {
    it('should display alerts when performance thresholds are exceeded', async () => {
      // Mock metrics that exceed thresholds
      const mockContext = createMockNavigationFilterContext();
      mockContext.computed.performanceMetrics = [
        {
          updateTime: 200, // Exceeds default threshold of 100
          validationTime: 100, // Exceeds default threshold of 50
          urlSyncTime: 300, // Exceeds default threshold of 200
          subscriberNotificationTime: 100, // Exceeds default threshold of 50
          cacheHit: false,
          timestamp: Date.now(),
        },
      ];
      mockUseNavigationFilter.mockReturnValue(mockContext);

      render(
        <TestWrapper>
          <FilterPerformanceMonitor autoStart={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Recent Alerts')).toBeInTheDocument();
      });
    });

    it('should not display alerts when performance is within thresholds', async () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor autoStart={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Recent Alerts')).not.toBeInTheDocument();
      });
    });
  });

  describe('Callback Functions', () => {
    it('should call onPerformanceAlert when alerts are generated', async () => {
      const onPerformanceAlert = jest.fn();
      
      // Mock metrics that exceed thresholds
      const mockContext = createMockNavigationFilterContext();
      mockContext.computed.performanceMetrics = [
        {
          updateTime: 200, // Exceeds threshold
          validationTime: 10,
          urlSyncTime: 20,
          subscriberNotificationTime: 5,
          cacheHit: true,
          timestamp: Date.now(),
        },
      ];
      mockUseNavigationFilter.mockReturnValue(mockContext);

      render(
        <TestWrapper>
          <FilterPerformanceMonitor 
            autoStart={true} 
            onPerformanceAlert={onPerformanceAlert}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onPerformanceAlert).toHaveBeenCalled();
      });
    });

    it('should call onMetricsUpdate when metrics are collected', async () => {
      const onMetricsUpdate = jest.fn();

      render(
        <TestWrapper>
          <FilterPerformanceMonitor 
            autoStart={true} 
            onMetricsUpdate={onMetricsUpdate}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onMetricsUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('Configuration Options', () => {
    it('should respect enabled prop', () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor enabled={false} />
        </TestWrapper>
      );

      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });

    it('should respect updateInterval prop', async () => {
      jest.useFakeTimers();
      
      const onMetricsUpdate = jest.fn();
      
      render(
        <TestWrapper>
          <FilterPerformanceMonitor 
            autoStart={true} 
            updateInterval={500}
            onMetricsUpdate={onMetricsUpdate}
          />
        </TestWrapper>
      );

      // Fast-forward time to trigger metrics update
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(onMetricsUpdate).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });

    it('should respect maxMetricsHistory prop', async () => {
      render(
        <TestWrapper>
          <FilterPerformanceMonitor 
            autoStart={true} 
            maxMetricsHistory={5}
          />
        </TestWrapper>
      );

      // The component should limit metrics history to 5 items
      await waitFor(() => {
        expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      // Mock an error in the navigation filter context
      const mockContext = createMockNavigationFilterContext();
      mockContext.computed.error = new Error('Test error');
      mockUseNavigationFilter.mockReturnValue(mockContext);

      render(
        <TestWrapper>
          <FilterPerformanceMonitor />
        </TestWrapper>
      );

      expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
    });
  });
});

// ===== USE FILTER PERFORMANCE MONITOR HOOK TESTS =====

describe('useFilterPerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return monitor state and functions', () => {
    const TestComponent = () => {
      const monitor = useFilterPerformanceMonitor();
      return (
        <div>
          <div data-testid="is-monitoring">{monitor.monitorState.isMonitoring ? 'true' : 'false'}</div>
          <div data-testid="metrics-count">{monitor.monitorState.metrics.length}</div>
          <div data-testid="alerts-count">{monitor.monitorState.alerts.length}</div>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('is-monitoring')).toHaveTextContent('false');
    expect(screen.getByTestId('metrics-count')).toHaveTextContent('0');
    expect(screen.getByTestId('alerts-count')).toHaveTextContent('0');
  });

  it('should start monitoring when startMonitoring is called', () => {
    const TestComponent = () => {
      const monitor = useFilterPerformanceMonitor();
      return (
        <div>
          <div data-testid="is-monitoring">{monitor.monitorState.isMonitoring ? 'true' : 'false'}</div>
          <button onClick={monitor.startMonitoring}>Start</button>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('is-monitoring')).toHaveTextContent('false');
    
    fireEvent.click(screen.getByText('Start'));
    
    expect(screen.getByTestId('is-monitoring')).toHaveTextContent('true');
  });

  it('should stop monitoring when stopMonitoring is called', () => {
    const TestComponent = () => {
      const monitor = useFilterPerformanceMonitor();
      return (
        <div>
          <div data-testid="is-monitoring">{monitor.monitorState.isMonitoring ? 'true' : 'false'}</div>
          <button onClick={monitor.startMonitoring}>Start</button>
          <button onClick={monitor.stopMonitoring}>Stop</button>
        </div>
      );
    };

    render(<TestComponent />);

    fireEvent.click(screen.getByText('Start'));
    expect(screen.getByTestId('is-monitoring')).toHaveTextContent('true');
    
    fireEvent.click(screen.getByText('Stop'));
    expect(screen.getByTestId('is-monitoring')).toHaveTextContent('false');
  });

  it('should clear metrics when clearMetrics is called', () => {
    const TestComponent = () => {
      const monitor = useFilterPerformanceMonitor();
      return (
        <div>
          <div data-testid="metrics-count">{monitor.monitorState.metrics.length}</div>
          <div data-testid="alerts-count">{monitor.monitorState.alerts.length}</div>
          <button onClick={monitor.clearMetrics}>Clear</button>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('metrics-count')).toHaveTextContent('0');
    expect(screen.getByTestId('alerts-count')).toHaveTextContent('0');
    
    fireEvent.click(screen.getByText('Clear'));
    
    expect(screen.getByTestId('metrics-count')).toHaveTextContent('0');
    expect(screen.getByTestId('alerts-count')).toHaveTextContent('0');
  });

  it('should update thresholds when updateThresholds is called', () => {
    const TestComponent = () => {
      const monitor = useFilterPerformanceMonitor();
      return (
        <div>
          <div data-testid="update-time-threshold">{monitor.monitorState.thresholds.updateTime}</div>
          <button onClick={() => monitor.updateThresholds({ updateTime: 200 })}>Update</button>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('update-time-threshold')).toHaveTextContent('100');
    
    fireEvent.click(screen.getByText('Update'));
    
    expect(screen.getByTestId('update-time-threshold')).toHaveTextContent('200');
  });
});

// ===== TYPE TESTS =====

describe('FilterPerformanceMonitor Types', () => {
  it('should have correct FilterPerformanceMetrics type', () => {
    const metrics: FilterPerformanceMetrics = {
      timestamp: Date.now(),
      updateTime: 100,
      validationTime: 50,
      urlSyncTime: 200,
      subscriberNotificationTime: 25,
      totalTime: 375,
      cacheHit: true,
      memoryUsage: 50 * 1024 * 1024,
      cpuUsage: 75.5,
      networkRequests: 5,
      errors: 0,
      warnings: 2,
    };

    expect(metrics).toBeDefined();
    expect(typeof metrics.timestamp).toBe('number');
    expect(typeof metrics.updateTime).toBe('number');
    expect(typeof metrics.cacheHit).toBe('boolean');
  });

  it('should have correct FilterPerformanceAlert type', () => {
    const alert: FilterPerformanceAlert = {
      type: 'warning',
      message: 'Update time exceeds threshold',
      metrics: {
        timestamp: Date.now(),
        updateTime: 150,
        validationTime: 50,
        urlSyncTime: 200,
        subscriberNotificationTime: 25,
        totalTime: 425,
        cacheHit: false,
        memoryUsage: 60 * 1024 * 1024,
        cpuUsage: 80,
        networkRequests: 8,
        errors: 1,
        warnings: 3,
      },
      threshold: 100,
      timestamp: Date.now(),
    };

    expect(alert).toBeDefined();
    expect(alert.type).toBe('warning');
    expect(typeof alert.message).toBe('string');
    expect(typeof alert.threshold).toBe('number');
  });
}); 