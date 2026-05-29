import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, BookOpen, ListTodo, FileText, UserCheck, Bell, BarChart2, LogOut, User, Sparkles, Moon, Sun, ArrowLeft, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import api from '@/api/axios';
import logger from '@/utils/logger';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const features = [
  {
    title: "Class Schedule",
    description: "View your class timetable",
    icon: <CalendarDays className="h-8 w-8 text-blue-500" />,
    path: "/schedule",
    color: "from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950"
  },
  {
    title: "Assignments",
    description: "View assignments and deadlines",
    icon: <ListTodo className="h-8 w-8 text-amber-500" />,
    path: "/assignments",
    color: "from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950"
  },
  {
    title: "Study Notes",
    description: "Access study materials",
    icon: <FileText className="h-8 w-8 text-emerald-500" />,
    path: "/notes",
    color: "from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950"
  },
  {
    title: "Attendance",
    description: "View your attendance records",
    icon: <UserCheck className="h-8 w-8 text-purple-500" />,
    path: "/attendance",
    color: "from-purple-50 to-fuchsia-50 dark:from-purple-950 dark:to-fuchsia-950"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [academicStats, setAcademicStats] = useState({
    attendanceRate: 0,
    assignmentCompletion: 0,
    gpa: 0,
    totalCourses: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's schedules
      const scheduleResponse = await api.get('/api/schedule');
      const userSchedules = (scheduleResponse.data as any).schedules || [];
      setSchedules(userSchedules);

      // Generate upcoming events from schedules
      const events = generateUpcomingEvents(userSchedules);
      setUpcomingEvents(events);

      // Calculate academic stats
      const stats = await calculateAcademicStats(userSchedules);
      setAcademicStats(stats);

    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateUpcomingEvents = (schedules) => {
    const today = new Date();
    const events = [];

    schedules.forEach(schedule => {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const scheduleDay = daysOfWeek.indexOf(schedule.dayOfWeek);
      const currentDay = today.getDay();

      if (scheduleDay === currentDay) {
        events.push({
          title: schedule.className,
          time: schedule.startTime,
          date: 'Today',
          type: 'class'
        });
      } else if (scheduleDay === (currentDay + 1) % 7) {
        events.push({
          title: schedule.className,
          time: schedule.startTime,
          date: 'Tomorrow',
          type: 'class'
        });
      }
    });

    return events.slice(0, 3);
  };

  const calculateAcademicStats = async (schedules) => {
    try {
      // Fetch real academic data from backend using correct API endpoints
      const [attendanceResponse, assignmentsResponse] = await Promise.all([
        api.get('/api/analytics/attendance'),
        api.get('/api/analytics/assignments')
      ]);

      const attendanceData = (attendanceResponse.data as any)?.data || {};
      const assignmentData = (assignmentsResponse.data as any)?.data || {};

      // Fetch profile data for GPA
      let gpa = 0;
      try {
        const profileResponse = await api.get('/api/users/profile');
        gpa = (profileResponse.data as any)?.profile?.gpa || 0;
      } catch (e) {
        logger.error('Error fetching GPA:', e);
      }

      return {
        attendanceRate: attendanceData.attendancePercentage || 0,
        assignmentCompletion: assignmentData.submissionRate || 0,
        gpa: gpa,
        totalCourses: schedules.length
      };
    } catch (error) {
      logger.error('Error fetching academic stats:', error);
      // Fallback to zero values if backend endpoints don't exist
      return {
        attendanceRate: 0,
        assignmentCompletion: 0,
        gpa: 0,
        totalCourses: schedules.length
      };
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-10 sm:pb-0 space-y-6 px-6 py-8 md:px-10 md:py-12">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/student-dashboard')}>
            <Sparkles className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Student Dashboard
            </h2>
            <p className="text-muted-foreground dark:text-gray-400 text-sm sm:text-base">
              Welcome back, {user?.username || 'Student'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
                <User className="h-4 w-4 text-primary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicStats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Overall attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignment Completion</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicStats.assignmentCompletion}%</div>
            <p className="text-xs text-muted-foreground">Assignments submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPA</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicStats.gpa}</div>
            <p className="text-xs text-muted-foreground">Current GPA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicStats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Enrolled courses</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={item}>
              <Card
                className={`cursor-pointer hover:shadow-md transition-all duration-300 bg-gradient-to-br ${feature.color} border-none overflow-hidden relative h-full`}
                onClick={() => navigate(feature.path)}
              >
                <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/20 dark:bg-white/10 blur-2xl"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{feature.title}</CardTitle>
                  <div className="rounded-full p-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm">
                    {feature.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-black/60 dark:text-white/70">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Upcoming Classes
            </CardTitle>
            <CardDescription>Your upcoming classes for today and tomorrow</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                      <div>
                        <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1"></div>
                        <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-400">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.time} • {event.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming classes</p>
                <p className="text-sm">Your schedule will appear here once classes are added</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
