import { navigationService } from './NavigationService';

describe('generateUniversalRoute', () => {
  it('fashion category only', () => {
    expect(navigationService.generateUniversalRoute({ vertical: 'fashion', category: 'women' }))
      .toBe('/fashion/women');
  });
  it('fashion category+sub', () => {
    expect(navigationService.generateUniversalRoute({ vertical: 'fashion', category: 'women', subcategory: 'dresses' }))
      .toBe('/fashion/women/dresses');
  });
  it('vertical only', () => {
    expect(navigationService.generateUniversalRoute({ vertical: 'electronics' }))
      .toBe('/fashion');
  });
  it('vertical+category', () => {
    expect(navigationService.generateUniversalRoute({ vertical: 'electronics', category: 'cameras' }))
      .toBe('/fashion/cameras');
  });
  it('vertical+category+sub', () => {
    expect(navigationService.generateUniversalRoute({ vertical: 'electronics', category: 'cameras', subcategory: 'lenses' }))
      .toBe('/fashion/cameras/lenses');
  });
});


