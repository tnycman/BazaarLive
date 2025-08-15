export function addPrefetch(href: string, as?: string): void {
  try {
    if (!href) return;
    const existing = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
    if (existing) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    if (as) link.as = as;
    document.head.appendChild(link);
  } catch {
    // no-op
  }
}

export function addPreload(href: string, as: string): void {
  try {
    if (!href || !as) return;
    const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
    if (existing) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = href;
    document.head.appendChild(link);
  } catch {
    // no-op
  }
}

export function addPreconnect(origin: string): void {
  try {
    if (!origin) return;
    const existing = document.querySelector(`link[rel="preconnect"][href^="${origin}"]`);
    if (existing) return;
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = '';
    document.head.appendChild(link);
  } catch {
    // no-op
  }
}


