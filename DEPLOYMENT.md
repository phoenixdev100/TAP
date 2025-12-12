# 📦 Deployment Guide

Complete deployment instructions for TAP (Training, Academics, and Placement).

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Vercel Deployment (Frontend)](#vercel-deployment-frontend)
- [Railway Deployment (Backend)](#railway-deployment-backend)
- [Docker Deployment](#docker-deployment)
- [Traditional VPS Deployment](#traditional-vps-deployment)
- [Database Migration](#database-migration)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No console errors or warnings
- [ ] ESLint checks passing (`npm run lint`)
- [ ] TypeScript compilation successful
- [ ] No hardcoded secrets or credentials
- [ ] Environment variables documented

### Security

- [ ] JWT secret is strong and unique
- [ ] CORS origins are properly configured
- [ ] HTTPS is enabled
- [ ] Database credentials are secure
- [ ] API rate limiting is configured
- [ ] Input validation is implemented

### Performance

- [ ] Frontend bundle size optimized
- [ ] Images are compressed
- [ ] Database indexes are created
- [ ] Caching strategies implemented
- [ ] CDN configured for static assets

### Documentation

- [ ] README is up to date
- [ ] API documentation is complete
- [ ] Deployment steps are documented
- [ ] Environment variables are listed
- [ ] Troubleshooting guide is available

---

## Environment Setup

### Production Environment Variables

**Backend `.env.production`:**

```env
# ============================================
# DATABASE
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tap?retryWrites=true&w=majority

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET=your_very_strong_random_secret_key_here_minimum_32_characters
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# ============================================
# SERVER
# ============================================
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# ============================================
# SECURITY
# ============================================
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
ALLOWED_ORIGINS=https://your-domain.com

# ============================================
# EMAIL
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# ============================================
# FILE UPLOAD
# ============================================
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=warn
```

**Frontend `.env.production`:**

```env
# ============================================
# API
# ============================================
VITE_API_URL=https://api.your-domain.com
VITE_API_TIMEOUT=10000

# ============================================
# APPLICATION
# ============================================
VITE_APP_NAME=TAP
VITE_APP_VERSION=1.0.0

# ============================================
# FEATURES
# ============================================
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_DARK_MODE=true

# ============================================
# DEBUG
# ============================================
VITE_DEBUG=false
```

---

## Vercel Deployment (Frontend)

### Step 1: Prepare Frontend

```bash
# Build frontend
cd frontend
npm run build

# Test production build locally
npm run preview
```

### Step 2: Connect to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Option B: Using GitHub**

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables
7. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add production variables:
   - `VITE_API_URL=https://api.your-domain.com`
   - `VITE_APP_NAME=TAP`
   - `VITE_ENABLE_ANALYTICS=true`

### Step 4: Configure Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records (provided by Vercel)
4. Wait for DNS propagation (up to 48 hours)

### Step 5: Enable Auto-Deployment

1. Go to Project Settings → Git
2. Enable "Automatic Deployments"
3. Select branch (usually `main`)

---

## Railway Deployment (Backend)

### Step 1: Prepare Backend

```bash
# Build backend
cd backend
npm run build

# Test production build
npm start
```

### Step 2: Create Railway Account

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project

### Step 3: Deploy Backend

**Using Railway CLI:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Link to project
railway link

# Deploy
railway up
```

**Using GitHub:**

1. Push code to GitHub
2. In Railway Dashboard, click "New Project"
3. Select "Deploy from GitHub"
4. Choose your repository
5. Configure build settings

### Step 4: Configure Environment Variables

In Railway Dashboard:

1. Go to Project → Variables
2. Add production variables:
   - `MONGODB_URI=mongodb+srv://...`
   - `JWT_SECRET=your_secret`
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://your-domain.com`

### Step 5: Configure Domain

1. Go to Project → Domains
2. Add custom domain
3. Update DNS records

### Step 6: Set Up Database

**Option A: MongoDB Atlas (Recommended)**

1. Create MongoDB Atlas cluster
2. Get connection string
3. Add to Railway variables as `MONGODB_URI`

**Option B: Railway PostgreSQL**

1. In Railway Dashboard, add PostgreSQL service
2. Connect backend to PostgreSQL
3. Update connection string

---

## Docker Deployment

### Step 1: Create Dockerfiles

**Frontend Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Backend Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Step 2: Create Docker Compose

**`docker-compose.yml`:**

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:5000
    depends_on:
      - backend
    networks:
      - tap-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/tap
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - mongo
    networks:
      - tap-network
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=tap
    networks:
      - tap-network
    restart: unless-stopped

volumes:
  mongo_data:

networks:
  tap-network:
    driver: bridge
```

### Step 3: Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Step 4: Deploy to Docker Registry

```bash
# Login to Docker Hub
docker login

# Build image
docker build -t yourusername/tap-backend:1.0.0 ./backend

# Push to registry
docker push yourusername/tap-backend:1.0.0

# Pull and run
docker run -d \
  -e MONGODB_URI=mongodb+srv://... \
  -e JWT_SECRET=your_secret \
  -p 5000:5000 \
  yourusername/tap-backend:1.0.0
```

---

## Traditional VPS Deployment

### Step 1: Set Up Server

**SSH into server:**

```bash
ssh root@your_server_ip
```

**Update system:**

```bash
apt update && apt upgrade -y
```

**Install Node.js:**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
```

**Install MongoDB:**

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

**Install Nginx:**

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### Step 2: Deploy Application

**Clone repository:**

```bash
cd /var/www
git clone https://github.com/yourusername/tap.git
cd tap
```

**Install dependencies:**

```bash
# Frontend
cd frontend
npm install
npm run build
cd ..

# Backend
cd backend
npm install
cd ..
```

**Create environment files:**

```bash
# Backend
cd backend
nano .env
# Add production variables

# Frontend
cd ../frontend
nano .env
# Add production variables
```

### Step 3: Set Up PM2

**Install PM2:**

```bash
npm install -g pm2
```

**Create PM2 ecosystem file:**

```bash
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'tap-backend',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log'
    },
    {
      name: 'tap-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log'
    }
  ]
};
EOF
```

**Start applications:**

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 4: Configure Nginx

**Create Nginx config:**

```bash
cat > /etc/nginx/sites-available/tap << 'EOF'
upstream backend {
    server 127.0.0.1:5000;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

**Enable site:**

```bash
ln -s /etc/nginx/sites-available/tap /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 5: Set Up SSL Certificate

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Auto-renewal
systemctl enable certbot.timer
```

---

## Database Migration

### Backup Database

```bash
# Local MongoDB
mongodump --db tap --out ./backup

# MongoDB Atlas
mongodump --uri "mongodb+srv://username:password@cluster.mongodb.net/tap"
```

### Restore Database

```bash
# Local MongoDB
mongorestore ./backup

# MongoDB Atlas
mongorestore --uri "mongodb+srv://username:password@cluster.mongodb.net" ./backup
```

---

## Monitoring & Logging

### Application Monitoring

**Using PM2 Monitoring:**

```bash
# Install PM2 Plus
pm2 install pm2-auto-pull

# Monitor
pm2 monit

# View logs
pm2 logs tap-backend
pm2 logs tap-frontend
```

### Error Tracking

**Using Sentry:**

```bash
# Install Sentry
npm install @sentry/node

# Configure in backend
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

---

## Troubleshooting

### Common Deployment Issues

**Issue: Build fails on Vercel**

Solution:
```bash
# Check build logs
# Ensure all dependencies are in package.json
# Verify environment variables are set
# Check Node version compatibility
```

**Issue: Backend cannot connect to database**

Solution:
```bash
# Verify MongoDB connection string
# Check IP whitelist in MongoDB Atlas
# Verify credentials
# Test connection locally
```

**Issue: CORS errors in production**

Solution:
```bash
# Update CORS_ORIGIN in .env
# Ensure frontend URL matches
# Check backend is running
# Clear browser cache
```

**Issue: High memory usage**

Solution:
```bash
# Check for memory leaks
# Optimize database queries
# Implement caching
# Scale horizontally
```

---

**For more help, visit [GitHub Issues](https://github.com/phoenixdev100/tap/issues)**
