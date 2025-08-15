// Vitest <-> Jest compatibility shim for legacy tests using jest globals
import { vi } from 'vitest';

// Expose a minimal jest-like API mapped to Vitest
// This allows existing tests that call jest.fn(), jest.clearAllMocks(), etc. to run under Vitest
(globalThis as any).jest = {
  fn: vi.fn,
  spyOn: vi.spyOn,
  clearAllMocks: vi.clearAllMocks,
  resetAllMocks: vi.resetAllMocks,
  restoreAllMocks: vi.restoreAllMocks,
};

export {};


