import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getAccessMessage = () => {
    if (!user) return 'Please log in to access this page.';
    
    switch (user.role) {
      case 'student':
        return 'As a student, you have read-only access to view your schedule, assignments, and attendance.';
      case 'teacher':
        return 'As a teacher, you can manage schedules, assignments, and track student progress.';
      case 'college_admin':
        return 'As a college administrator, you should have access to all platform features.';
      default:
        return 'You do not have sufficient permissions to access this page.';
    }
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'student':
        return '/student-dashboard';
      case 'teacher':
        return '/teacher-dashboard';
      case 'college_admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {getAccessMessage()}
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate(getDashboardRoute())}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
