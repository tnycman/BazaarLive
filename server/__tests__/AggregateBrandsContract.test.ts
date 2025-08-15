import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';

describe('GET /api/listings/aggregate brands filter (contract)', () => {
  let app: express.Express;
  beforeAll(async () => {
    app = express();
    await registerRoutes(app);
  });

  it('returns only items matching the brand filter', async () => {
    const res = await request(app)
      .get('/api/listings/aggregate')
      .query({ vertical: 'fashion', categories: 'women,men', brands: 'nike', limit: 20 });
    expect(res.status).toBe(200);
    const items = Array.isArray(res.body?.items) ? res.body.items : [];
    // Server uses in-memory filter in service/storage if needed; ensure every item matches brand
    expect(items.every((i: any) => String(i.brand || '').toLowerCase().includes('nike'))).toBe(true);
  });
});


