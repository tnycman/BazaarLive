# Production Deployment Guide

## **🚀 ENTERPRISE-GRADE PRODUCTION DEPLOYMENT**

### **📋 OVERVIEW**

This guide provides comprehensive instructions for deploying the marketplace application to production with enterprise-grade security, performance, and monitoring.

### **🔧 PREREQUISITES**

- Node.js 18+ 
- Docker & Docker Compose
- SSL certificates
- Environment variables configured
- Database setup complete

### **⚙️ ENVIRONMENT CONFIGURATION**

#### **Required Environment Variables**

```bash
# Core Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your-32-character-session-secret

# Security
ENABLE_HTTPS=true
CORS_ORIGIN=https://yourdomain.com

# Performance
ENABLE_CACHING=true
REDIS_URL=redis://localhost:6379
CDN_URL=https://cdn.yourdomain.com

# Monitoring
ENABLE_ANALYTICS=true
ENABLE_MONITORING=true
SENTRY_DSN=https://sentry.yourdomain.com/dsn

# AWS Configuration (Optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
AWS_CLOUDFRONT_DISTRIBUTION=your-distribution
```

### **🏗️ BUILD PROCESS**

#### **1. Production Build**

```bash
# Build client and server
npm run build

# Build with bundle analysis
npm run build:analyze

# Build client only
npm run build:client

# Build server only
npm run build:server
```

#### **2. Docker Build**

```bash
# Build production image
docker build -f Dockerfile.prod -t marketplace:latest .

# Build optimized image
docker build -f Dockerfile.prod --target optimized -t marketplace:optimized .
```

### **🐳 DOCKER DEPLOYMENT**

#### **1. Using Docker Compose**

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

#### **2. Manual Docker Deployment**

```bash
# Run application container
docker run -d \
  --name marketplace-app \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=$DATABASE_URL \
  -e SESSION_SECRET=$SESSION_SECRET \
  marketplace:latest
```

### **🔒 SECURITY CONFIGURATION**

#### **1. SSL/TLS Setup**

```nginx
# nginx/nginx.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://app:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### **2. Security Headers**

The application includes comprehensive security headers via Helmet:

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

#### **3. Rate Limiting**

Configured rate limits:
- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes

### **📊 MONITORING & LOGGING**

#### **1. Health Checks**

```bash
# Application health
curl https://yourdomain.com/api/health

# Docker health checks
docker ps --format "table {{.Names}}\t{{.Status}}"
```

#### **2. Logging**

```bash
# View application logs
docker logs marketplace-app

# View nginx logs
docker logs marketplace-nginx

# Follow logs
docker logs -f marketplace-app
```

#### **3. Metrics & Monitoring**

- **Prometheus**: Metrics collection on port 9090
- **Grafana**: Dashboard on port 3000
- **Application Metrics**: Built-in performance monitoring

### **🚀 PERFORMANCE OPTIMIZATION**

#### **1. Caching Strategy**

- **Redis**: Session storage and caching
- **CDN**: Static asset delivery
- **Browser Caching**: Aggressive caching for static assets

#### **2. Compression**

- **Gzip**: Standard compression
- **Brotli**: Advanced compression for modern browsers

#### **3. Bundle Optimization**

- **Code Splitting**: Automatic chunk splitting
- **Tree Shaking**: Dead code elimination
- **Minification**: JavaScript and CSS minification

### **🔧 MAINTENANCE**

#### **1. Updates**

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

#### **2. Database Migrations**

```bash
# Run migrations
npm run db:push

# Or via Docker
docker exec marketplace-app npm run db:push
```

#### **3. Backup**

```bash
# Database backup
pg_dump $DATABASE_URL > backup.sql

# Volume backup
docker run --rm -v marketplace_redis-data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz -C /data .
```

### **🚨 TROUBLESHOOTING**

#### **Common Issues**

1. **Application won't start**
   - Check environment variables
   - Verify database connectivity
   - Check logs: `docker logs marketplace-app`

2. **Performance issues**
   - Monitor resource usage: `docker stats`
   - Check Redis connectivity
   - Review application metrics

3. **SSL issues**
   - Verify certificate paths
   - Check nginx configuration
   - Test SSL: `openssl s_client -connect yourdomain.com:443`

#### **Debug Commands**

```bash
# Check container status
docker ps -a

# Inspect container
docker inspect marketplace-app

# Execute commands in container
docker exec -it marketplace-app sh

# View resource usage
docker stats
```

### **📈 SCALING**

#### **1. Horizontal Scaling**

```bash
# Scale application
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

#### **2. Load Balancer Configuration**

```nginx
upstream app_servers {
    server app:5000;
    server app2:5000;
    server app3:5000;
}

server {
    location / {
        proxy_pass http://app_servers;
    }
}
```

### **🔐 SECURITY CHECKLIST**

- [ ] SSL certificates installed
- [ ] Environment variables secured
- [ ] Database credentials protected
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] Security headers active
- [ ] Regular backups scheduled
- [ ] Monitoring alerts configured
- [ ] Log rotation enabled
- [ ] Non-root user configured

### **📞 SUPPORT**

For production issues:
1. Check application logs
2. Review monitoring dashboards
3. Verify environment configuration
4. Test health endpoints
5. Contact development team

---

**⚠️ IMPORTANT**: Always test deployment in staging environment before production deployment. 