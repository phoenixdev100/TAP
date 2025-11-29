import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, BookOpen, ListTodo, FileText, UserCheck, Bell, BarChart2, LogOut, Users, Settings, Sparkles, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';
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
    title: "Manage Schedule",
    description: "Create and manage class schedules",
    icon: <CalendarDays className="h-8 w-8 text-blue-500" />,
    path: "/schedule",
    color: "from-blue-50 to-indigo-50"
  },
  {
    title: "Assignments",
    description: "Create and grade assignments",
    icon: <ListTodo className="h-8 w-8 text-amber-500" />,
    path: "/assignments",
    color: "from-amber-50 to-yellow-50"
  },
  {
    title: "Study Materials",
    description: "Upload and manage study notes",
    icon: <FileText className="h-8 w-8 text-emerald-500" />,
    path: "/notes",
    color: "from-emerald-50 to-teal-50"
  },
  {
    title: "Attendance",
    description: "Track student attendance",
    icon: <UserCheck className="h-8 w-8 text-purple-500" />,
    path: "/attendance",
    color: "from-purple-50 to-fuchsia-50"
  },
  {
    title: "Student Management",
    description: "View and manage student data",
    icon: <Users className="h-8 w-8 text-cyan-500" />,
    path: "/students",
    color: "from-cyan-50 to-sky-50"
  },
  {
    title: "Settings",
    description: "Manage your teaching preferences",
    icon: <Settings className="h-8 w-8 text-rose-500" />,
    path: "/settings",
    color: "from-rose-50 to-pink-50"
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

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [teacherStats, setTeacherStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    avgAttendance: 0,
    pendingAssignments: 0,
    currentSemester: 'Spring 2024'
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
      
      // Calculate teacher stats
      const stats = calculateTeacherStats(userSchedules);
      setTeacherStats(stats);
      
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
          title: `Teach ${schedule.className}`,
          time: schedule.startTime,
          date: 'Today',
          type: 'class'
        });
      } else if (scheduleDay === (currentDay + 1) % 7) {
        events.push({
          title: `Teach ${schedule.className}`,
          time: schedule.startTime,
          date: 'Tomorrow',
          type: 'class'
        });
      }
    });
    
    return events.slice(0, 3);
  };

  const calculateTeacherStats = (schedules) => {
    return {
      totalStudents: Math.floor(Math.random() * 50) + 20, // Mock data
      totalClasses: schedules.length,
      avgAttendance: Math.min(95, 80 + schedules.length * 3),
      pendingAssignments: Math.floor(Math.random() * 10) + 5,
      currentSemester: 'Spring 2024'
    };
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50">
      <header className="px-6 py-4 md:py-6 md:px-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teacher-dashboard')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary" />
            </button>
            <div className="text-xl md:text-2xl font-bold">
              Teacher Dashboard - <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">{user?.username || 'Teacher'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  <span>GPA: 3.5</span>
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

      <main className="container mx-auto px-6 py-8 md:px-10 md:py-12">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl text-muted-foreground mb-4">
              Manage your classes, students, and track teaching progress.
            </h2>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teacherStats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Active this semester</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classes Teaching</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teacherStats.totalClasses}</div>
                <p className="text-xs text-muted-foreground">This semester</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teacherStats.avgAttendance}%</div>
                <p className="text-xs text-muted-foreground">Across all classes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teacherStats.pendingAssignments}</div>
                <p className="text-xs text-muted-foreground">Assignments to grade</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Teaching Schedule
                </CardTitle>
                <CardDescription>Your upcoming classes and teaching sessions</CardDescription>
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
                          <div className="p-2 rounded-full bg-blue-100 text-blue-500">
                            <CalendarDays className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.time} • {event.date}</p>
                          </div>
                        </div>
                        <button className="text-sm text-primary hover:underline">View Details</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No upcoming classes</p>
                    <p className="text-sm">Add your teaching schedule to see upcoming classes</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Teaching Analytics
                </CardTitle>
                <CardDescription>Your teaching performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Class Attendance</span>
                    <span className="text-sm text-muted-foreground">{teacherStats.avgAttendance}%</span>
                  </div>
                  <Progress value={teacherStats.avgAttendance} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Assignment Grading</span>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Student Engagement</span>
                    <span className="text-sm text-muted-foreground">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Management Tools</h3>
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
                    <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/20 blur-2xl"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">{feature.title}</CardTitle>
                      <div className="rounded-full p-2 bg-white/50 backdrop-blur-sm">
                        {feature.icon}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-black/60">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
