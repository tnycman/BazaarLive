import { NavigationSecurityAspect } from '../../navigation/NavigationAspects';

describe('NavigationSecurityAspect', () => {
  it('allows known categories', () => {
    const aspect = new NavigationSecurityAspect();
    expect(() => aspect.before?.({ action: 'hover', category: 'Women', timestamp: Date.now() })).not.toThrow();
  });

  it('blocks unknown categories', () => {
    const aspect = new NavigationSecurityAspect();
    expect(() => aspect.before?.({ action: 'hover', category: 'UnknownCat', timestamp: Date.now() })).toThrow();
  });

  it('allows leave with empty category', () => {
    const aspect = new NavigationSecurityAspect();
    expect(() => aspect.before?.({ action: 'leave', category: '', timestamp: Date.now() })).not.toThrow();
  });
});






