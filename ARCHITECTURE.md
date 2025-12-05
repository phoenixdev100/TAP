# 🏗️ Architecture & Design

Comprehensive architecture documentation for TAP (Training, Academics, and Placement).

## Table of Contents

- [System Architecture](#system-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Design](#database-design)
- [API Design](#api-design)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Web Browser (React + TypeScript + Tailwind CSS)         │  │
│  │  - Component-based UI                                    │  │
│  │  - State Management (React Query)                        │  │
│  │  - Responsive Design                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CORS | Rate Limiting | Request Validation              │  │
│  │  JWT Authentication | Error Handling                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                       │  │
│  │  - Routes & Controllers                                  │  │
│  │  - Business Logic                                        │  │
│  │  - Middleware Stack                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Mongoose ODM
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Mongoose Models & Schemas                               │  │
│  │  - Data Validation                                       │  │
│  │  - Relationships                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ MongoDB Protocol
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MongoDB (Local or Atlas)                                │  │
│  │  - Collections & Documents                               │  │
│  │  - Indexes & Aggregations                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── components/              # Reusable React components
│   │   ├── common/              # Shared components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Loader.tsx
│   │   ├── auth/                # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── schedule/            # Schedule components
│   │   ├── assignments/         # Assignment components
│   │   ├── materials/           # Materials components
│   │   └── analytics/           # Analytics components
│   ├── pages/                   # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Schedule.tsx
│   │   ├── Assignments.tsx
│   │   ├── Materials.tsx
│   │   ├── Profile.tsx
│   │   └── NotFound.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSchedule.ts
│   │   ├── useAssignments.ts
│   │   └── useFetch.ts
│   ├── services/                # API services
│   │   ├── api.ts              # Axios instance
│   │   ├── authService.ts
│   │   ├── scheduleService.ts
│   │   ├── assignmentService.ts
│   │   └── analyticsService.ts
│   ├── store/                   # State management
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── notificationStore.ts
│   ├── styles/                  # Global styles
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── animations.css
│   ├── utils/                   # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── types/                   # TypeScript types
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── models.ts
│   ├── App.tsx                  # Main App component
│   └── main.tsx                 # Entry point
├── public/                      # Static assets
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json
```

### Component Hierarchy

```
App
├── Router
│   ├── Layout
│   │   ├── Header
│   │   ├── Sidebar
│   │   └── MainContent
│   │       ├── Dashboard
│   │       ├── Schedule
│   │       ├── Assignments
│   │       ├── Materials
│   │       └── Profile
│   └── AuthPages
│       ├── Login
│       └── Register
```

### State Management Flow

```
┌─────────────────────────────────────────┐
│     React Query (Server State)          │
│  - Caching                              │
│  - Synchronization                      │
│  - Background Updates                   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│   React Hook Form (Form State)          │
│  - Form validation                      │
│  - Error handling                       │
│  - Submission logic                     │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│   Zustand/Context (UI State)            │
│  - Theme                                │
│  - Notifications                        │
│  - Sidebar state                        │
└─────────────────────────────────────────┘
```

### Data Flow

```
User Interaction
      ↓
Component Event Handler
      ↓
API Service Call
      ↓
React Query Hook
      ↓
HTTP Request (Axios)
      ↓
Backend API
      ↓
Response
      ↓
React Query Cache Update
      ↓
Component Re-render
      ↓
UI Update
```

---

## Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Schedule.js
│   │   ├── Assignment.js
│   │   ├── Material.js
│   │   ├── Attendance.js
│   │   └── Grade.js
│   ├── routes/                  # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── schedules.js
│   │   ├── assignments.js
│   │   ├── materials.js
│   │   ├── attendance.js
│   │   ├── grades.js
│   │   └── analytics.js
│   ├── controllers/             # Route handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── scheduleController.js
│   │   ├── assignmentController.js
│   │   ├── materialController.js
│   │   ├── attendanceController.js
│   │   ├── gradeController.js
│   │   └── analyticsController.js
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js             # JWT verification
│   │   ├── errorHandler.js     # Error handling
│   │   ├── validation.js       # Request validation
│   │   ├── rateLimiter.js      # Rate limiting
│   │   └── upload.js           # File upload
│   ├── services/                # Business logic
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   ├── fileService.js
│   │   └── analyticsService.js
│   ├── utils/                   # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── logger.js
│   ├── config/                  # Configuration
│   │   ├── database.js
│   │   ├── environment.js
│   │   └── constants.js
│   ├── server.js               # Express app setup
│   └── index.js                # Entry point
├── uploads/                     # Uploaded files
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── package.json
└── nodemon.json
```

### Request Processing Pipeline

```
Incoming Request
      ↓
CORS Middleware
      ↓
Body Parser Middleware
      ↓
Rate Limiter Middleware
      ↓
Authentication Middleware (if needed)
      ↓
Route Handler
      ↓
Controller Logic
      ↓
Service Layer (Business Logic)
      ↓
Database Query (Mongoose)
      ↓
Response Formatting
      ↓
Error Handler (if error)
      ↓
Response Sent to Client
```

### Middleware Stack

```javascript
// Order matters!
app.use(cors());                    // CORS
app.use(express.json());            // Body parser
app.use(rateLimiter);              // Rate limiting
app.use(requestLogger);            // Logging
app.use('/api', authMiddleware);   // Authentication
app.use('/api', errorHandler);     // Error handling
```

---

## Database Design

### Collections Schema

#### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'faculty', 'student']),
  avatar: String,
  phone: String,
  department: String,
  enrollmentYear: Number,
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean
}
```

#### Schedules Collection

```javascript
{
  _id: ObjectId,
  courseId: ObjectId,
  courseName: String,
  date: Date,
  startTime: String,
  endTime: String,
  room: String,
  instructor: String,
  capacity: Number,
  enrolledStudents: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

#### Assignments Collection

```javascript
{
  _id: ObjectId,
  courseId: ObjectId,
  title: String,
  description: String,
  dueDate: Date,
  totalMarks: Number,
  status: String (enum: ['active', 'closed', 'archived']),
  submissions: [{
    studentId: ObjectId,
    file: String,
    submittedAt: Date,
    marks: Number,
    feedback: String,
    status: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Materials Collection

```javascript
{
  _id: ObjectId,
  courseId: ObjectId,
  title: String,
  description: String,
  file: String,
  fileSize: Number,
  fileType: String,
  uploadedBy: ObjectId,
  downloads: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Attendance Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  courseId: ObjectId,
  date: Date,
  status: String (enum: ['present', 'absent', 'late']),
  markedBy: ObjectId,
  markedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Grades Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  courseId: ObjectId,
  assignmentId: ObjectId,
  marks: Number,
  totalMarks: Number,
  percentage: Number,
  grade: String (enum: ['A', 'B', 'C', 'D', 'F']),
  feedback: String,
  gradedBy: ObjectId,
  gradedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ department: 1 });

// Schedules
db.schedules.createIndex({ courseId: 1 });
db.schedules.createIndex({ date: 1 });
db.schedules.createIndex({ instructor: 1 });

// Assignments
db.assignments.createIndex({ courseId: 1 });
db.assignments.createIndex({ dueDate: 1 });
db.assignments.createIndex({ status: 1 });

// Materials
db.materials.createIndex({ courseId: 1 });
db.materials.createIndex({ uploadedBy: 1 });

// Attendance
db.attendance.createIndex({ userId: 1, date: 1 });
db.attendance.createIndex({ courseId: 1 });

// Grades
db.grades.createIndex({ userId: 1, courseId: 1 });
db.grades.createIndex({ assignmentId: 1 });
```

---

## API Design

### RESTful Principles

```
Resource          GET                 POST                PUT                 DELETE
/users            List users          Create user         -                   -
/users/:id        Get user            -                   Update user         Delete user
/schedules        List schedules      Create schedule     -                   -
/schedules/:id    Get schedule        -                   Update schedule     Delete schedule
/assignments      List assignments    Create assignment   -                   -
/assignments/:id  Get assignment      -                   Update assignment   Delete assignment
```

### API Versioning

```
/api/v1/auth/login
/api/v1/users
/api/v1/schedules
/api/v1/assignments
```

### Response Envelope

```json
{
  "success": boolean,
  "data": object|array,
  "message": string,
  "error": object,
  "pagination": object,
  "timestamp": ISO8601
}
```

---

## Security Architecture

### Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                   LOGIN REQUEST                          │
│  Email: user@example.com                                 │
│  Password: ****                                          │
└──────────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────┐
│            VALIDATE CREDENTIALS                          │
│  - Check email exists                                    │
│  - Compare password hash                                 │
└──────────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────┐
│            GENERATE JWT TOKEN                            │
│  Header: { alg: 'HS256', typ: 'JWT' }                   │
│  Payload: { userId, role, email, exp }                  │
│  Signature: HMAC-SHA256(secret)                          │
└──────────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────┐
│            RETURN TOKEN TO CLIENT                        │
│  { token: 'eyJhbGc...', expiresIn: 604800 }             │
└──────────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────┐
│        CLIENT STORES TOKEN (localStorage)                │
└──────────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────┐
│      SUBSEQUENT REQUESTS WITH TOKEN                      │
│  Authorization: Bearer eyJhbGc...                        │
└──────────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────┐
│      VERIFY TOKEN ON SERVER                              │
│  - Decode JWT                                            │
│  - Verify signature                                      │
│  - Check expiration                                      │
│  - Extract user info                                     │
└──────────────────────────────────────────────────────────┘
```

### Authorization Levels

```
┌─────────────────────────────────────────┐
│         ADMIN                           │
│  - All permissions                      │
│  - System configuration                 │
│  - User management                      │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│         FACULTY                         │
│  - Course management                    │
│  - Assignment creation                  │
│  - Grading                              │
│  - Attendance marking                   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│         STUDENT                         │
│  - View own data                        │
│  - Submit assignments                   │
│  - View grades                          │
│  - Mark attendance                      │
└─────────────────────────────────────────┘
```

---

## Deployment Architecture

### Development Environment

```
Developer Machine
├── Frontend (Vite Dev Server) → localhost:5173
├── Backend (Node Dev Server) → localhost:5000
└── MongoDB (Local) → localhost:27017
```

### Production Environment

```
┌─────────────────────────────────────────────────────────┐
│                   CDN / Static Files                     │
│              (Vercel / Netlify / S3)                     │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│                   Load Balancer                          │
│              (Nginx / HAProxy)                           │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│              API Servers (Multiple)                      │
│  - Node.js + Express                                    │
│  - PM2 Process Manager                                  │
│  - Docker Containers                                    │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│              Database Cluster                           │
│  - MongoDB Replica Set                                  │
│  - Automated Backups                                    │
│  - Sharding for scalability                             │
└─────────────────────────────────────────────────────────┘
```

### Docker Deployment

```dockerfile
# Frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

**Next Steps:** Review [TESTING.md](TESTING.md) for testing strategies.
