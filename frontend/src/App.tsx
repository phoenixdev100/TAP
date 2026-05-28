import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Schedule from "./pages/Schedule";
import Assignments from "./pages/Assignments";
import Notes from "./pages/Notes";
import Attendance from "./pages/Attendance";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import AuthCheck from "./components/AuthCheck";
import { TooltipProvider } from "@/components/ui/tooltip";
import GPACalculator from "./pages/GPACalculator";
import Profile from "./pages/Profile";
import AuthProvider from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import ClassManagement from "./pages/admin/ClassManagement";
import TeacherManagement from "./pages/admin/TeacherManagement";
import StudentManagement from "./pages/admin/StudentManagement";
import AttendanceManagement from "./pages/admin/AttendanceManagement";
import TimetableManagement from "./pages/admin/TimetableManagement";
import NotesManagement from "./pages/admin/NotesManagement";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <AuthCheck>{children}</AuthCheck>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <TooltipProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Student Routes */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Teacher Routes */}
            <Route
              path="/teacher-dashboard"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute requiredRole="college_admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute requiredRole="college_admin">
                  <ClassManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute requiredRole="college_admin">
                  <TeacherManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute requiredRole="college_admin">
                  <StudentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <ProtectedRoute requiredRole="college_admin">
                  <AttendanceManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/timetable"
              element={
                <ProtectedRoute requiredRole="college_admin">
                  <TimetableManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notes"
              element={
                <ProtectedRoute requiredRole="college_admin">
                  <NotesManagement />
                </ProtectedRoute>
              }
            />
            
            {/* Protected Routes with RBAC */}
            <Route
              path="/schedule"
              element={
                <ProtectedRoute resource="schedule">
                  <Layout>
                    <Schedule />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments"
              element={
                <ProtectedRoute resource="assignments">
                  <Layout>
                    <Assignments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <ProtectedRoute resource="notes">
                  <Layout>
                    <Notes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute resource="attendance">
                  <Layout>
                    <Attendance />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/gpa-calculator"
              element={
                <ProtectedRoute resource="gpa-calculator">
                  <Layout>
                    <GPACalculator />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Legacy Dashboard Route - Redirect based on role */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
