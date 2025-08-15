#!/bin/sh

# Health Check Script - Enterprise-grade application health verification
set -e

# Configuration
API_URL="http://localhost:3000"
TIMEOUT=10
MAX_RETRIES=3

# Health check endpoints
ENDPOINTS=(
    "/api/health"
    "/api/fashion/health"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if curl/wget is available
check_tools() {
    if command -v curl >/dev/null 2>&1; then
        HTTP_CLIENT="curl"
    elif command -v wget >/dev/null 2>&1; then
        HTTP_CLIENT="wget"
    else
        error "Neither curl nor wget is available"
        exit 1
    fi
}

# Make HTTP request
make_request() {
    local url=$1
    local timeout=${2:-$TIMEOUT}
    
    case $HTTP_CLIENT in
        "curl")
            curl -f -s --max-time "$timeout" "$url" >/dev/null 2>&1
            ;;
        "wget")
            wget --quiet --timeout="$timeout" --tries=1 --spider "$url" >/dev/null 2>&1
            ;;
    esac
}

# Check database connectivity
check_database() {
    log "Checking database connectivity..."
    
    # Try to connect using the app's database connection
    if node -e "
        const { db } = require('./dist/server/db.js');
        db.execute('SELECT 1 as health').then(result => {
            if (result.rows && result.rows.length > 0) {
                console.log('Database connection healthy');
                process.exit(0);
            } else {
                console.error('Database query returned unexpected result');
                process.exit(1);
            }
        }).catch(err => {
            console.error('Database connection failed:', err.message);
            process.exit(1);
        });
    " 2>/dev/null; then
        success "Database is healthy"
        return 0
    else
        error "Database is unhealthy"
        return 1
    fi
}

# Check Redis connectivity
check_redis() {
    log "Checking Redis connectivity..."
    
    # Simple Redis ping test
    if node -e "
        const redis = require('redis');
        const client = redis.createClient({ url: process.env.REDIS_URL });
        client.connect().then(async () => {
            const result = await client.ping();
            if (result === 'PONG') {
                console.log('Redis connection healthy');
                await client.disconnect();
                process.exit(0);
            } else {
                console.error('Redis ping failed');
                process.exit(1);
            }
        }).catch(err => {
            console.error('Redis connection failed:', err.message);
            process.exit(1);
        });
    " 2>/dev/null; then
        success "Redis is healthy"
        return 0
    else
        warning "Redis connectivity check failed (continuing...)"
        return 0  # Don't fail the health check for Redis
    fi
}

# Check HTTP endpoints
check_endpoints() {
    log "Checking HTTP endpoints..."
    
    for endpoint in "${ENDPOINTS[@]}"; do
        local url="${API_URL}${endpoint}"
        local retry=1
        local success_flag=false
        
        while [ $retry -le $MAX_RETRIES ]; do
            if make_request "$url"; then
                success "✓ $endpoint is responding"
                success_flag=true
                break
            else
                if [ $retry -lt $MAX_RETRIES ]; then
                    warning "Attempt $retry/$MAX_RETRIES failed for $endpoint, retrying..."
                    sleep 2
                else
                    error "✗ $endpoint is not responding after $MAX_RETRIES attempts"
                fi
            fi
            retry=$((retry + 1))
        done
        
        if [ "$success_flag" = false ]; then
            return 1
        fi
    done
    
    return 0
}

# Check memory usage
check_memory() {
    log "Checking memory usage..."
    
    # Get memory usage of current process
    local pid=$$
    local memory_kb=$(ps -p $pid -o rss= 2>/dev/null || echo "0")
    local memory_mb=$((memory_kb / 1024))
    
    # Check if memory usage is reasonable (less than 1GB)
    if [ $memory_mb -lt 1024 ]; then
        success "Memory usage is acceptable: ${memory_mb}MB"
        return 0
    else
        warning "High memory usage detected: ${memory_mb}MB"
        return 0  # Don't fail for high memory usage
    fi
}

# Check disk space
check_disk_space() {
    log "Checking disk space..."
    
    # Check available disk space
    local available_space=$(df / 2>/dev/null | tail -1 | awk '{print $4}' || echo "0")
    local available_gb=$((available_space / 1024 / 1024))
    
    # Require at least 1GB of free space
    if [ $available_gb -ge 1 ]; then
        success "Disk space is sufficient: ${available_gb}GB available"
        return 0
    else
        warning "Low disk space: ${available_gb}GB available"
        return 0  # Don't fail for low disk space in health check
    fi
}

# Check application logs for recent errors
check_logs() {
    log "Checking recent application logs..."
    
    local log_file="/app/logs/application.log"
    
    if [ -f "$log_file" ]; then
        # Check for errors in the last 10 lines
        local error_count=$(tail -10 "$log_file" 2>/dev/null | grep -c "ERROR" || echo "0")
        
        if [ "$error_count" -gt 5 ]; then
            warning "High error count in recent logs: $error_count errors"
            return 0  # Don't fail for log errors
        else
            success "Log check passed: $error_count recent errors"
            return 0
        fi
    else
        warning "Log file not found: $log_file"
        return 0
    fi
}

# Main health check function
main() {
    local exit_code=0
    
    log "Starting application health check..."
    
    # Check tools availability
    check_tools
    
    # Run all health checks
    if ! check_endpoints; then
        error "HTTP endpoints check failed"
        exit_code=1
    fi
    
    if ! check_database; then
        error "Database check failed"
        exit_code=1
    fi
    
    # Non-critical checks (warnings only)
    check_redis
    check_memory
    check_disk_space
    check_logs
    
    if [ $exit_code -eq 0 ]; then
        success "All critical health checks passed"
        log "Health check completed successfully"
    else
        error "Some critical health checks failed"
        log "Health check completed with errors"
    fi
    
    exit $exit_code
}

# Run main function
main "$@"
