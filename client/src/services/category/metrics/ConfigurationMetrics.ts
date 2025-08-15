export type ResolutionPath = 'cache' | 'manifest' | 'api' | 'miss';

export interface ConfigurationLoadMetric {
  readonly key: string;
  readonly pathTried: ResolutionPath;
  readonly durationMs: number;
  readonly success: boolean;
  readonly timestamp: number;
  readonly errorMessage?: string;
}

interface MetricsSummary {
  total: number;
  cacheHits: number;
  manifestHits: number;
  apiHits: number;
  misses: number;
  failures: number;
}

class ConfigurationMetricsCollector {
  private readonly events: ConfigurationLoadMetric[] = [];
  private summary: MetricsSummary = {
    total: 0,
    cacheHits: 0,
    manifestHits: 0,
    apiHits: 0,
    misses: 0,
    failures: 0,
  };
  private reporterStarted = false;

  record(event: ConfigurationLoadMetric): void {
    this.events.push(event);
    this.summary.total += 1;
    if (!event.success) this.summary.failures += 1;
    switch (event.pathTried) {
      case 'cache':
        if (event.success) this.summary.cacheHits += 1;
        break;
      case 'manifest':
        if (event.success) this.summary.manifestHits += 1;
        break;
      case 'api':
        if (event.success) this.summary.apiHits += 1;
        break;
      case 'miss':
        this.summary.misses += 1;
        break;
    }
  }

  getSummary(): MetricsSummary {
    return { ...this.summary };
  }

  getRecentFailures(limit = 5): ReadonlyArray<ConfigurationLoadMetric> {
    const failures = this.events.filter(e => !e.success).slice(-limit);
    return failures;
  }

  getRecent(limit = 10): ReadonlyArray<ConfigurationLoadMetric> {
    return this.events.slice(-limit);
  }

  startDevReporter(intervalMs = 60000): void {
    if (this.reporterStarted) return;
    this.reporterStarted = true;
    const isDev = (import.meta as any)?.env?.MODE === 'development' || process.env.NODE_ENV === 'development';
    if (!isDev) return;
    setInterval(() => {
      const s = this.getSummary();
      const failures = this.getRecentFailures(3);
      const recent = this.getRecent(1)[0];
      // Concise dev diagnostics, no PII
      // eslint-disable-next-line no-console
      console.log('[ConfigMetrics] summary', s, failures.length ? { recentFailures: failures } : {}, recent ? { last: recent } : {});
    }, intervalMs);
  }
}

export const configurationMetrics = new ConfigurationMetricsCollector();


