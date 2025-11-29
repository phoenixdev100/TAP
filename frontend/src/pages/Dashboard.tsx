import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, BookOpen, ListTodo, FileText, UserCheck, Clock, Bell, BarChart2, Bookmark, Users, BookOpenCheck, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/components/ui/use-toast';
import api from '@/api/axios';

const features = [
  {
    title: "Class Schedule",
    description: "View and manage your class timetable",
    icon: <CalendarDays className="h-8 w-8 text-blue-500" />,
    path: "/schedule",
    color: "from-blue-50 to-indigo-50"
  },
  {
    title: "Assignments",
    description: "Track deadlines and upcoming exams",
    icon: <ListTodo className="h-8 w-8 text-amber-500" />,
    path: "/assignments",
    color: "from-amber-50 to-yellow-50"
  },
  {
    title: "Study Notes",
    description: "Access and share class materials",
    icon: <FileText className="h-8 w-8 text-emerald-500" />,
    path: "/notes",
    color: "from-emerald-50 to-teal-50"
  },
  {
    title: "Attendance",
    description: "Track and manage your class attendance",
    icon: <UserCheck className="h-8 w-8 text-purple-500" />,
    path: "/attendance",
    color: "from-purple-50 to-fuchsia-50"
  },
  {
    title: "Resources",
    description: "Access learning materials and resources",
    icon: <BookOpenCheck className="h-8 w-8 text-cyan-500" />,
    path: "/resources",
    color: "from-cyan-50 to-sky-50"
  },
  {
    title: "GPA Calculator",
    description: "Calculate your semester GPA",
    icon: <BookOpen className="h-8 w-8 text-rose-500" />,
    path: "/gpa-calculator",
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [academicStats, setAcademicStats] = useState({
    attendanceRate: 0,
    assignmentCompletion: 0,
    studyTime: 0,
    gpa: 0,
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
      
      // Generate recent activities based on user data
      const activities = generateRecentActivities(userSchedules);
      setRecentActivities(activities);
      
      // Calculate academic stats (mock data since no dedicated endpoint)
      const stats = calculateAcademicStats(userSchedules);
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
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const events = [];
    
    // Add upcoming classes from schedules
    schedules.forEach(schedule => {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const scheduleDay = daysOfWeek.indexOf(schedule.dayOfWeek);
      const currentDay = today.getDay();
      
      if (scheduleDay === currentDay) {
        events.push({
          title: schedule.className,
          time: schedule.startTime,
          date: 'Today',
          type: 'class',
          location: schedule.location
        });
      } else if (scheduleDay === (currentDay + 1) % 7) {
        events.push({
          title: schedule.className,
          time: schedule.startTime,
          date: 'Tomorrow',
          type: 'class',
          location: schedule.location
        });
      }
    });
    
    return events.slice(0, 3); // Limit to 3 events
  };

  const generateRecentActivities = (schedules) => {
    const activities = [];
    
    if (schedules.length > 0) {
      const latestSchedule = schedules[schedules.length - 1];
      activities.push({
        title: `Added ${latestSchedule.className}`,
        time: 'Recently',
        icon: <CalendarDays className="h-4 w-4" />
      });
    }
    
    if (schedules.length > 0) {
      activities.push({
        title: 'Updated Schedule',
        time: 'Today',
        icon: <CalendarDays className="h-4 w-4" />
      });
    }
    
    activities.push({
      title: 'Logged In',
      time: 'Just now',
      icon: <UserCheck className="h-4 w-4" />
    });
    
    return activities.slice(0, 3);
  };

  const calculateAcademicStats = (schedules) => {
    // Mock calculations since we don't have dedicated endpoints
    // In a real app, these would come from the backend
    return {
      attendanceRate: Math.min(95, 85 + schedules.length * 2),
      assignmentCompletion: Math.min(90, 75 + schedules.length * 3),
      studyTime: Math.min(20, 10 + schedules.length),
      gpa: parseFloat((3.5 + schedules.length * 0.1).toFixed(1)),
      currentSemester: 'Spring 2024'
    };
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.clear(); // Clear all localStorage data
    sessionStorage.clear(); // Clear all sessionStorage data
    
    // Show success message
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    
    // Force a complete page reload and redirect
    window.location.replace('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50">
      <header className="px-6 py-4 md:py-6 md:px-10">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome, <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">{user.username || 'User'}</span>
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 md:px-10 md:py-12">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl text-muted-foreground">
                Here's an overview of your academic tools and resources.
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{academicStats.currentSemester}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <BarChart2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">GPA: {academicStats.gpa}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Your upcoming classes, exams, and assignments</CardDescription>
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
                          <div className={`p-2 rounded-full ${
                            event.type === 'exam' ? 'bg-red-100 text-red-500' :
                            event.type === 'assignment' ? 'bg-amber-100 text-amber-500' :
                            'bg-blue-100 text-blue-500'
                          }`}>
                            {event.type === 'exam' ? <BookOpen className="h-4 w-4" /> :
                             event.type === 'assignment' ? <ListTodo className="h-4 w-4" /> :
                             <CalendarDays className="h-4 w-4" />}
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
                    <p>No upcoming events</p>
                    <p className="text-sm">Add your class schedule to see upcoming events</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                        <div>
                          <div className="h-4 w-24 bg-muted rounded animate-pulse mb-1"></div>
                          <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          {activity.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" />
                Academic Progress
              </CardTitle>
              <CardDescription>Your current semester performance</CardDescription>
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
      </main>
    </div>
  );
};

export default Dashboard;
