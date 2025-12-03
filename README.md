<div align="center">

# 🎓 TAP – Training, Academics, and Placement 📚

</div>

<div align="center">

[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

<img src="https://raw.githubusercontent.com/phoenixdev100/tap/main/frontend/src/img/campus-dashboard.png" alt="Campus Dashboard Preview" width="800"/>

</div>

<div align="center">

## 📖 Quick Navigation

| 📚 Documentation | 🔧 Setup | 🚀 Deployment |
|---|---|---|
| [📖 Installation](INSTALLATION.md) | [⚙️ Setup & Config](SETUP.md) | [📦 Deployment](DEPLOYMENT.md) |
| [📚 API Docs](API_DOCUMENTATION.md) | [🏗️ Architecture](ARCHITECTURE.md) | [🧪 Testing](TESTING.md) |
| [🤝 Contributing](CONTRIBUTING.md) | [📝 License](LICENSE) | [🙏 Acknowledgments](#-acknowledgments) |

</div>

<div align="center">

## 🌟 About The Project

</div>

TAP (Training, Academics, and Placement) is a comprehensive campus management application designed to revolutionize how educational institutions handle academic activities and enhance the student experience. Built with modern web technologies, TAP provides an intuitive, responsive interface for managing schedules, assignments, study materials, and placement activities.

### 🎯 Problem Statement

Traditional campus management systems often suffer from:
- Complex, outdated user interfaces
- Limited mobile accessibility
- Poor integration between academic and placement services
- Lack of real-time updates and notifications

### 💡 Solution

TAP addresses these challenges by providing:
- **Modern UI/UX**: Clean, intuitive interface built with React and Tailwind CSS
- **Real-time Updates**: Live notifications and instant data synchronization
- **Mobile-First Design**: Fully responsive across all devices
- **Unified Platform**: Integrated academic and placement management
- **Scalable Architecture**: Built with modern, maintainable technologies

<div align="center">

## 🏗️ Architecture

</div>

TAP follows a modern three-tier architecture with clear separation of concerns:

- **Frontend**: React 18 with TypeScript, Vite, and Tailwind CSS
- **Backend**: Express.js with Node.js and MongoDB
- **Database**: MongoDB with Mongoose ODM

For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md)

<div align="center">

## ✨ Features

For detailed feature information, see [FEATURES.md](FEATURES.md)
</div>

### 📚 Academic Management
- 📅 **Interactive Schedule**: Daily, weekly, and monthly calendar views
- 📝 **Assignment Tracking**: Create, submit, and grade assignments
- 📚 **Study Materials**: Upload and organize course materials
- ✅ **Attendance System**: Track and manage student attendance
- 🎯 **Grade Management**: Comprehensive grading system with analytics

### 🎨 User Experience
- 🌓 **Theme Support**: Dark/light mode with system preference detection
- 📱 **Responsive Design**: Optimized for mobile, tablet, and desktop
- 🎯 **Intuitive Navigation**: Sidebar navigation with breadcrumbs
- 🔔 **Real-time Notifications**: Push notifications for important updates
- 🌍 **Accessibility**: WCAG 2.1 compliant with keyboard navigation

### 🔒 Security & Authentication
- 🔐 **JWT Authentication**: Secure token-based authentication
- 👥 **Role-Based Access**: Different permissions for students, faculty, and admin
- 🛡️ **API Security**: Rate limiting, input validation, and sanitization
- 🔒 **Data Privacy**: Encrypted sensitive data storage

### 📊 Analytics & Reporting
- 📈 **Performance Analytics**: Student performance tracking
- 📊 **Attendance Reports**: Comprehensive attendance analytics
- 📋 **Assignment Statistics**: Submission and grading metrics
- 🎯 **Placement Analytics**: Job placement statistics and trends

<div align="center">

## 🛠️ Tech Stack

</div>

### Frontend
- **Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 5.4.1
- **Styling**: Tailwind CSS 3.4.11 + shadcn/ui components
- **State Management**: 
  - React Query (@tanstack/react-query 5.56.2)
  - React Hook Form 7.53.0 with Zod 3.23.8
- **Routing**: React Router DOM 6.26.2
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React 0.462.0
- **Charts**: Recharts 2.12.7
- **Animations**: Framer Motion 12.6.5
- **Date Handling**: date-fns 3.6.0, react-day-picker 8.10.1

### Backend
- **Runtime**: Node.js (v18+ recommended)
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 7.6.3
- **Authentication**: 
  - JWT (jsonwebtoken 9.0.2)
  - Password Hashing (bcryptjs 2.4.3)
- **File Upload**: Multer 2.0.2
- **Environment**: dotenv 16.3.1
- **Development**: nodemon 3.0.1
- **Security**: CORS 2.8.5, helmet (recommended)

### Development Tools
- **Code Quality**: ESLint 9.9.0 with TypeScript support
- **Type Checking**: TypeScript 5.5.3
- **Package Management**: npm 9+
- **Version Control**: Git
- **API Testing**: Postman (recommended)

<div align="center">

## 🚀 Quick Start

</div>

### 🎯 One-Click Setup (Recommended)

```bash
# Clone and setup automatically
git clone https://github.com/phoenixdev100/tap.git
cd tap
npm run setup
```

<div align="center">

### 📋 Prerequisites

</div>

Ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher  
- **MongoDB**: Version 6.0 or higher (local or Atlas)
- **Git**: For version control

**Check versions:**
```bash
node --version  # Should be v18+
npm --version   # Should be 9+
mongod --version # Should be 6+
```

<div align="center">

## ⚙️ Installation

</div>

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/phoenixdev100/tap.git
cd tap
```

### 2. 📦 Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies  
cd ../backend
npm install

# Return to root
cd ..
```

### 3. 🗄️ Set Up Database

**Option A: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string

**Option B: Local MongoDB**
```bash
# Install MongoDB locally
# Windows: Download from mongodb.com
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB service
mongod
```

### 4. 🔧 Environment Configuration

Create environment files in both frontend and backend directories:

**Backend Environment** (`backend/.env`):
```env
# Database
MONGODB_URI=mongodb://localhost:27017/tap
# or for Atlas: mongodb+srv://username:password@cluster.mongodb.net/tap

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Frontend Environment** (`frontend/.env`):
```env
# API
VITE_API_URL=http://localhost:5000
VITE_API_TIMEOUT=10000

# App
VITE_APP_NAME=TAP
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
```

### 5. 🚀 Start the Application

```bash
# Start backend server (in terminal 1)
cd backend
npm run dev

# Start frontend development server (in terminal 2)  
cd frontend
npm run dev
```

### 6. 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

For detailed setup instructions, see [INSTALLATION.md](INSTALLATION.md) and [SETUP.md](SETUP.md)

---

<div align="center">

## 📚 Documentation

</div>

Complete documentation is available in separate files:

- **[📖 Installation Guide](INSTALLATION.md)** - Detailed setup instructions
- **[⚙️ Setup & Configuration](SETUP.md)** - Initial setup and configuration
- **[📚 API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[🏗️ Architecture](ARCHITECTURE.md)** - System design and architecture
- **[🧪 Testing Guide](TESTING.md)** - Testing strategies and examples
- **[📦 Deployment Guide](DEPLOYMENT.md)** - Production deployment options
- **[🤝 Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project

<div align="center">

## 📝 License

</div>

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### 📄 License Summary

```
MIT License

Copyright (c) 2025 Deepak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

<div align="center">

## 🙏 Acknowledgments

</div>

- **[React](https://reactjs.org)** - The UI library
- **[Tailwind CSS](https://tailwindcss.com)** - The CSS framework
- **[shadcn/ui](https://ui.shadcn.com)** - The component library
- **[MongoDB](https://www.mongodb.com)** - The database
- **[Express.js](https://expressjs.com)** - The backend framework
- **[Vite](https://vitejs.dev)** - The build tool

### 🌟 Special Thanks

- All contributors who help improve this project
- The open-source community for amazing tools and libraries
- Educational institutions that provided valuable feedback

---

<div align="center">

### 🚀 **Built with ❤️ by [Deepak](https://github.com/phoenixdev100)**

[![GitHub followers](https://img.shields.io/github/followers/phoenixdev100?style=social)](https://github.com/phoenixdev100)
[![GitHub stars](https://img.shields.io/github/stars/phoenixdev100/tap?style=social)](https://github.com/phoenixdev100/tap)

**⭐ Star this repository if it helped you!**

</div>
