import '@testing-library/jest-dom';

// Polyfill setImmediate for jsdom environments
if (typeof global.setImmediate === 'undefined') {
  // @ts-ignore
  global.setImmediate = (cb: (...args: any[]) => void, ...args: any[]) => setTimeout(cb, 0, ...args);
}


