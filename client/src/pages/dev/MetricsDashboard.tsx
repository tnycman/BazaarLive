import React, { useEffect, useState } from 'react';
import { configurationMetrics } from '@/services/category/metrics/ConfigurationMetrics';
import { layoutMetrics } from '@/services/category/metrics/LayoutMetrics';
import { configurationRegistry } from '@/services/category/configs/ConfigurationRegistry';

interface ConfigSummary {
  total: number;
  cacheHits: number;
  manifestHits: number;
  apiHits: number;
  misses: number;
  failures: number;
}

export default function MetricsDashboard() {
  const [summary, setSummary] = useState<ConfigSummary>(configurationMetrics.getSummary());
  const [recentFailures, setRecentFailures] = useState(configurationMetrics.getRecentFailures(5));
  const [recentLayouts, setRecentLayouts] = useState(layoutMetrics.getRecent(10));
  const [policy, setPolicy] = useState(configurationRegistry.__getResolutionPolicy());

  useEffect(() => {
    const id = setInterval(() => {
      setSummary(configurationMetrics.getSummary());
      setRecentFailures(configurationMetrics.getRecentFailures(5));
      setRecentLayouts(layoutMetrics.getRecent(10));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Developer Metrics</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Controls</h2>
        <div className="flex items-center gap-3 bg-white border rounded-lg p-4">
          <button
            className="px-3 py-2 border rounded"
            onClick={() => { configurationRegistry.__clearCache(); }}
          >Clear Config Cache</button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Resolution Policy:</span>
            <select
              className="border rounded px-2 py-1"
              value={policy}
              onChange={(e) => {
                const v = e.target.value as 'dynamic-first' | 'static-first';
                configurationRegistry.__setResolutionPolicyOverride(v);
                setPolicy(v);
              }}
            >
              <option value="dynamic-first">dynamic-first</option>
              <option value="static-first">static-first</option>
            </select>
            <button
              className="px-3 py-2 border rounded"
              onClick={() => { configurationRegistry.__setResolutionPolicyOverride(null); setPolicy(configurationRegistry.__getResolutionPolicy()); }}
            >Reset</button>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Configuration Resolution Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Metric label="Total Loads" value={summary.total} />
          <Metric label="Cache Hits" value={summary.cacheHits} />
          <Metric label="Manifest Hits" value={summary.manifestHits} />
          <Metric label="API Hits" value={summary.apiHits} />
          <Metric label="Misses" value={summary.misses} />
          <Metric label="Failures" value={summary.failures} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Recent Resolution Failures</h2>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <Th>Key</Th>
                <Th>Path</Th>
                <Th>Duration (ms)</Th>
                <Th>Error</Th>
                <Th>When</Th>
              </tr>
            </thead>
            <tbody>
              {recentFailures.length === 0 ? (
                <tr><td className="p-3" colSpan={5}>No failures</td></tr>
              ) : recentFailures.map((f, i) => (
                <tr key={i} className="border-t">
                  <Td>{f.key}</Td>
                  <Td>{f.pathTried}</Td>
                  <Td>{f.durationMs.toFixed(1)}</Td>
                  <Td className="truncate max-w-[360px]" title={f.errorMessage}>{f.errorMessage}</Td>
                  <Td>{new Date(f.timestamp).toLocaleTimeString()}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Recent Layout Decisions</h2>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <Th>Category</Th>
                <Th>Subcategory</Th>
                <Th>Container</Th>
                <Th>Right Sidebar</Th>
                <Th>Width</Th>
                <Th>Padding</Th>
                <Th>When</Th>
              </tr>
            </thead>
            <tbody>
              {recentLayouts.length === 0 ? (
                <tr><td className="p-3" colSpan={7}>No events</td></tr>
              ) : recentLayouts.map((e, i) => (
                <tr key={i} className="border-t">
                  <Td>{e.category}</Td>
                  <Td>{e.subcategory || '-'}</Td>
                  <Td>{e.containerClass}</Td>
                  <Td>{e.rightSidebar ? 'yes' : 'no'}</Td>
                  <Td>{e.rightSidebarWidth || '-'}</Td>
                  <Td>{e.dynamicPadding || '-'}</Td>
                  <Td>{new Date(e.timestamp).toLocaleTimeString()}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-gray-500 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left p-3 font-medium text-gray-700">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-3 text-gray-800">{children}</td>;
}


