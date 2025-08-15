import { categoryTaxonomyService } from '@/services/category/CategoryTaxonomyService';

describe('CategoryTaxonomyService', () => {
  test('resolve returns section only when only section provided', () => {
    const path = categoryTaxonomyService.resolve('women');
    expect(path).not.toBeNull();
    expect(path!.section?.id).toBe('women');
    expect(path!.subsection).toBeUndefined();
    expect(path!.leaf).toBeUndefined();
  });

  test('resolve returns section and subsection when both provided', () => {
    const path = categoryTaxonomyService.resolve('women', 'bags');
    expect(path).not.toBeNull();
    expect(path!.section?.id).toBe('women');
    expect(path!.subsection?.id).toBe('bags');
    expect(path!.leaf).toBeUndefined();
  });

  test('resolve returns full path for section/subsection/leaf', () => {
    const path = categoryTaxonomyService.resolve('women', 'bags', 'totes');
    expect(path).not.toBeNull();
    expect(path!.section?.id).toBe('women');
    expect(path!.subsection?.id).toBe('bags');
    expect(path!.leaf?.id).toBe('totes');
  });

  test('resolve returns null for invalid section/subsection/leaf', () => {
    expect(categoryTaxonomyService.resolve('invalid')).toBeNull();
    expect(categoryTaxonomyService.resolve('women', 'invalid')).toBeNull();
    expect(categoryTaxonomyService.resolve('women', 'bags', 'invalid')).toBeNull();
  });
});




