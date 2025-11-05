#!/bin/bash

# SSL Setup Script for Expense Tracker
# This script helps set up SSL certificates using Let's Encrypt

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Configuration
DOMAIN=${1:-""}
EMAIL=${2:-""}

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    print_error "Usage: $0 <domain> <email>"
    print_error "Example: $0 expense-tracker.com admin@example.com"
    exit 1
fi

print_status "Setting up SSL certificates for $DOMAIN..."

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    print_status "Installing certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Create SSL directory
mkdir -p ssl
cd ssl

# Stop existing services
print_status "Stopping existing services..."
docker-compose down || true

# Generate SSL certificate
print_status "Generating SSL certificate for $DOMAIN..."
sudo certbot certonly --standalone -d "$DOMAIN" --email "$EMAIL" --agree-tos --no-eff-email

# Copy certificates
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ]; then
    print_status "Copying certificates..."
    sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ./cert.pem
    sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ./key.pem
    sudo chown $USER:$USER *.pem
    chmod 600 key.pem
    chmod 644 cert.pem
    print_success "SSL certificates copied successfully!"
else
    print_error "Failed to generate SSL certificates!"
    exit 1
fi

# Set up automatic renewal
print_status "Setting up automatic renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /opt/expense-tracker/docker-compose.yml restart nginx") | crontab -

print_success "Automatic renewal configured!"

# Test certificate
print_status "Testing SSL certificate..."
if openssl x509 -in cert.pem -text -noout | grep -q "$DOMAIN"; then
    print_success "SSL certificate is valid for $DOMAIN"
else
    print_error "SSL certificate validation failed!"
    exit 1
fi

# Show certificate info
print_status "Certificate information:"
openssl x509 -in cert.pem -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:|DNS:)"

# Start services
print_status "Starting services..."
cd ..
docker-compose up -d

print_success "🎉 SSL setup completed successfully!"
print_status "Your application is now available at: https://$DOMAIN"
print_warning "Remember to update your DNS records to point to this server!"