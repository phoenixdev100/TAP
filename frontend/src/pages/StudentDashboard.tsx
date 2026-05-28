import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, BookOpen, ListTodo, FileText, UserCheck, Bell, BarChart2, LogOut, User, Sparkles, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import api from '@/api/axios';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
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
    studyTime: 0,
    gpa: 0,
    currentSemester: 'Spring 2024'
  });

  // Chart data
  const gradeTrendData = [
    { month: 'Jan', grade: 7.5 },
    { month: 'Feb', grade: 8.0 },
    { month: 'Mar', grade: 8.2 },
    { month: 'Apr', grade: 8.5 },
    { month: 'May', grade: 8.8 },
    { month: 'Jun', grade: 9.0 },
  ];

  const subjectBreakdownData = [
    { name: 'Mathematics', value: 30, color: '#8884d8' },
    { name: 'Physics', value: 25, color: '#82ca9d' },
    { name: 'Chemistry', value: 20, color: '#ffc658' },
    { name: 'English', value: 15, color: '#ff7300' },
    { name: 'Computer Science', value: 10, color: '#0088fe' },
  ];

  const weeklyActivityData = [
    { day: 'Mon', hours: 4 },
    { day: 'Tue', hours: 5 },
    { day: 'Wed', hours: 3 },
    { day: 'Thu', hours: 6 },
    { day: 'Fri', hours: 4 },
    { day: 'Sat', hours: 2 },
    { day: 'Sun', hours: 1 },
  ];

  const chartConfig = {
    grade: {
      label: 'GPA',
      color: '#8884d8',
    },
  };

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
      console.error('Error fetching dashboard data:', error);
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
      
      return {
        attendanceRate: attendanceData.attendancePercentage || 0,
        assignmentCompletion: assignmentData.submissionRate || 0,
        studyTime: 0, // This would need a dedicated endpoint
        gpa: assignmentData.averageMarks ? parseFloat((assignmentData.averageMarks / 10).toFixed(1)) : 0,
        currentSemester: 'Spring 2024'
      };
    } catch (error) {
      console.error('Error fetching academic stats:', error);
      // Fallback to zero values if backend endpoints don't exist
      return {
        attendanceRate: 0,
        assignmentCompletion: 0,
        studyTime: 0,
        gpa: 0,
        currentSemester: 'Spring 2024'
      };
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const calculateGPA = () => {
    // Calculate GPA based on assignment completion and attendance
    const assignmentCompletion = academicStats.assignmentCompletion || 0;
    const attendanceRate = academicStats.attendanceRate || 0;
    
    // Use existing GPA if available, otherwise calculate based on performance metrics
    if (academicStats.gpa) {
      // Convert existing GPA to 1-10 scale if it's in 1-4 scale
      const existingGPA = academicStats.gpa;
      if (existingGPA <= 4) {
        return (existingGPA * 2.5).toFixed(1);
      }
      return existingGPA.toFixed(1);
    }
    
    // Calculate GPA based on assignment completion and attendance
    const performanceScore = (assignmentCompletion * 0.7 + attendanceRate * 0.3);
    
    // Convert percentage to GPA scale (1-10)
    if (performanceScore >= 95) return '10.0';
    if (performanceScore >= 90) return '9.5';
    if (performanceScore >= 85) return '9.0';
    if (performanceScore >= 80) return '8.5';
    if (performanceScore >= 75) return '8.0';
    if (performanceScore >= 70) return '7.5';
    if (performanceScore >= 65) return '7.0';
    if (performanceScore >= 60) return '6.5';
    if (performanceScore >= 55) return '6.0';
    if (performanceScore >= 50) return '5.5';
    if (performanceScore >= 45) return '5.0';
    if (performanceScore >= 40) return '4.5';
    if (performanceScore >= 35) return '4.0';
    if (performanceScore >= 30) return '3.5';
    if (performanceScore >= 25) return '3.0';
    if (performanceScore >= 20) return '2.5';
    if (performanceScore >= 15) return '2.0';
    if (performanceScore >= 10) return '1.5';
    return '1.0';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50 dark:to-slate-900">
      <header className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-4 md:py-6">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/student-dashboard')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary" />
            </button>
            <div className="text-xl md:text-2xl font-bold">
              Welcome, <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">{user?.username || 'Student'}</span>
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
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-8 lg:py-12">
        <div className="space-y-6 max-w-full">
          <div>
            <h2 className="text-xl text-muted-foreground mb-4">
              Here's an overview of your academic progress and upcoming activities.
            </h2>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2 lg:col-span-2">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Your Progress
                </CardTitle>
                <CardDescription>Your academic performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Attendance Rate</span>
                    <span className="text-sm text-muted-foreground">{academicStats.attendanceRate}%</span>
                  </div>
                  <Progress value={academicStats.attendanceRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Assignment Completion</span>
                    <span className="text-sm text-muted-foreground">{academicStats.assignmentCompletion}%</span>
                  </div>
                  <Progress value={academicStats.assignmentCompletion} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Study Time</span>
                    <span className="text-sm text-muted-foreground">{academicStats.studyTime} hours this week</span>
                  </div>
                  <Progress value={(academicStats.studyTime / 20) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
            <motion.div 
              className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
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

          <div>
            <h3 className="text-xl font-semibold mb-4">Academic Performance</h3>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    Grade Trend
                  </CardTitle>
                  <CardDescription>Your GPA over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <LineChart data={gradeTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" domain={[0, 10]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="grade" stroke="#8884d8" strokeWidth={2} dot={{ fill: '#8884d8' }} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Subject Breakdown
                  </CardTitle>
                  <CardDescription>Time distribution by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subjectBreakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {subjectBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Weekly Activity</h3>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Study Hours This Week
                </CardTitle>
                <CardDescription>Your daily study time distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="hours" stroke="#82ca9d" strokeWidth={2} dot={{ fill: '#82ca9d' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
