#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(process.cwd());
const configsRoot = path.resolve(repoRoot, 'client', 'src', 'services', 'category', 'configs');
const generatedDir = path.resolve(configsRoot, 'generated');
const manifestPath = path.resolve(generatedDir, 'configManifest.ts');

function die(msg) { console.error(`[manifest:check] ${msg}`); process.exit(1); }

if (!fs.existsSync(manifestPath)) {
  die('configManifest.ts is missing. Run: node scripts/generate-config-manifest.mjs');
}

const manifestStat = fs.statSync(manifestPath);
let newestSourceMtime = 0;

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'generated') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (entry.isFile() && (full.endsWith('.ts') || full.endsWith('.json'))) {
      const m = fs.statSync(full).mtimeMs;
      if (m > newestSourceMtime) newestSourceMtime = m;
    }
  }
}

scan(configsRoot);

if (manifestStat.mtimeMs < newestSourceMtime) {
  die('configManifest.ts is stale. Re-run generator.');
}

const content = fs.readFileSync(manifestPath, 'utf-8');
if (!/export const CONFIG_MANIFEST\s*=\s*\{[\s\S]*\};/m.test(content)) {
  die('configManifest.ts has no CONFIG_MANIFEST export or is empty.');
}

console.log('[manifest:check] OK');



