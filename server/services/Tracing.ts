export interface Span {
  setAttribute(key: string, value: string | number | boolean): void;
  end(status?: 'ok' | 'error'): void;
}

class NoopSpan implements Span {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setAttribute(_key: string, _value: string | number | boolean): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  end(_status?: 'ok' | 'error'): void {}
}

export interface Tracer {
  startSpan(name: string, attrs?: Record<string, string | number | boolean>): Span;
}

class SimpleTracer implements Tracer {
  startSpan(name: string, attrs?: Record<string, string | number | boolean>): Span {
    try {
      const start = Date.now();
      if (attrs) {
        // lightweight structured log for spans
        // eslint-disable-next-line no-console
        console.log(JSON.stringify({ level: 'debug', span: name, phase: 'start', ...attrs, ts: start }));
      }
      return {
        setAttribute: (key, value) => {
          // eslint-disable-next-line no-console
          console.log(JSON.stringify({ level: 'debug', span: name, phase: 'attr', [key]: value }));
        },
        end: (status) => {
          const end = Date.now();
          // eslint-disable-next-line no-console
          console.log(JSON.stringify({ level: 'debug', span: name, phase: 'end', status: status || 'ok', durationMs: end - start, ts: end }));
        }
      } as Span;
    } catch {
      return new NoopSpan();
    }
  }
}

// Factory for future OpenTelemetry integration
export function getTracer(): Tracer {
  // In the future, inspect env to return an OTEL tracer
  return new SimpleTracer();
}



