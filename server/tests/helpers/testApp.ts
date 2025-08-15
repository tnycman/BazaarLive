// Test Application Setup - Enterprise-grade test environment
import express, { Express } from 'express';
import { registerRoutes } from '../../routes.ts';
import { setupTestDatabase } from './testDatabase';

let testApp: Express | null = null;

export async function createTestApp(): Promise<Express> {
  if (testApp) {
    return testApp;
  }

  // Setup test database
  await setupTestDatabase();

  // Create Express app
  const app = express();

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS for testing
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Register routes
  await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Test app error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'test' && { stack: err.stack })
    });
  });

  testApp = app;
  return app;
}

export function getTestApp(): Express {
  if (!testApp) {
    throw new Error('Test app not initialized. Call createTestApp() first.');
  }
  return testApp;
}
