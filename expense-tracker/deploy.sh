#!/bin/bash

# Production Deployment Script for Expense Tracker
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting Expense Tracker Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="expense-tracker"
REGISTRY_URL="your-registry.com"  # Update with your container registry
VERSION=${1:-latest}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on production server
check_environment() {
    print_status "Checking environment..."

    if [ "$NODE_ENV" = "production" ]; then
        print_success "Production environment detected"
    else
        print_warning "Not in production environment. Setting NODE_ENV=production"
        export NODE_ENV=production
    fi
}

# Backup existing database
backup_database() {
    print_status "Creating database backup..."

    if docker ps | grep -q expense_tracker_db_1; then
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        docker exec expense_tracker_db_1 pg_dump -U postgres expense_tracker > "backups/$BACKUP_FILE"
        print_success "Database backup created: $BACKUP_FILE"
    else
        print_warning "No existing database container found"
    fi
}

# Build and deploy
deploy_application() {
    print_status "Building and deploying application..."

    # Create necessary directories
    mkdir -p logs
    mkdir -p backups
    mkdir -p ssl

    # Check for SSL certificates
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        print_warning "SSL certificates not found. Generating self-signed certificates..."
        mkdir -p ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        print_warning "Self-signed certificates generated. Replace with production certificates ASAP!"
    fi

    # Stop existing services
    print_status "Stopping existing services..."
    docker-compose down || true

    # Pull latest code (if in git repository)
    if [ -d ".git" ]; then
        print_status "Pulling latest code..."
        git pull origin main || print_warning "Could not pull latest code"
    fi

    # Build and start services
    print_status "Building Docker images..."
    docker-compose build --no-cache

    print_status "Starting services..."
    docker-compose up -d

    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30

    # Run database migrations
    print_status "Running database migrations..."
    docker-compose exec app npx prisma migrate deploy || true

    # Seed initial data if needed
    print_status "Seeding initial data..."
    docker-compose exec app npx prisma db seed || true
}

# Health checks
health_check() {
    print_status "Performing health checks..."

    # Check if backend is responding
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        return 1
    fi

    # Check if frontend is accessible
    if curl -f http://localhost/ > /dev/null 2>&1; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
        return 1
    fi

    # Check database connection
    if docker-compose exec -T app npx prisma db push --accept-data-loss 2>/dev/null; then
        print_success "Database connection check passed"
    else
        print_warning "Database connection check warning"
    fi
}

# Cleanup old images and containers
cleanup() {
    print_status "Cleaning up old Docker resources..."

    # Remove unused images
    docker image prune -f

    # Remove unused containers
    docker container prune -f

    # Remove unused volumes (be careful with this)
    # docker volume prune -f

    print_success "Cleanup completed"
}

# Show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""

    echo "📊 Docker Containers:"
    docker-compose ps
    echo ""

    echo "📈 Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    echo ""

    echo "📝 Recent Logs (Backend):"
    docker-compose logs --tail=10 app
    echo ""

    echo "🔍 Health Status:"
    if curl -s http://localhost:3001/health | jq . > /dev/null 2>&1; then
        echo "✅ Backend: Healthy"
    else
        echo "❌ Backend: Unhealthy"
    fi
}

# Main deployment flow
main() {
    print_status "Starting deployment process..."

    # Check prerequisites
    command -v docker >/dev/null 2>&1 || { print_error "Docker is required but not installed."; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { print_error "Docker Compose is required but not installed."; exit 1; }

    # Check environment variables
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found. Please create it first."
        exit 1
    fi

    check_environment
    backup_database
    deploy_application
    health_check
    cleanup
    show_status

    print_success "🎉 Deployment completed successfully!"
    print_status "Application is available at: https://localhost"
}

# Handle script interruption
trap 'print_error "Deployment interrupted!"; exit 1' INT TERM

# Run main function
main "$@"