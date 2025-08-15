import { navigationService } from '../NavigationService';

describe('NavigationService routes', () => {
  test('brand segment routes', () => {
    expect(navigationService.generateBrandSegmentRoute('women')).toBe('/fashion/brands/segments/women');
    expect(navigationService.generateBrandSegmentRoute('men')).toBe('/fashion/brands/segments/men');
    expect(navigationService.generateBrandSegmentRoute('electronics')).toBe('/fashion/brands/segments/electronics');
  });

  test('parseRoutePath brand segment', () => {
    expect(navigationService.parseRoutePath('/fashion/brands/segments/women')).toEqual({ brand: undefined, category: 'women' });
  });

  test('universal non-fashion now maps under /fashion', () => {
    expect(navigationService.generateUniversalRoute({ vertical: 'home' })).toBe('/fashion');
    expect(navigationService.generateUniversalRoute({ vertical: 'sports', category: 'outdoors' })).toBe('/fashion/outdoors');
  });

  test('fashion Women/Men/Kids items compose correctly', () => {
    // These are indirect via FashionRouteService; here we ensure the universal routing for fashion is stable
    expect(navigationService.generateUniversalRoute({ vertical: 'fashion', category: 'women', subcategory: 'bags' })).toBe('/fashion/women/bags');
    expect(navigationService.generateUniversalRoute({ vertical: 'fashion', category: 'men', subcategory: 'shoes' })).toBe('/fashion/men/shoes');
    expect(navigationService.generateUniversalRoute({ vertical: 'fashion', category: 'kids', subcategory: 'clothing' })).toBe('/fashion/kids/clothing');
  });
});


