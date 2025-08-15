import { AnalyticsService } from '@/services/analytics/AnalyticsService';

interface CategoryNavigateParams {
  vertical: string;
  section?: string;
  subsection?: string;
  leaf?: string;
  source: 'breadcrumbs' | 'directory' | 'sidebar' | 'route' | string;
}

const RECENT_WINDOW_MS = 600; // debounce window to prevent duplicate fires
let lastKey = '';
let lastAt = 0;

function buildKey(params: CategoryNavigateParams): string {
  const { vertical, section = '', subsection = '', leaf = '', source } = params;
  return [vertical, section, subsection, leaf, source].join('|').toLowerCase();
}

export async function fireCategoryNavigate(params: CategoryNavigateParams): Promise<void> {
  const key = buildKey(params);
  const now = Date.now();
  if (key === lastKey && now - lastAt < RECENT_WINDOW_MS) return;
  lastKey = key;
  lastAt = now;

  const analytics = AnalyticsService.getInstance();
  const path = [`/${params.vertical}`, params.section, params.subsection, params.leaf]
    .filter(Boolean)
    .join('/');

  await analytics.trackEvent({
    eventType: 'category_navigate',
    eventCategory: 'navigation',
    eventAction: params.source,
    eventLabel: path,
    properties: {
      vertical: params.vertical,
      section: params.section,
      subsection: params.subsection,
      leaf: params.leaf,
      source: params.source,
    },
  });
}




