#!/usr/bin/env node
// Dev watcher: regenerates the config manifest whenever config files change
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const configsRoot = path.resolve(repoRoot, 'client', 'src', 'services', 'category', 'configs');
const generatedDir = path.resolve(configsRoot, 'generated');
const manifestFile = path.resolve(generatedDir, 'configManifest.ts');

function log(...args) { console.log('[manifest:watch]', ...args); }

function regenerate() {
  // dynamic import to avoid caching during watch
  import(path.resolve(repoRoot, 'scripts', 'generate-config-manifest.mjs'))
    .then(() => log('regenerated'))
    .catch((e) => console.error('[manifest:watch] regenerate error', e));
}

function isGenerated(p) {
  return p.startsWith(generatedDir);
}

function addWatchers(dir, watchers = new Map()) {
  if (isGenerated(dir)) return watchers; // skip generated
  if (!fs.existsSync(dir)) return watchers;

  const watcher = fs.watch(dir, { persistent: true }, (eventType, filename) => {
    if (!filename) return;
    const full = path.resolve(dir, filename.toString());
    if (isGenerated(full)) return;
    if (filename.toString().endsWith('.ts') || filename.toString().endsWith('.json')) {
      debounceRegenerate();
    }
    // Add watcher for new subdirectories
    try {
      const stat = fs.existsSync(full) ? fs.statSync(full) : null;
      if (stat && stat.isDirectory() && !watchers.has(full)) {
        addWatchers(full, watchers);
      }
    } catch {}
  });
  watchers.set(dir, watcher);

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'generated') continue;
    const full = path.resolve(dir, entry.name);
    if (entry.isDirectory()) addWatchers(full, watchers);
  }
  return watchers;
}

let timer = null;
function debounceRegenerate() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(regenerate, 150);
}

// Ensure manifest exists initially
try {
  if (!fs.existsSync(manifestFile)) regenerate();
} catch {}

addWatchers(configsRoot);
log('watching', configsRoot);

// Keep process alive
process.stdin.resume();



