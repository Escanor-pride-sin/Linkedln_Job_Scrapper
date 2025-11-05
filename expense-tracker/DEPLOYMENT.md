# Deployment Guide

This guide covers deploying the Voice-Enabled AI Expense Tracker to production.

## 🚀 Quick Deployment (Docker Compose)

### Prerequisites
- Docker and Docker Compose installed
- OpenAI API key
- Domain name (optional, for SSL)
- SSL certificates (recommended for production)

### Step 1: Clone and Configure
```bash
git clone <repository-url>
cd expense-tracker

# Copy environment template
cp .env.production .env

# Configure your environment variables
nano .env
```

### Step 2: Update Environment Variables
Edit `.env` file with your actual values:
```env
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/expense_tracker

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Security
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
FRONTEND_URL=https://your-domain.com

# Change database password in docker-compose.yml too
```

### Step 3: Deploy
```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Step 4: Access Your Application
- **Frontend**: https://localhost (or your domain)
- **Backend API**: https://localhost/api
- **Health Check**: https://localhost/health

## 🏗️ Manual Deployment Steps

### 1. Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /opt/expense-tracker
sudo chown $USER:$USER /opt/expense-tracker
cd /opt/expense-tracker
```

### 2. Setup SSL Certificates
```bash
# Create SSL directory
mkdir -p ssl

# Option 1: Use Let's Encrypt (recommended)
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem

# Option 2: Self-signed (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=your-domain.com"
```

### 3. Configure Environment
```bash
# Copy and edit environment file
cp .env.production .env
nano .env
```

### 4. Deploy Application
```bash
# Run deployment script
./deploy.sh
```

## 🔧 Configuration Options

### Database Configuration
You can use external database services like:
- **AWS RDS**
- **Google Cloud SQL**
- **DigitalOcean Database**
- **Heroku Postgres**

Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL=postgresql://user:password@your-db-host:5432/expense_tracker
```

### OpenAI Configuration
Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### Domain Configuration
Update your DNS records to point to your server:
- **A Record**: `@` → `your-server-ip`
- **A Record**: `www` → `your-server-ip`

### Nginx Configuration
The `nginx.conf` includes:
- SSL/TLS termination
- Gzip compression
- Rate limiting
- Security headers
- Static file caching

## 🔒 Security Considerations

### 1. Update Default Passwords
Change the default PostgreSQL password in `docker-compose.yml`:
```yaml
POSTGRES_PASSWORD: your-secure-password
```

### 2. Use Environment Variables
Never commit sensitive data to version control:
- Database credentials
- OpenAI API keys
- JWT secrets
- SSL private keys

### 3. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 4. Regular Backups
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec expense_tracker_db_1 pg_dump -U postgres expense_tracker > backups/backup_$DATE.sql
find backups/ -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /opt/expense-tracker/backup.sh
```

## 📊 Monitoring and Maintenance

### 1. Health Monitoring
```bash
# Check application health
curl https://your-domain.com/health

# Check container status
docker-compose ps

# View logs
docker-compose logs -f app
```

### 2. Performance Monitoring
Consider setting up:
- **Prometheus** for metrics
- **Grafana** for dashboards
- **Log aggregators** (ELK stack)
- **Error tracking** (Sentry)

### 3. Updates
```bash
# Update application
git pull origin main
./deploy.sh

# Update dependencies
docker-compose pull
docker-compose up -d --force-recreate
```

## 🚀 Scaling Options

### 1. Horizontal Scaling
```yaml
# docker-compose.yml
services:
  app:
    build: .
    deploy:
      replicas: 3
```

### 2. Load Balancing
Use Nginx load balancing for multiple app instances:
```nginx
upstream backend {
    server app1:3001;
    server app2:3001;
    server app3:3001;
}
```

### 3. Database Scaling
- Read replicas
- Connection pooling
- Caching layer (Redis)

## 🔍 Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env

# Check database connection
docker-compose exec db psql -U postgres -d expense_tracker -c "SELECT 1;"
```

**SSL Certificate Issues:**
```bash
# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout

# Test SSL configuration
openssl s_client -connect your-domain.com:443
```

**Performance Issues:**
```bash
# Check resource usage
docker stats

# Check database performance
docker-compose exec db psql -U postgres -d expense_tracker -c "SELECT * FROM pg_stat_activity;"
```

**OpenAI API Issues:**
- Check API key validity
- Monitor usage limits
- Check network connectivity

## 🆘 Support

For deployment issues:
1. Check the logs: `docker-compose logs`
2. Review this troubleshooting section
3. Check GitHub issues
4. Create a new issue with details

## 📋 Deployment Checklist

- [ ] Server prepared with Docker
- [ ] SSL certificates obtained
- [ ] Environment variables configured
- [ ] Database password updated
- [ ] Firewall configured
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Domain configured
- [ ] Application tested
- [ ] SSL certificate verified
- [ ] Backups tested
- [ ] Performance tested
- [ ] Security reviewed