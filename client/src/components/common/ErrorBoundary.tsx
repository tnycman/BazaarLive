import React from 'react';
import { AnalyticsService } from '@/services/analytics/AnalyticsService';

interface ErrorBoundaryProps {
  readonly context?: Record<string, unknown>;
  readonly fallback?: React.ReactNode;
  readonly children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    try {
      const analytics = AnalyticsService.getInstance();
      analytics.trackEvent({
        eventType: 'ui_error',
        eventCategory: 'error',
        eventAction: 'component_error',
        eventLabel: error.message,
        properties: {
          ...(this.props.context || {}),
          page: typeof window !== 'undefined' ? window.location.pathname : '',
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        },
      });
    } catch {
      // swallow analytics errors to avoid cascading failures
    }
  }

  private handleRetry = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[200px] w-full flex items-center justify-center bg-red-50" data-testid="error-boundary-fallback">
          <div className="text-center p-4">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-sm text-red-600 mb-4">An unexpected error occurred while rendering this section.</p>
            <button
              className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={this.handleRetry}
              data-testid="error-boundary-retry"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;




