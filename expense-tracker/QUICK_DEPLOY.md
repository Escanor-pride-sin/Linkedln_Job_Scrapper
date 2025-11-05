# 🚀 Quick Deployment Guide

Get your voice-enabled AI expense tracker running in production in minutes!

## ⚡ One-Command Deployment

### Prerequisites
- Docker & Docker Compose
- OpenAI API key
- Domain name (optional)

### Step 1: Clone and Configure
```bash
git clone <repository-url>
cd expense-tracker

# Configure environment
cp .env.production .env
nano .env  # Add your OpenAI API key and other secrets
```

### Step 2: Deploy!
```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy the application
./deploy.sh
```

That's it! 🎉 Your app will be available at:
- **HTTPS**: https://localhost
- **HTTP**: http://localhost (redirects to HTTPS)

## 🔧 Custom Domain

### Option 1: With SSL (Recommended)
```bash
# Setup SSL certificates
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh your-domain.com admin@your-domain.com

# Update FRONTEND_URL in .env
nano .env
# Change: FRONTEND_URL=https://your-domain.com

# Redeploy
./deploy.sh
```

### Option 2: Without SSL (Development Only)
```bash
# Update nginx.conf to use port 80 only
# Then run:
docker-compose up -d
```

## 📊 What's Included

The deployment automatically sets up:
- ✅ **Application** (Node.js + React)
- ✅ **Database** (PostgreSQL with backups)
- ✅ **Web Server** (Nginx with SSL)
- ✅ **Monitoring** (Prometheus + Grafana)
- ✅ **Cache** (Redis)
- ✅ **SSL Certificates** (Self-signed or Let's Encrypt)
- ✅ **Auto-backups** (Daily database backups)
- ✅ **Security Headers** (CORS, CSP, HSTS)

## 🔍 Verify Deployment

### Health Checks
```bash
# Check if everything is running
curl https://localhost/health

# Check container status
docker-compose ps

# View logs
docker-compose logs -f
```

### Test Features
1. **Voice Input**: Speak expenses like "I spent $25 at Starbucks"
2. **AI Processing**: Verify AI extracts amount and categorizes correctly
3. **Dashboard**: Check charts and analytics work
4. **Mobile**: Test on mobile devices (responsive design)

## 🛠️ Management Commands

### Backup Database
```bash
./backup.sh
```

### Update Application
```bash
git pull origin main
./deploy.sh
```

### View Logs
```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f db

# Nginx logs
docker-compose logs -f nginx
```

### Access Monitoring
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090

## 🔒 Security Checklist

- [ ] Change default database password in docker-compose.yml
- [ ] Set strong JWT_SECRET in .env
- [ ] Use production SSL certificates
- [ ] Configure firewall (ports 80, 443 only)
- [ ] Set up regular backups
- [ ] Monitor resource usage

## 🆘 Troubleshooting

### Application won't start
```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database connection issues
```bash
# Test database connection
docker-compose exec db psql -U postgres -d expense_tracker -c "SELECT 1;"

# Reset database
docker-compose down -v
docker-compose up -d db
sleep 30
docker-compose exec app npx prisma migrate deploy
```

### SSL Certificate Issues
```bash
# Test SSL certificate
openssl x509 -in ssl/cert.pem -text -noout

# Regenerate self-signed certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## 📱 Mobile Access

The application is fully responsive and works on all devices:
- **iOS**: Safari (requires HTTPS for microphone access)
- **Android**: Chrome (recommended for voice features)
- **Desktop**: Chrome, Firefox, Edge, Safari

## 🚀 Production Tips

1. **Use External Database**: Consider managed PostgreSQL for better reliability
2. **CDN**: Use Cloudflare or AWS CloudFront for static assets
3. **Load Balancer**: For high traffic, use multiple app instances
4. **Monitoring**: Set up alerts for downtime and performance
5. **Scaling**: Use Docker swarm or Kubernetes for auto-scaling

## 💰 Cost Optimization

- **OpenAI API**: GPT-4o-mini costs ~$0.15 per 1M tokens
- **Database**: Start with 1GB RAM, scale as needed
- **Server**: 2GB RAM minimum for production
- **SSL**: Let's Encrypt certificates are free

## 📞 Support

For issues:
1. Check `DEPLOYMENT.md` for detailed troubleshooting
2. Review application logs: `docker-compose logs app`
3. Check GitHub Issues
4. Create new issue with deployment details

**Your voice-enabled AI expense tracker is now live! 🎉**