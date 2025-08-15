// Global mocks for unit tests to avoid real DB / Neon dependencies
import { vi } from 'vitest';

vi.mock('@neondatabase/serverless', () => {
  class Pool {
    constructor(_: any) {}
    // minimal API if needed in tests
    query = vi.fn();
    end = vi.fn();
  }
  const neonConfig = { webSocketConstructor: undefined as any };
  return { Pool, neonConfig };
});

vi.mock('ws', () => ({ default: {} }));

vi.mock('drizzle-orm/neon-serverless', () => {
  const drizzle = (_: any) => ({
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn(),
  });
  return { drizzle };
});

// Mock drizzle-zod used by shared/schema during tests
vi.mock('drizzle-zod', () => {
  const makeZodLike = () => {
    const self: any = {};
    self.omit = (_shape: any) => self;
    self.pick = (_shape: any) => self;
    self.extend = (_shape: any) => self;
    self.partial = () => self;
    return self;
  };
  const createInsertSchema = (_table: any) => makeZodLike();
  const createSelectSchema = (_table: any) => makeZodLike();
  return { createInsertSchema, createSelectSchema };
});

// Mock drizzle-orm/pg-core to provide no-op column builders and vector()
vi.mock('drizzle-orm/pg-core', () => {
  const createBuilder = () => {
    const builder: any = {
      primaryKey: () => builder,
      notNull: () => builder,
      default: () => builder,
      defaultNow: () => builder,
      defaultRandom: () => builder,
      unique: () => builder,
      references: () => builder,
      array: () => builder,
      $type: () => builder,
    };
    return builder;
  };

  const typeFactory = () => (_name?: any, _opts?: any) => createBuilder();
  const varchar = typeFactory();
  const text = typeFactory();
  const integer = typeFactory();
  const decimal = typeFactory();
  const boolean = typeFactory();
  const timestamp = typeFactory();
  const jsonb = typeFactory();
  const vector = typeFactory();
  const uuid = typeFactory();

  const pgEnum = (_enumName: string, _values: string[]) => {
    return (_columnName: string) => createBuilder();
  };

  const index = (_name: string) => ({ on: (_: any) => ({}) });

  const pgTable = (name: string, columns: Record<string, any>, indexes?: (t: any) => any) => {
    if (typeof indexes === 'function') {
      // Call with columns shape so code like table.expire works
      try { indexes(columns); } catch { /* noop for tests */ }
    }
    return { __name: name, ...columns } as any;
  };

  return {
    index,
    jsonb,
    pgTable,
    timestamp,
    varchar,
    text,
    integer,
    decimal,
    boolean,
    pgEnum,
    vector,
    uuid,
  };
});

// Mock drizzle-orm core exports used by shared/schema (sql, relations)
vi.mock('drizzle-orm', () => {
  const sql = (strings: TemplateStringsArray, ...values: any[]) => ({
    text: String.raw({ raw: strings } as any, ...values),
  });
  const relations = (_table: any, builder: (fns: { one: any; many: any }) => any) => {
    try {
      builder({
        one: (_t: any, _opts?: any) => ({}),
        many: (_t: any, _opts?: any) => ({}),
      });
    } catch {
      // no-op
    }
    return {};
  };
  return { sql, relations };
});

export {};


