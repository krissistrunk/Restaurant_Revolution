# Restaurant Revolution v3 - Deployment Guide

## Overview
This guide covers the complete deployment process for Restaurant Revolution v3, including CI/CD pipelines, containerization, and production deployment strategies.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [CI/CD Pipeline](#cicd-pipeline)
- [Container Deployment](#container-deployment)
- [Production Deployment](#production-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### Required Software
- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Git

### Required Accounts
- GitHub (for CI/CD)
- Docker Hub or GitHub Container Registry
- Cloud provider (AWS/Azure/GCP)
- Domain name and SSL certificates

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/restaurant-revolution.git
cd restaurant-revolution
```

### 2. Environment Variables
Copy and configure environment variables:
```bash
cp .env.example .env
```

Fill in the required values in `.env`:
- Database connection strings
- API keys and secrets
- Third-party service credentials

### 3. Install Dependencies
```bash
npm install
```

## Local Development

### Standard Development
```bash
# Start all services
npm run dev

# Or use Docker Compose
docker-compose -f docker-compose.dev.yml up
```

### Testing
```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Build Application
```bash
# Production build
npm run build

# Type checking
npm run check
```

## CI/CD Pipeline

### GitHub Actions Workflows

#### Continuous Integration (`ci.yml`)
Triggers on push and pull requests:
- ✅ Lint & Type checking
- ✅ Run test suite with coverage
- ✅ Build application
- ✅ Security audit
- ✅ Performance testing (Lighthouse)

#### Continuous Deployment (`cd.yml`)
Triggers on main branch and tags:
- 🚀 Build & test application
- 📦 Create Docker images
- 🌐 Deploy to staging
- 🏗️ Deploy to production (with approval)
- 📊 Database migrations
- 📢 Notifications

### Setting Up CI/CD

1. **Repository Secrets**
   Configure in GitHub Settings → Secrets:
   ```
   CODECOV_TOKEN
   SLACK_WEBHOOK_URL
   STAGING_DEPLOY_TOKEN
   PRODUCTION_DEPLOY_TOKEN
   DATABASE_URL
   SESSION_SECRET
   JWT_SECRET
   ```

2. **Environment Protection Rules**
   - Staging: Automatic deployment
   - Production: Manual approval required

3. **Branch Protection**
   - Require status checks to pass
   - Require branches to be up to date
   - Require review from code owners

## Container Deployment

### Docker Build
```bash
# Build production image
docker build -t restaurant-revolution:latest .

# Build with specific tag
docker build -t restaurant-revolution:v1.0.0 .
```

### Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Multi-Stage Build Benefits
- 🔒 Security: Non-root user, minimal attack surface
- ⚡ Performance: Optimized layers and caching
- 📦 Size: Reduced image size with multi-stage build
- 🏥 Health Checks: Built-in application health monitoring

## Production Deployment

### Cloud Provider Options

#### Option 1: AWS ECS + RDS
```bash
# Deploy using AWS CLI
aws ecs update-service \
  --cluster restaurant-revolution \
  --service app \
  --force-new-deployment
```

#### Option 2: Google Cloud Run
```bash
# Deploy to Cloud Run
gcloud run deploy restaurant-revolution \
  --image gcr.io/project/restaurant-revolution:latest \
  --platform managed \
  --region us-central1
```

#### Option 3: Azure Container Instances
```bash
# Deploy to Azure
az container create \
  --resource-group restaurant-revolution \
  --name app \
  --image restaurant-revolution:latest
```

### Database Setup

#### Production Database
1. **Create PostgreSQL instance**
2. **Run migrations**
   ```bash
   npm run db:migrate:production
   ```
3. **Seed initial data**
   ```bash
   npm run db:seed:production
   ```

#### Backup Strategy
- Automated daily backups
- Point-in-time recovery
- Cross-region replication

### SSL/TLS Configuration
1. **Obtain SSL certificates** (Let's Encrypt recommended)
2. **Configure Nginx** with SSL termination
3. **Set up automatic renewal**

### Load Balancing
- **Application Load Balancer** for multiple instances
- **Health checks** on `/health` endpoint
- **Auto-scaling** based on CPU/memory metrics

## Monitoring & Maintenance

### Application Monitoring
- **Health Checks**: `/health` endpoint
- **Metrics**: Response times, error rates
- **Logs**: Centralized logging with ELK stack
- **Alerts**: Slack/email notifications

### Performance Monitoring
- **Lighthouse CI**: Automated performance testing
- **Real User Monitoring**: Track actual user experience
- **Database Performance**: Query optimization

### Security Monitoring
- **Dependency Scanning**: Automated vulnerability checks
- **Security Headers**: CSP, HSTS, etc.
- **Rate Limiting**: Nginx-based protection
- **Access Logs**: Monitor for suspicious activity

### Backup & Recovery
- **Database Backups**: Daily automated backups
- **Application Backups**: Source code in Git
- **File Uploads**: S3 with versioning
- **Disaster Recovery**: Multi-region setup

## Deployment Checklist

### Pre-Deployment
- [ ] Tests passing in CI
- [ ] Security audit clean
- [ ] Performance tests acceptable
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates valid

### Deployment
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check all integrations
- [ ] Verify database connectivity
- [ ] Test critical user flows

### Post-Deployment
- [ ] Monitor application metrics
- [ ] Check error logs
- [ ] Verify all services healthy
- [ ] Test key functionality
- [ ] Update documentation
- [ ] Notify stakeholders

## Troubleshooting

### Common Issues

#### Application Won't Start
1. Check environment variables
2. Verify database connectivity
3. Check Docker logs: `docker-compose logs app`

#### Database Connection Issues
1. Verify DATABASE_URL format
2. Check network connectivity
3. Confirm database exists and user has permissions

#### Performance Issues
1. Check container resource limits
2. Monitor database query performance
3. Review application logs for errors

#### SSL/TLS Issues
1. Verify certificate validity
2. Check Nginx configuration
3. Test with SSL Labs

### Getting Help
- Check application logs: `docker-compose logs -f`
- Database logs: `docker-compose logs db`
- Nginx logs: `docker-compose logs nginx`
- GitHub Issues: Report bugs and feature requests

## Security Considerations

### Production Security
- Regular security updates
- Minimal container attack surface
- Database encryption at rest
- Secrets management
- Network segmentation
- Regular security audits

### Compliance
- GDPR compliance for EU users
- PCI DSS for payment processing
- SOC 2 Type II for enterprise clients
- Regular penetration testing

---

## Quick Reference

### Development Commands
```bash
npm run dev          # Start development server
npm run test         # Run tests
npm run build        # Build for production
npm run check        # Type checking
```

### Docker Commands
```bash
docker-compose up -d              # Start services
docker-compose logs -f            # View logs
docker-compose down               # Stop services
docker-compose pull               # Update images
```

### Deployment Commands
```bash
git tag v1.0.0                    # Create release tag
git push origin v1.0.0            # Trigger deployment
gh workflow run cd.yml            # Manual deployment
```

For more detailed information, see the individual workflow files in `.github/workflows/`.