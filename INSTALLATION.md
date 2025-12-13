# 📦 Installation Guide

Complete step-by-step installation instructions for TAP (Training, Academics, and Placement).

## Table of Contents

- [Prerequisites](#prerequisites)
- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before installing TAP, ensure you have the following:

### Required Software

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**: For version control
- **MongoDB**: Version 6.0 or higher (local or cloud)

### Verify Installation

```bash
# Check Node.js version
node --version
# Expected output: v18.x.x or higher

# Check npm version
npm --version
# Expected output: 9.x.x or higher

# Check Git version
git --version
# Expected output: git version 2.x.x or higher
```

## System Requirements

### Minimum Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 5 GB | 20 GB |
| OS | Windows 10, macOS 10.15, Ubuntu 18.04 | Windows 11, macOS 12+, Ubuntu 20.04+ |

### Supported Operating Systems

- **Windows**: Windows 10 or later
- **macOS**: macOS 10.15 (Catalina) or later
- **Linux**: Ubuntu 18.04+, Debian 10+, CentOS 7+

## Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/phoenixdev100/tap.git

# Navigate to project directory
cd tap

# Check directory structure
ls -la
# You should see: frontend/, backend/, README.md, LICENSE, .gitignore
```

### Step 2: Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Verify installation
npm list

# Return to root directory
cd ..
```

**Expected packages to be installed:**
- React 18.3.1
- Vite 5.4.1
- TypeScript 5.5.3
- Tailwind CSS 3.4.11
- React Router DOM 6.26.2
- React Query 5.56.2
- And 50+ other dependencies

### Step 3: Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Verify installation
npm list

# Return to root directory
cd ..
```

**Expected packages to be installed:**
- Express.js 4.18.2
- MongoDB Mongoose 7.6.3
- JWT (jsonwebtoken) 9.0.2
- bcryptjs 2.4.3
- dotenv 16.3.1
- And 20+ other dependencies

## Database Setup

### Option A: MongoDB Atlas (Cloud - Recommended)

**Step 1: Create MongoDB Atlas Account**
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Sign Up" or "Sign In"
3. Create a new account or log in

**Step 2: Create a New Project**
1. Click "Create a Project"
2. Enter project name (e.g., "TAP")
3. Click "Create Project"

**Step 3: Create a Cluster**
1. Click "Create a Deployment"
2. Choose "M0 Free" tier (free option)
3. Select your preferred region (closest to your location)
4. Click "Create Deployment"

**Step 4: Set Up Database Access**
1. Go to "Database Access" in the left menu
2. Click "Add New Database User"
3. Enter username and password
4. Click "Add User"

**Step 5: Set Up Network Access**
1. Go to "Network Access" in the left menu
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (for development)
4. Click "Confirm"

**Step 6: Get Connection String**
1. Go to "Databases" in the left menu
2. Click "Connect" on your cluster
3. Select "Drivers"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<database>` with your credentials

Example connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/tap?retryWrites=true&w=majority
```

### Option B: Local MongoDB Installation

#### Windows

1. Download MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Follow the installation wizard
4. Choose "Install MongoDB as a Service"
5. Complete the installation

**Start MongoDB:**
```bash
# MongoDB should start automatically as a service
# To verify it's running:
mongosh
# You should see the MongoDB shell prompt
```

#### macOS

```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify installation
mongosh
```

#### Linux (Ubuntu/Debian)

```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Verify installation
mongosh
```

**Local Connection String:**
```
mongodb://localhost:27017/tap
```

## Environment Configuration

### Backend Environment Setup

**Create `.env` file in `backend/` directory:**

```bash
cd backend
touch .env
```

**Add the following content to `backend/.env`:**

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================

# For MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tap?retryWrites=true&w=majority

# For Local MongoDB
# MONGODB_URI=mongodb://localhost:27017/tap

# ============================================
# AUTHENTICATION
# ============================================

# JWT Secret (use a strong, random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

# JWT Expiration time
JWT_EXPIRE=7d

# ============================================
# SERVER CONFIGURATION
# ============================================

# Server port
PORT=5000

# Environment (development, production, test)
NODE_ENV=development

# ============================================
# FILE UPLOAD
# ============================================

# Maximum file size in bytes (10 MB)
MAX_FILE_SIZE=10485760

# Upload directory path
UPLOAD_PATH=./uploads

# ============================================
# EMAIL CONFIGURATION (Optional)
# ============================================

# SMTP Server
EMAIL_HOST=smtp.gmail.com

# SMTP Port
EMAIL_PORT=587

# Email address
EMAIL_USER=your_email@gmail.com

# Email password or app password
EMAIL_PASS=your_app_password

# ============================================
# CORS CONFIGURATION
# ============================================

# Allowed origins (comma-separated)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# ============================================
# LOGGING
# ============================================

# Log level (error, warn, info, debug)
LOG_LEVEL=info
```

### Frontend Environment Setup

**Create `.env` file in `frontend/` directory:**

```bash
cd frontend
touch .env
```

**Add the following content to `frontend/.env`:**

```env
# ============================================
# API CONFIGURATION
# ============================================

# Backend API URL
VITE_API_URL=http://localhost:5000

# API request timeout (milliseconds)
VITE_API_TIMEOUT=10000

# ============================================
# APPLICATION CONFIGURATION
# ============================================

# Application name
VITE_APP_NAME=TAP

# Application version
VITE_APP_VERSION=1.0.0

# ============================================
# FEATURE FLAGS
# ============================================

# Enable analytics
VITE_ENABLE_ANALYTICS=false

# Enable notifications
VITE_ENABLE_NOTIFICATIONS=true

# Enable dark mode
VITE_ENABLE_DARK_MODE=true

# ============================================
# DEVELOPMENT
# ============================================

# Debug mode
VITE_DEBUG=false
```

### Environment Variables for Production

**Backend Production `.env`:**

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tap
JWT_SECRET=use_a_very_strong_random_secret_key_here
JWT_EXPIRE=7d
PORT=5000
CORS_ORIGIN=https://your-domain.com
LOG_LEVEL=warn
```

**Frontend Production `.env`:**

```env
VITE_API_URL=https://api.your-domain.com
VITE_API_TIMEOUT=10000
VITE_APP_NAME=TAP
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG=false
```

## Verification

### Verify Backend Setup

```bash
# Navigate to backend directory
cd backend

# Start development server
npm run dev

# Expected output:
# Server running on http://localhost:5000
# Connected to MongoDB
```

### Verify Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Start development server
npm run dev

# Expected output:
# VITE v5.4.1 ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

### Verify Database Connection

```bash
# Connect to MongoDB
mongosh

# List databases
show databases

# You should see 'tap' database listed
```

### Verify API Endpoints

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","timestamp":"2025-01-01T00:00:00.000Z"}
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: MongoDB Connection Error

**Error Message:**
```
MongooseError: Cannot connect to MongoDB
```

**Solutions:**
1. Verify MongoDB is running
2. Check connection string in `.env`
3. Verify username and password
4. Check network access (for MongoDB Atlas)
5. Ensure database name is correct

#### Issue: Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change PORT in .env
PORT=5001
```

#### Issue: npm Install Fails

**Error Message:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Or use legacy peer deps flag
npm install --legacy-peer-deps
```

#### Issue: CORS Error

**Error Message:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
1. Verify `CORS_ORIGIN` in backend `.env`
2. Ensure frontend URL matches `CORS_ORIGIN`
3. Check backend is running on correct port
4. Restart backend server

#### Issue: Environment Variables Not Loading

**Error Message:**
```
Cannot read property 'MONGODB_URI' of undefined
```

**Solutions:**
1. Verify `.env` file exists in correct directory
2. Check `.env` file is not in `.gitignore`
3. Restart development server after creating `.env`
4. Verify variable names are correct

### Getting Help

If you encounter issues not listed above:

1. Check the [GitHub Issues](https://github.com/phoenixdev100/tap/issues)
2. Review error logs in console
3. Check MongoDB logs
4. Verify all prerequisites are installed
5. Create a new GitHub issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)
   - Screenshots if applicable

---

**Next Steps:** After successful installation, proceed to [SETUP.md](SETUP.md) for initial configuration.
