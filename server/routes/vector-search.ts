/**
 * Vector Search API Routes - Enterprise AOP Integration
 * Routes now use enterprise AOP-compliant vector search facade
 */

import { Router } from 'express';
import enterpriseVectorSearchRoutes from '../vector/routes/EnterpriseVectorSearchRoutes.js';

const router = Router();

// Use enterprise AOP-compliant vector search routes
router.use('/', enterpriseVectorSearchRoutes);

export default router;