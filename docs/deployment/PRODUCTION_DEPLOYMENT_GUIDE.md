# Production Deployment Guide

## Overview

This guide covers the enterprise-grade blue-green deployment strategy for BazaarLive Fashion Marketplace, ensuring zero-downtime deployments with comprehensive monitoring and rollback capabilities.

## Architecture

### Blue-Green Deployment Strategy

- **Blue Environment**: Current production environment serving live traffic
- **Green Environment**: New deployment being prepared and tested
- **NGINX Load Balancer**: Routes traffic between blue and green environments
- **Shared Services**: Database, Redis, and monitoring stack shared between environments

### Components

1. **Application Containers**: Two identical environments (blue/green)
2. **PostgreSQL Database**: Shared persistent storage
3. **Redis Cache**: Shared caching and session storage
4. **NGINX**: Load balancer and reverse proxy
5. **Monitoring Stack**: Prometheus, Grafana, ELK Stack
6. **Health Checks**: Comprehensive application and service monitoring

## Prerequisites

### System Requirements

- **CPU**: Minimum 4 cores, Recommended 8+ cores
- **Memory**: Minimum 8GB RAM, Recommended 16GB+
- **Storage**: Minimum 100GB SSD, Recommended 500GB+
- **Network**: Stable internet connection with sufficient bandwidth

### Software Requirements

- Docker Engine 20.10+
- Docker Compose 2.0+
- Linux-based OS (Ubuntu 20.04+ recommended)
- Git for deployment scripts

### Environment Variables

Create `.env.production` file based on the example:

```bash
# Copy example environment file
cp deployment/.env.production.example .env.production

# Edit with your actual values
nano .env.production
```

Required variables:
- `POSTGRES_PASSWORD`: Secure database password
- `REDIS_PASSWORD`: Secure Redis password
- `JWT_SECRET`: JWT signing key (32+ characters)
- `SESSION_SECRET`: Session encryption key (32+ characters)
- `AWS_*`: AWS credentials for S3 storage
- `GRAFANA_PASSWORD`: Grafana admin password

## Initial Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reboot to apply group changes
sudo reboot
```

### 2. Application Setup

```bash
# Clone repository
git clone https://github.com/bazaarlive/fashion-marketplace.git
cd fashion-marketplace

# Make deployment script executable
chmod +x scripts/deploy.sh
chmod +x scripts/healthcheck.sh

# Create environment file
cp deployment/.env.production.example .env.production
# Edit .env.production with your values

# Create SSL certificates (for HTTPS)
mkdir -p nginx/ssl
# Add your SSL certificates to nginx/ssl/
```

### 3. Database Initialization

```bash
# Start PostgreSQL service
docker-compose -f docker-compose.production.yml up -d postgres

# Wait for database to be ready
sleep 30

# Run initial migration
./scripts/deploy.sh deploy latest false
```

### 4. SSL Configuration

Add your SSL certificates to the `nginx/ssl/` directory:
- `cert.pem`: SSL certificate
- `key.pem`: Private key

Update NGINX configuration in `nginx/nginx.conf` if needed.

## Deployment Process

### Standard Deployment

```bash
# Deploy latest version
./scripts/deploy.sh deploy

# Deploy specific version
./scripts/deploy.sh deploy v1.2.3

# Deploy without running migrations
./scripts/deploy.sh deploy latest true
```

### Deployment Steps

1. **Pre-deployment Checks**: System resources, environment variables
2. **Database Migration**: Apply new schema changes (if any)
3. **Image Build**: Build new application container
4. **Service Start**: Start new deployment (blue/green)
5. **Health Checks**: Verify application health
6. **Smoke Tests**: Run basic functionality tests
7. **Traffic Switch**: Route traffic to new deployment
8. **Verification**: Post-deployment health verification
9. **Cleanup**: Stop old deployment and clean up resources

### Health Checks

The deployment includes comprehensive health checks:

- **HTTP Endpoints**: API availability
- **Database Connectivity**: PostgreSQL connection
- **Cache Connectivity**: Redis connection  
- **Application Logs**: Error monitoring
- **Resource Usage**: Memory and disk monitoring

## Monitoring and Observability

### Grafana Dashboard

Access Grafana at `http://your-server:3001`
- Username: `admin`
- Password: Set in `GRAFANA_PASSWORD` environment variable

### Prometheus Metrics

Access Prometheus at `http://your-server:9090`

Key metrics monitored:
- Application response times
- Error rates
- Database performance
- Memory and CPU usage
- Request throughput

### ELK Stack Logging

Access Kibana at `http://your-server:5601`

Centralized logging for:
- Application logs
- Access logs
- Error logs
- Performance logs

## Rollback Procedures

### Automatic Rollback

The deployment script automatically rolls back if:
- Health checks fail
- Smoke tests fail
- Traffic switch fails

### Manual Rollback

```bash
# Quick rollback to previous deployment
./scripts/deploy.sh rollback

# Check deployment status
./scripts/deploy.sh status

# Verify health after rollback
./scripts/deploy.sh health
```

## Security Considerations

### Network Security

- All services run on internal Docker network
- Only NGINX exposes ports to public internet
- Database and Redis accessible only from application containers

### Data Protection

- Environment variables for sensitive data
- SSL/TLS encryption for all external traffic
- Database connection encryption
- Session encryption

### Access Control

- Non-root user in containers
- Read-only filesystems where possible
- Resource limits on containers
- Network policies for service isolation

## Backup and Recovery

### Database Backup

```bash
# Create database backup
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U bazaar_user bazaarlive_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker-compose -f docker-compose.production.yml exec -T postgres psql -U bazaar_user bazaarlive_prod < backup_file.sql
```

### Full System Backup

```bash
# Stop services
docker-compose -f docker-compose.production.yml down

# Backup data volumes
sudo tar -czf bazaarlive_backup_$(date +%Y%m%d).tar.gz \
  /var/lib/docker/volumes/bazaarlive_postgres_data \
  /var/lib/docker/volumes/bazaarlive_redis_data \
  .env.production

# Restart services
docker-compose -f docker-compose.production.yml up -d
```

## Troubleshooting

### Common Issues

#### Deployment Fails at Health Check

```bash
# Check application logs
./scripts/deploy.sh logs app-blue
./scripts/deploy.sh logs app-green

# Check all service status
docker-compose -f docker-compose.production.yml ps

# Verify environment variables
docker-compose -f docker-compose.production.yml exec app-blue env | grep -E "(DATABASE|REDIS)"
```

#### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.production.yml logs postgres

# Test database connectivity
docker-compose -f docker-compose.production.yml exec postgres psql -U bazaar_user -d bazaarlive_prod -c "SELECT 1;"

# Check network connectivity
docker-compose -f docker-compose.production.yml exec app-blue nc -zv postgres 5432
```

#### Performance Issues

```bash
# Check resource usage
docker stats

# Check application metrics
curl http://localhost/api/health

# Review logs for errors
./scripts/deploy.sh logs app-$(cat .deployment_state)
```

### Emergency Procedures

#### Service Completely Down

```bash
# Check Docker service
sudo systemctl status docker

# Restart Docker if needed
sudo systemctl restart docker

# Restart all services
docker-compose -f docker-compose.production.yml up -d
```

#### Database Corruption

```bash
# Stop applications
docker-compose -f docker-compose.production.yml stop app-blue app-green

# Restore from backup
# (See backup procedures above)

# Restart applications
docker-compose -f docker-compose.production.yml up -d app-blue app-green
```

## Maintenance

### Regular Maintenance Tasks

#### Weekly

- Review application logs for errors
- Check disk space usage
- Verify backup integrity
- Update security patches

#### Monthly

- Rotate log files
- Update SSL certificates (if needed)
- Review monitoring alerts
- Performance optimization review

### Updates and Patches

```bash
# Update base images
docker-compose -f docker-compose.production.yml pull

# Rebuild with latest patches
./scripts/deploy.sh deploy latest

# Update system packages
sudo apt update && sudo apt upgrade -y
```

## Performance Optimization

### Resource Allocation

Adjust container resources in `docker-compose.production.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

### Database Optimization

```sql
-- Analyze database performance
ANALYZE;

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Optimize indexes
REINDEX DATABASE bazaarlive_prod;
```

### Cache Optimization

- Monitor Redis memory usage
- Adjust cache TTL values
- Implement cache warming strategies

## Support and Contact

For deployment issues:
- Review logs first
- Check this documentation
- Contact DevOps team
- Create issue in repository

Emergency contact:
- On-call engineer: [contact details]
- Slack channel: #devops-alerts
- Email: devops@bazaarlive.com
