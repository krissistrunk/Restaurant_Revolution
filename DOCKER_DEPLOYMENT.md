# 🐳 Docker Deployment Guide - Restaurant Revolution v3

## 🚀 Quick Start with OpenTable-Level Features

### Prerequisites
- Docker & Docker Compose installed
- Twilio account for SMS notifications (optional but recommended)

### 1. Clone and Setup
```bash
git clone https://github.com/krissistrunk/Restaurant_Revolution.git
cd Restaurant_Revolution
cp .env.example .env
```

### 2. Configure OpenTable-Level SMS Features
Edit your `.env` file with Twilio credentials:

```bash
# OpenTable-Level SMS Configuration
TWILIO_ACCOUNT_SID=your_account_sid_from_twilio
TWILIO_AUTH_TOKEN=your_auth_token_from_twilio
TWILIO_FROM_NUMBER=+1234567890

# Enable New Features
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_GUEST_ANALYTICS=true
ENABLE_REAL_TIME_WAITLIST=true
ENABLE_SPECIAL_OCCASIONS=true
```

### 3. Deploy with Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Check status
docker-compose ps
```

## 📱 Services Overview

### Main Application (Port 5001)
- **Features**: OpenTable-level waitlist, SMS notifications, guest profiles
- **Health Check**: `http://localhost:5001/health`
- **API**: `http://localhost:5001/api`

### PostgreSQL Database (Port 5432)
- **Database**: `restaurant_revolution`
- **User**: `user` / **Password**: `password`
- **Features**: Enhanced schemas for guest analytics and visit tracking

### Redis Cache (Port 6379)
- **Purpose**: Session storage, real-time data caching
- **WebSocket support**: Real-time waitlist updates

### CMS (Strapi) (Port 1337)
- **Admin**: `http://localhost:1337/admin`
- **API**: Content management for restaurants

### Nginx Proxy (Port 80/443)
- **Production**: Load balancing and SSL termination
- **Static Files**: Optimized asset serving

## 🆕 New OpenTable-Level Features

### 📞 SMS Waitlist Management
```bash
# Test SMS functionality
curl -X POST http://localhost:5001/api/queue-entries \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "restaurantId": 1,
    "partySize": 2,
    "phone": "+1234567890",
    "smsNotifications": true,
    "seatingPreference": "booth"
  }'
```

### 👤 Guest Profiles & Analytics
```bash
# Get guest profile with analytics
curl http://localhost:5001/api/guest-profile/1?restaurantId=1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 🎉 Special Occasion Tracking
```bash
# Make reservation with special occasion
curl -X POST http://localhost:5001/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "date": "2024-12-25",
    "time": "19:00",
    "partySize": 4,
    "specialOccasion": "anniversary",
    "seatingPreference": "window"
  }'
```

## 🔧 Staff Management Interface

Access the enhanced waitlist management:
1. Navigate to `http://localhost:5001`
2. Login as staff/owner
3. Go to Waitlist Manager
4. Features available:
   - Call customers with SMS notifications
   - Seat parties with preference tracking
   - Update wait times dynamically
   - View guest history and preferences

## 🛠️ Development Mode

```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Run specific service
docker-compose up app db redis

# Access container shell
docker-compose exec app sh

# View live logs
docker-compose logs -f app
```

## 🔍 Monitoring & Health Checks

### Application Health
```bash
curl http://localhost:5001/health
```

### Database Health
```bash
docker-compose exec db pg_isready -U user -d restaurant_revolution
```

### Redis Health
```bash
docker-compose exec redis redis-cli ping
```

## 📊 Environment Variables Guide

### Required for SMS Features
```bash
TWILIO_ACCOUNT_SID=ACxxxxx          # From Twilio Console
TWILIO_AUTH_TOKEN=your_auth_token    # From Twilio Console  
TWILIO_FROM_NUMBER=+1234567890       # Your Twilio phone number
```

### Feature Toggles
```bash
ENABLE_SMS_NOTIFICATIONS=true       # Professional SMS service
ENABLE_GUEST_ANALYTICS=true        # Visit history & preferences
ENABLE_REAL_TIME_WAITLIST=true     # Live position updates
ENABLE_SPECIAL_OCCASIONS=true      # Birthday/anniversary tracking
```

### Production Settings
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/restaurant_revolution
SESSION_SECRET=secure-32-char-minimum-secret
```

## 🚀 Production Deployment

### SSL Configuration
1. Place SSL certificates in `./ssl/` directory
2. Update `nginx.conf` with your domain
3. Set production environment variables

### Scaling
```bash
# Scale app instances
docker-compose up -d --scale app=3

# Add load balancer
docker-compose -f docker-compose.prod.yml up -d
```

### Backup & Recovery
```bash
# Backup database
docker-compose exec db pg_dump -U user restaurant_revolution > backup.sql

# Restore database
docker-compose exec -T db psql -U user restaurant_revolution < backup.sql
```

## 🐛 Troubleshooting

### SMS Not Working
1. Check Twilio credentials in `.env`
2. Verify phone number format (+1234567890)
3. Check Twilio account balance
4. View logs: `docker-compose logs app | grep -i twilio`

### Database Connection Issues
```bash
# Check database status
docker-compose ps db

# Reset database
docker-compose down -v
docker-compose up -d db
```

### WebSocket Issues
```bash
# Check Redis connection
docker-compose logs redis

# Restart app service
docker-compose restart app
```

## 📈 Performance Optimization

### Resource Limits
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### Caching
- Redis for session storage
- Nginx for static asset caching
- Database query optimization

## 🔐 Security Considerations

1. **Change default passwords** in production
2. **Use strong secrets** for JWT and sessions  
3. **Enable SSL** with valid certificates
4. **Configure firewall** to restrict database access
5. **Regular security updates**

## 📚 Additional Resources

- [Twilio SMS Setup Guide](https://www.twilio.com/docs/sms)
- [PostgreSQL Docker Guide](https://hub.docker.com/_/postgres)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Redis Caching](https://redis.io/documentation)

---

🎉 **Your OpenTable-level restaurant management system is now ready for production!**