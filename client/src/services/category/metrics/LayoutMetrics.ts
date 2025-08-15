export interface LayoutDecisionEvent {
  readonly category: string;
  readonly subcategory?: string;
  readonly containerClass: string;
  readonly rightSidebar: boolean;
  readonly rightSidebarWidth?: 'narrow' | 'standard' | 'wide';
  readonly dynamicPadding?: string;
  readonly timestamp: number;
}

class LayoutMetricsCollector {
  private readonly events: LayoutDecisionEvent[] = [];

  record(event: LayoutDecisionEvent): void {
    this.events.push(event);
  }

  getRecent(limit = 10): ReadonlyArray<LayoutDecisionEvent> {
    return this.events.slice(-limit);
  }
}

export const layoutMetrics = new LayoutMetricsCollector();



