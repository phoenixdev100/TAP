# 🎓 TAP – Training, Academics, and Placement 📚

<div align="center">

[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)

<img src="https://raw.githubusercontent.com/phoenixdev100/tap/main/frontend/src/img/campus-dashboard.png" alt="Campus Dashboard Preview" width="800"/>

</div>

## 📝 About The Project

TAP is a comprehensive campus management application designed to streamline academic activities and enhance the student experience. It provides an intuitive interface for managing schedules, assignments, and academic resources.

## 📝 Key Features

### 📚 Academic Management
- 📅 Interactive class schedule with daily/weekly views
- 📝 Assignment tracking and submission
- 📚 Study materials organization
- ✅ Attendance tracking

### 🎨 User Experience
- 🌓 Dark/Light mode support
- 📱 Responsive design for all devices
- 🎯 Intuitive navigation
- 🔔 Real-time notifications

### 🔒 Security
- 🔐 JWT-based authentication
- 👥 Role-based access control
- 🛡️ Secure API endpoints

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **API**: RESTful architecture

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (v6+)
- npm (v9+)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/TAP.git
cd TAP
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Set up environment variables**
```bash
# Backend (.env)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000

# Frontend (.env)
VITE_API_URL=http://localhost:5000
```

4. **Start the application**
```bash
# Start backend server
cd backend
npm run dev

# Start frontend in new terminal
cd frontend
npm run dev
```

## 📦 Available Scripts

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend
```bash
npm run dev        # Start development server
npm run start      # Start production server
npm run test       # Run tests
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by Deepak
</div>
