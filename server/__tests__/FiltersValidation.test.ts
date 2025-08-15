import { normalizeCommaList, parsePrice, validateConditions } from '../config/FiltersValidation';

describe('FiltersValidation helpers', () => {
  test('normalizeCommaList handles arrays, csv strings, trimming and lowercasing', () => {
    expect(normalizeCommaList([' Nike ', 'ADIDAS', ''])).toEqual(['nike', 'adidas']);
    expect(normalizeCommaList('  Nike,  ADIDAS , , Puma ')).toEqual(['nike', 'adidas', 'puma']);
    expect(normalizeCommaList(undefined)).toEqual([]);
  });

  test('parsePrice returns valid non-negative numbers or undefined', () => {
    expect(parsePrice('100')).toBe(100);
    expect(parsePrice(0)).toBe(0);
    expect(parsePrice(-1)).toBeUndefined();
    expect(parsePrice('abc')).toBeUndefined();
    expect(parsePrice(undefined)).toBeUndefined();
  });

  test('validateConditions enforces allowlist and de-duplicates', () => {
    const ok = validateConditions(['new_with_tags', 'excellent', 'excellent']);
    expect(ok.ok).toBe(true);
    expect(ok.values).toEqual(['new_with_tags', 'excellent']);

    const bad = validateConditions(['brand_new']);
    expect(bad.ok).toBe(false);
    expect(bad.reason).toContain('unsupported condition');
  });
});



