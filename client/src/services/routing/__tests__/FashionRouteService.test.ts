import { fashionRouteService } from '@/services/routing/FashionRouteService';

describe('FashionRouteService', () => {
  test('generateFashionUrl generates normalized URLs', () => {
    expect(fashionRouteService.generateFashionUrl('Women')).toBe('/fashion/women');
    expect(fashionRouteService.generateFashionUrl('women', 'Bags')).toBe('/fashion/women/bags');
    expect(fashionRouteService.generateFashionUrl('women', 'bags', 'Totes')).toBe('/fashion/women/bags/totes');
  });

  test('parseFashionUrl parses valid URLs', () => {
    expect(fashionRouteService.parseFashionUrl('/fashion/women')).toEqual({ section: 'women' });
    expect(fashionRouteService.parseFashionUrl('/fashion/women/bags')).toEqual({ section: 'women', subsection: 'bags' });
    expect(fashionRouteService.parseFashionUrl('/fashion/women/bags/totes')).toEqual({ section: 'women', subsection: 'bags', leaf: 'totes' });
  });

  test('parseFashionUrl returns null for invalid URLs', () => {
    expect(fashionRouteService.parseFashionUrl('/marketplace/women')).toBeNull();
    expect(fashionRouteService.parseFashionUrl('/fashion/unknown-section')).toBeNull();
  });

  test('isValidSection returns expected results', () => {
    expect(fashionRouteService.isValidSection('women')).toBe(true);
    expect(fashionRouteService.isValidSection('WOMEN')).toBe(true);
    expect(fashionRouteService.isValidSection('invalid')).toBe(false);
  });

  test('getAllSections returns route configs including women', () => {
    const sections = fashionRouteService.getAllSections();
    const ids = sections.map((s) => s.section);
    expect(ids).toContain('women');
    expect(sections.length).toBeGreaterThan(0);
  });

  test('getRouteMetadata composes title/description/keywords correctly', () => {
    const base = fashionRouteService.getRouteMetadata('women');
    expect(base.title).toMatch(/Women/i);

    const withSub = fashionRouteService.getRouteMetadata('women', 'bags');
    expect(withSub.title.toLowerCase()).toContain('bags');
    expect(withSub.description.toLowerCase()).toContain('bags');
    expect(withSub.keywords[0]).toBe('bags');

    const withLeaf = fashionRouteService.getRouteMetadata('women', 'bags', 'totes');
    expect(withLeaf.title.toLowerCase()).toContain('totes');
    expect(withLeaf.description.toLowerCase()).toContain('totes');
    expect(withLeaf.keywords[0]).toBe('totes');
  });
});




