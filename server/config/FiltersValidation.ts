// Server-side filters normalization and validation

export const allowedConditions = new Set<string>([
  'new_with_tags',
  'new_without_tags',
  'excellent',
  'good',
  'fair'
]);

export function normalizeCommaList(input?: string | string[]): string[] {
  if (!input) return [];
  const raw = Array.isArray(input) ? input.join(',') : String(input);
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function parsePrice(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function validateConditions(raw: string[]): { ok: boolean; values?: string[]; reason?: string } {
  const normalized = raw.map((s) => s.toLowerCase());
  for (const c of normalized) {
    if (!allowedConditions.has(c)) {
      return { ok: false, reason: `unsupported condition: ${c}` };
    }
  }
  return { ok: true, values: Array.from(new Set(normalized)) };
}


