#!/bin/bash

# Blue-Green Deployment Script - Enterprise-grade zero-downtime deployment
set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.production.yml"
ENV_FILE="$PROJECT_ROOT/.env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
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

# Load environment variables
if [[ ! -f "$ENV_FILE" ]]; then
    error "Environment file not found: $ENV_FILE"
    exit 1
fi

source "$ENV_FILE"

# Get current active deployment
get_active_deployment() {
    if [[ -f "$PROJECT_ROOT/.deployment_state" ]]; then
        cat "$PROJECT_ROOT/.deployment_state"
    else
        echo "blue"
    fi
}

# Get inactive deployment
get_inactive_deployment() {
    local active=$(get_active_deployment)
    if [[ "$active" == "blue" ]]; then
        echo "green"
    else
        echo "blue"
    fi
}

# Health check function
health_check() {
    local service=$1
    local max_attempts=${2:-30}
    local attempt=1

    log "Performing health check for $service..."

    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose -f "$COMPOSE_FILE" exec -T "$service" /usr/local/bin/healthcheck >/dev/null 2>&1; then
            success "Health check passed for $service (attempt $attempt/$max_attempts)"
            return 0
        fi

        log "Health check attempt $attempt/$max_attempts failed for $service. Retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done

    error "Health check failed for $service after $max_attempts attempts"
    return 1
}

# Main deployment function
deploy() {
    local version=${1:-"latest"}
    local skip_migrations=${2:-false}
    
    log "Starting blue-green deployment (version: $version)..."

    # Get current state
    local active_deployment=$(get_active_deployment)
    local new_deployment=$(get_inactive_deployment)
    
    log "Current active deployment: $active_deployment"
    log "New deployment target: $new_deployment"

    # Build new deployment
    log "Building $new_deployment deployment..."
    export DEPLOYMENT_COLOR=$new_deployment
    if docker-compose -f "$COMPOSE_FILE" build "app-$new_deployment"; then
        success "Successfully built $new_deployment deployment"
    else
        error "Failed to build $new_deployment deployment"
        return 1
    fi

    # Start new deployment
    log "Starting $new_deployment deployment..."
    if docker-compose -f "$COMPOSE_FILE" up -d "app-$new_deployment"; then
        success "Successfully started $new_deployment deployment"
    else
        error "Failed to start $new_deployment deployment"
        return 1
    fi

    # Wait for service to be ready
    sleep 30

    # Perform health check
    if health_check "app-$new_deployment"; then
        success "$new_deployment deployment is healthy"
    else
        error "$new_deployment deployment failed health check"
        return 1
    fi

    # Switch traffic
    log "Switching traffic to $new_deployment deployment..."
    export ACTIVE_DEPLOYMENT=$new_deployment
    
    if docker-compose -f "$COMPOSE_FILE" exec nginx nginx -s reload; then
        success "Traffic switched to $new_deployment deployment"
        echo "$new_deployment" > "$PROJECT_ROOT/.deployment_state"
    else
        error "Failed to reload NGINX configuration"
        return 1
    fi

    # Stop old deployment
    log "Stopping old $active_deployment deployment..."
    sleep 30
    docker-compose -f "$COMPOSE_FILE" stop "app-$active_deployment"

    success "Deployment completed successfully!"
    log "Active deployment is now: $new_deployment"
}

# Script usage
usage() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Commands:
    deploy [version] [skip-migrations]  Deploy new version (default: latest)
    status                             Show current deployment status
    health                            Check health of all services

Examples:
    $0 deploy v1.2.3
    $0 status
    $0 health

EOF
}

# Command handling
case "${1:-}" in
    "deploy")
        deploy "${2:-latest}" "${3:-false}"
        ;;
    "status")
        active=$(get_active_deployment)
        log "Active deployment: $active"
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    "health")
        log "Checking health of all services..."
        services=("postgres" "redis" "nginx" "app-blue" "app-green")
        for service in "${services[@]}"; do
            if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up"; then
                health_check "$service" 3 && success "✓ $service is healthy" || error "✗ $service is unhealthy"
            else
                error "✗ $service is not running"
            fi
        done
        ;;
    *)
        usage
        exit 1
        ;;
esac