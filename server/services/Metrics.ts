type CounterMap = Record<string, number>;
type HistogramMap = Record<string, number[]>;

class MetricsRegistry {
  private counters: CounterMap = {};
  private histograms: HistogramMap = {};

  public increment(name: string, value: number = 1): void {
    this.counters[name] = (this.counters[name] || 0) + value;
  }

  public observe(name: string, value: number): void {
    if (!this.histograms[name]) this.histograms[name] = [];
    this.histograms[name].push(value);
  }

  public getCounters(): CounterMap {
    return { ...this.counters };
  }

  public getHistograms(): Record<string, { count: number; min: number; max: number; avg: number }> {
    const out: Record<string, { count: number; min: number; max: number; avg: number }> = {};
    for (const [name, values] of Object.entries(this.histograms)) {
      if (values.length === 0) {
        out[name] = { count: 0, min: 0, max: 0, avg: 0 };
        continue;
      }
      const count = values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / count;
      out[name] = { count, min, max, avg };
    }
    return out;
  }
}

export const metrics = new MetricsRegistry();



