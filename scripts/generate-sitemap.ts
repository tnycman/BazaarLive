/*
  Generate sitemap.xml and robots.txt based on HierarchicalCategoryData.
  Usage:
    BASE_URL="https://your-domain.com" npx tsx scripts/generate-sitemap.ts

  Notes:
  - BASE_URL is required for absolute URLs in the sitemap (best practice). If omitted, the script will exit with an error.
  - The script writes files into ./public/sitemap.xml and ./public/robots.txt
*/

import { promises as fs } from 'node:fs';
import path from 'node:path';

// Import hierarchical data directly from the client source
// We intentionally avoid path aliases here to keep the script self-contained
import { TAXONOMY, getCategories, getSubcategories, getLeaves, type VerticalId } from '../shared/taxonomy';

type SectionKey = VerticalId;

function requireBaseUrl(): string {
  const baseUrl = process.env.BASE_URL?.trim();
  if (!baseUrl) {
    console.error('[sitemap] BASE_URL environment variable is required, e.g.:');
    console.error('  BASE_URL="https://your-domain.com" npx tsx scripts/generate-sitemap.ts');
    process.exitCode = 1;
    throw new Error('Missing BASE_URL');
  }
  return baseUrl.replace(/\/$/, '');
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function generateSitemap(): Promise<void> {
  const baseUrl = requireBaseUrl();
  const publicDir = path.resolve(process.cwd(), 'public');
  await ensureDir(publicDir);

  const nowIso = new Date().toISOString();
  const urls: string[] = [];

  // Enumerate categories, subcategories, and leaves using shared taxonomy
  const vertical: SectionKey = 'fashion';
  const categories = getCategories(vertical);
  for (const cat of categories) {
    // /fashion/:section
    urls.push(`${baseUrl}/fashion/${cat.id}`);
    const subs = getSubcategories(vertical, cat.id);
    for (const sub of subs) {
      // /fashion/:section/:subsection
      urls.push(`${baseUrl}/fashion/${cat.id}/${sub.id}`);
      const leaves = getLeaves(vertical, cat.id, sub.id);
      for (const leaf of leaves) {
        // /fashion/:section/:subsection/:leaf
        urls.push(`${baseUrl}/fashion/${cat.id}/${sub.id}/${leaf.id}`);
      }
    }
  }

  const urlset = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((loc) => {
      return [
        '  <url>',
        `    <loc>${xmlEscape(loc)}</loc>`,
        `    <lastmod>${nowIso}</lastmod>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.5</priority>',
        '  </url>'
      ].join('\n');
    }),
    '</urlset>'
  ].join('\n');

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  await fs.writeFile(sitemapPath, urlset, 'utf8');
  console.log(`[sitemap] Wrote ${sitemapPath} with ${urls.length} URLs.`);

  // robots.txt
  const robotsLines = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${baseUrl}/sitemap.xml`
  ];
  const robotsPath = path.join(publicDir, 'robots.txt');
  await fs.writeFile(robotsPath, robotsLines.join('\n') + '\n', 'utf8');
  console.log(`[sitemap] Wrote ${robotsPath}`);
}

generateSitemap().catch((err) => {
  if (process.exitCode === 1) return; // already logged a clear message
  console.error('[sitemap] Failed to generate sitemap:', err);
  process.exit(1);
});




