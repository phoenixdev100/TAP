# 📚 API Documentation

Complete API reference for TAP (Training, Academics, and Placement).

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Authentication Endpoints](#authentication-endpoints)
- [User Endpoints](#user-endpoints)
- [Schedule Endpoints](#schedule-endpoints)
- [Assignment Endpoints](#assignment-endpoints)
- [Materials Endpoints](#materials-endpoints)
- [Attendance Endpoints](#attendance-endpoints)
- [Grade Endpoints](#grade-endpoints)
- [Analytics Endpoints](#analytics-endpoints)

## Base URL

### Development
```
http://localhost:5000
```

### Production
```
https://api.your-domain.com
```

## Authentication

### JWT Token

All authenticated endpoints require a JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer <JWT_TOKEN>',
  'Content-Type': 'application/json'
}
```

### Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- **Access Token**: 7 days
- **Refresh Token**: 30 days

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com"
  },
  "message": "Operation successful",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### List Response

```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Error Handling

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 500 | Server Error | Internal server error |

### Common Error Codes

| Code | Message | Solution |
|------|---------|----------|
| INVALID_TOKEN | Invalid or expired token | Refresh token or login again |
| UNAUTHORIZED | Unauthorized access | Check permissions |
| NOT_FOUND | Resource not found | Verify resource ID |
| VALIDATION_ERROR | Invalid input data | Check request body |
| DUPLICATE_EMAIL | Email already exists | Use different email |
| INVALID_CREDENTIALS | Invalid email or password | Check credentials |

---

## Authentication Endpoints

### Register User

**Endpoint:**
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "student"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "role": "student"
  }'
```

---

### Login User

**Endpoint:**
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

---

### Refresh Token

**Endpoint:**
```http
POST /api/auth/refresh
```

**Headers:**
```
Authorization: Bearer <REFRESH_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here"
  }
}
```

---

### Logout User

**Endpoint:**
```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### Get User Profile

**Endpoint:**
```http
GET /api/users/profile
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Update User Profile

**Endpoint:**
```http
PUT /api/users/profile
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Smith",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Smith",
    "email": "john@example.com",
    "avatar": "https://example.com/new-avatar.jpg"
  }
}
```

---

### Change Password

**Endpoint:**
```http
PUT /api/users/change-password
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Schedule Endpoints

### Get All Schedules

**Endpoint:**
```http
GET /api/schedules
```

**Query Parameters:**
```
?page=1&limit=10&date=2025-01-01&courseId=course_123
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "schedule_123",
      "courseId": "course_123",
      "courseName": "Data Structures",
      "date": "2025-01-15",
      "startTime": "09:00",
      "endTime": "10:30",
      "room": "A101",
      "instructor": "Dr. Smith"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  }
}
```

---

### Create Schedule

**Endpoint:**
```http
POST /api/schedules
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "course_123",
  "courseName": "Data Structures",
  "date": "2025-01-15",
  "startTime": "09:00",
  "endTime": "10:30",
  "room": "A101",
  "instructor": "Dr. Smith"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "schedule_123",
    "courseId": "course_123",
    "courseName": "Data Structures",
    "date": "2025-01-15",
    "startTime": "09:00",
    "endTime": "10:30",
    "room": "A101",
    "instructor": "Dr. Smith"
  }
}
```

---

### Update Schedule

**Endpoint:**
```http
PUT /api/schedules/:id
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "room": "A102",
  "startTime": "10:00"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "schedule_123",
    "room": "A102",
    "startTime": "10:00"
  }
}
```

---

### Delete Schedule

**Endpoint:**
```http
DELETE /api/schedules/:id
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Schedule deleted successfully"
}
```

---

## Assignment Endpoints

### Get All Assignments

**Endpoint:**
```http
GET /api/assignments
```

**Query Parameters:**
```
?page=1&limit=10&courseId=course_123&status=pending
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "assignment_123",
      "courseId": "course_123",
      "title": "Assignment 1",
      "description": "Complete the exercises",
      "dueDate": "2025-01-20",
      "status": "pending",
      "totalMarks": 100,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Create Assignment

**Endpoint:**
```http
POST /api/assignments
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "course_123",
  "title": "Assignment 1",
  "description": "Complete the exercises",
  "dueDate": "2025-01-20",
  "totalMarks": 100
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "assignment_123",
    "courseId": "course_123",
    "title": "Assignment 1",
    "description": "Complete the exercises",
    "dueDate": "2025-01-20",
    "totalMarks": 100,
    "status": "active"
  }
}
```

---

### Submit Assignment

**Endpoint:**
```http
POST /api/assignments/:id/submit
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <file_to_upload>
submissionText: "My submission"
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "submission_123",
    "assignmentId": "assignment_123",
    "studentId": "user_123",
    "file": "submission_123.pdf",
    "submittedAt": "2025-01-15T10:30:00.000Z",
    "status": "submitted"
  }
}
```

---

### Grade Assignment

**Endpoint:**
```http
PUT /api/assignments/:id/grade
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentId": "user_123",
  "marks": 85,
  "feedback": "Good work, needs improvement in section 2"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "submission_123",
    "marks": 85,
    "feedback": "Good work, needs improvement in section 2",
    "gradedAt": "2025-01-20T14:00:00.000Z"
  }
}
```

---

## Materials Endpoints

### Get All Materials

**Endpoint:**
```http
GET /api/materials
```

**Query Parameters:**
```
?page=1&limit=10&courseId=course_123&type=pdf
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "material_123",
      "courseId": "course_123",
      "title": "Chapter 1 Notes",
      "description": "Introduction to Data Structures",
      "file": "chapter1.pdf",
      "fileSize": 2048000,
      "uploadedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Upload Material

**Endpoint:**
```http
POST /api/materials
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Request Body:**
```
courseId: course_123
title: Chapter 1 Notes
description: Introduction to Data Structures
file: <file_to_upload>
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "material_123",
    "courseId": "course_123",
    "title": "Chapter 1 Notes",
    "file": "material_123.pdf",
    "uploadedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Delete Material

**Endpoint:**
```http
DELETE /api/materials/:id
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

---

## Attendance Endpoints

### Get Attendance Records

**Endpoint:**
```http
GET /api/attendance
```

**Query Parameters:**
```
?page=1&limit=10&userId=user_123&date=2025-01-01&courseId=course_123
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "attendance_123",
      "userId": "user_123",
      "courseId": "course_123",
      "date": "2025-01-15",
      "status": "present",
      "markedAt": "2025-01-15T09:00:00.000Z"
    }
  ]
}
```

---

### Mark Attendance

**Endpoint:**
```http
POST /api/attendance
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_123",
  "courseId": "course_123",
  "date": "2025-01-15",
  "status": "present"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "attendance_123",
    "userId": "user_123",
    "courseId": "course_123",
    "date": "2025-01-15",
    "status": "present"
  }
}
```

---

## Grade Endpoints

### Get Student Grades

**Endpoint:**
```http
GET /api/grades
```

**Query Parameters:**
```
?page=1&limit=10&userId=user_123&courseId=course_123
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "grade_123",
      "userId": "user_123",
      "courseId": "course_123",
      "assignmentId": "assignment_123",
      "marks": 85,
      "totalMarks": 100,
      "percentage": 85,
      "grade": "A",
      "feedback": "Excellent work"
    }
  ]
}
```

---

## Analytics Endpoints

### Get Performance Analytics

**Endpoint:**
```http
GET /api/analytics/performance
```

**Query Parameters:**
```
?userId=user_123&courseId=course_123&period=semester
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "averageGrade": 82.5,
    "totalAssignments": 10,
    "submittedAssignments": 9,
    "pendingAssignments": 1,
    "performanceTrend": [
      { "month": "January", "average": 80 },
      { "month": "February", "average": 85 }
    ]
  }
}
```

---

### Get Attendance Analytics

**Endpoint:**
```http
GET /api/analytics/attendance
```

**Query Parameters:**
```
?userId=user_123&courseId=course_123&period=semester
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "totalClasses": 30,
    "presentDays": 28,
    "absentDays": 2,
    "attendancePercentage": 93.33,
    "attendanceTrend": [
      { "week": "Week 1", "percentage": 100 },
      { "week": "Week 2", "percentage": 90 }
    ]
  }
}
```

---

### Get Assignment Analytics

**Endpoint:**
```http
GET /api/analytics/assignments
```

**Query Parameters:**
```
?courseId=course_123&period=semester
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courseId": "course_123",
    "totalAssignments": 10,
    "submittedCount": 95,
    "pendingCount": 5,
    "averageMarks": 82,
    "submissionRate": 95,
    "assignmentStats": [
      {
        "assignmentId": "assignment_123",
        "title": "Assignment 1",
        "submissionRate": 100,
        "averageMarks": 85
      }
    ]
  }
}
```

---

**For more information, visit the [GitHub Repository](https://github.com/phoenixdev100/tap)**
