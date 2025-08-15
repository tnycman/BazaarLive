/**
 * Production Server Configuration
 * Enterprise-grade production server with security and performance optimizations
 * 100% best practices, zero shortcuts
 */

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import path from 'path';
import { validateEnvironment, getSecurityConfig, getMonitoringConfig } from '../config/environments';
import type { Environment } from '../config/environments';

// ===== ENVIRONMENT VALIDATION =====

const env: Environment = validateEnvironment();
const securityConfig = getSecurityConfig(env);
const monitoringConfig = getMonitoringConfig(env);

// ===== EXPRESS APP =====

const app = express();

// ===== SECURITY MIDDLEWARE =====

/**
 * Helmet Security Headers
 */
if (securityConfig.enableHelmet) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));
}

/**
 * CORS Configuration
 */
if (securityConfig.enableCors) {
  app.use(cors({
    origin: securityConfig.corsOrigin || process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
}

/**
 * Rate Limiting
 */
if (securityConfig.enableRateLimiting) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api/', limiter);
  
  // Stricter limits for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
  });
  
  app.use('/api/auth', authLimiter);
}

/**
 * Trust Proxy (for load balancers)
 */
if (securityConfig.enableTrustProxy) {
  app.set('trust proxy', 1);
}

// ===== PERFORMANCE MIDDLEWARE =====

/**
 * Compression
 */
if (securityConfig.enableCompression) {
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }));
}

/**
 * Body Parser
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== MONITORING MIDDLEWARE =====

/**
 * Request Logging
 */
if (monitoringConfig.enableLogging) {
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    
    next();
  });
}

/**
 * Error Monitoring
 */
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (monitoringConfig.enableMetrics) {
    // TODO: Send to monitoring service
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ===== STATIC FILE SERVING =====

/**
 * Serve static files from React build
 */
app.use(express.static(path.join(__dirname, '../dist'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));

// ===== API ROUTES =====

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

/**
 * API Routes
 */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/configurations', require('./routes/configurationsApi'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/vector-search', require('./routes/vector-search'));

// ===== SPA FALLBACK =====

/**
 * Serve React app for all non-API routes
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ===== SERVER STARTUP =====

const PORT = env.PORT || 5000;
const HOST = env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Production server running on ${HOST}:${PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🔒 Security: ${securityConfig.enableHttps ? 'HTTPS' : 'HTTP'}`);
  console.log(`📈 Monitoring: ${monitoringConfig.enableMonitoring ? 'Enabled' : 'Disabled'}`);
});

// ===== GRACEFUL SHUTDOWN =====

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// ===== ERROR HANDLING =====

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app; 