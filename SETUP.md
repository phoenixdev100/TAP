# ⚙️ Setup & Configuration Guide

Detailed setup and configuration instructions for TAP after installation.

## Table of Contents

- [Initial Setup](#initial-setup)
- [Database Initialization](#database-initialization)
- [User Roles & Permissions](#user-roles--permissions)
- [API Configuration](#api-configuration)
- [Security Setup](#security-setup)
- [Email Configuration](#email-configuration)
- [File Upload Configuration](#file-upload-configuration)

## Initial Setup

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

### 2. Create Admin Account

**Using API:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@tap.local",
    "password": "SecurePassword123!",
    "role": "admin"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id_here",
    "name": "Admin User",
    "email": "admin@tap.local",
    "role": "admin",
    "token": "jwt_token_here"
  }
}
```

### 3. Create Test Accounts

**Faculty Account:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. John Smith",
    "email": "john.smith@tap.local",
    "password": "FacultyPass123!",
    "role": "faculty"
  }'
```

**Student Account:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@tap.local",
    "password": "StudentPass123!",
    "role": "student"
  }'
```

## Database Initialization

### Create Collections

The database collections are automatically created when you first use them. However, you can manually initialize them:

```bash
# Connect to MongoDB
mongosh

# Use TAP database
use tap

# Create collections
db.createCollection("users")
db.createCollection("schedules")
db.createCollection("assignments")
db.createCollection("materials")
db.createCollection("attendance")
db.createCollection("grades")

# Verify collections
show collections
```

### Create Indexes

For better performance, create indexes on frequently queried fields:

```bash
# Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })

# Schedules collection
db.schedules.createIndex({ "userId": 1 })
db.schedules.createIndex({ "date": 1 })

# Assignments collection
db.assignments.createIndex({ "courseId": 1 })
db.assignments.createIndex({ "dueDate": 1 })

# Materials collection
db.materials.createIndex({ "courseId": 1 })

# Attendance collection
db.attendance.createIndex({ "userId": 1, "date": 1 })

# Grades collection
db.grades.createIndex({ "userId": 1, "courseId": 1 })
```

### Seed Sample Data

**Create `backend/seeds/seed.js`:**

```javascript
const mongoose = require('mongoose');
const User = require('../models/User');
const Schedule = require('../models/Schedule');

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Schedule.deleteMany({});

    // Create sample users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@tap.local',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Dr. John Smith',
        email: 'john@tap.local',
        password: 'faculty123',
        role: 'faculty'
      },
      {
        name: 'Jane Doe',
        email: 'jane@tap.local',
        password: 'student123',
        role: 'student'
      }
    ]);

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
```

**Run seed script:**
```bash
node backend/seeds/seed.js
```

## User Roles & Permissions

### Role Hierarchy

```
┌─────────────────────────────────────┐
│         ADMIN                       │
│  - Full system access               │
│  - User management                  │
│  - System configuration             │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│         FACULTY                     │
│  - Create/manage courses            │
│  - Create assignments               │
│  - Grade students                   │
│  - View attendance                  │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│         STUDENT                     │
│  - View schedules                   │
│  - Submit assignments               │
│  - View grades                      │
│  - Mark attendance                  │
└─────────────────────────────────────┘
```

### Permission Matrix

| Feature | Admin | Faculty | Student |
|---------|-------|---------|---------|
| User Management | ✅ | ❌ | ❌ |
| Create Courses | ✅ | ✅ | ❌ |
| Create Assignments | ✅ | ✅ | ❌ |
| Submit Assignments | ✅ | ❌ | ✅ |
| Grade Assignments | ✅ | ✅ | ❌ |
| View Grades | ✅ | ✅ | ✅ |
| Manage Attendance | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ❌ |

## API Configuration

### Base URL Configuration

**Development:**
```env
VITE_API_URL=http://localhost:5000
```

**Production:**
```env
VITE_API_URL=https://api.your-domain.com
```

### API Rate Limiting

**Configure in `backend/.env`:**
```env
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Implement in `backend/middleware/rateLimiter.js`:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests, please try again later'
});

module.exports = limiter;
```

### API Versioning

Structure your API with versioning:

```
/api/v1/auth/login
/api/v1/auth/register
/api/v1/schedules
/api/v1/assignments
/api/v1/materials
```

## Security Setup

### JWT Configuration

**Generate Strong JWT Secret:**
```bash
# Generate random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Add to `.env`:**
```env
JWT_SECRET=your_generated_secret_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
```

### Password Security

**Configure bcrypt in `backend/utils/passwordHash.js`:**
```javascript
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
```

### HTTPS Configuration

**For Production:**
```bash
# Install SSL certificate (Let's Encrypt)
sudo certbot certonly --standalone -d your-domain.com

# Configure in backend
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/your-domain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/your-domain.com/fullchain.pem')
};

https.createServer(options, app).listen(443);
```

### CORS Configuration

**Configure in `backend/server.js`:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Email Configuration

### Gmail Setup

**Enable 2-Factor Authentication:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Generate App Password

**Configure in `.env`:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Email Service in `backend/services/emailService.js`:**
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
};

module.exports = { sendEmail };
```

### Email Templates

**Password Reset Email:**
```html
<h1>Password Reset Request</h1>
<p>Click the link below to reset your password:</p>
<a href="http://localhost:5173/reset-password?token={{token}}">
  Reset Password
</a>
<p>This link expires in 1 hour.</p>
```

## File Upload Configuration

### Configure Upload Directory

**Create upload directory:**
```bash
mkdir -p backend/uploads
mkdir -p backend/uploads/assignments
mkdir -p backend/uploads/materials
mkdir -p backend/uploads/profiles
```

### Multer Configuration

**`backend/middleware/upload.js`:**
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

module.exports = upload;
```

### File Upload Routes

**`backend/routes/upload.js`:**
```javascript
const express = require('express');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    success: true,
    file: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
});

module.exports = router;
```

---

**Next Steps:** Proceed to [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed API endpoints.
