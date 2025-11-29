import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, BookOpen, ListTodo, FileText, UserCheck, Bell, BarChart2, LogOut, Users, Settings, Database, Shield, Sparkles, User } from "lucide-react";
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
    title: "User Management",
    description: "Manage all users and roles",
    icon: <Users className="h-8 w-8 text-blue-500" />,
    path: "/users",
    color: "from-blue-50 to-indigo-50"
  },
  {
    title: "System Settings",
    description: "Configure platform settings",
    icon: <Settings className="h-8 w-8 text-amber-500" />,
    path: "/settings",
    color: "from-amber-50 to-yellow-50"
  },
  {
    title: "Database Management",
    description: "Manage system data and backups",
    icon: <Database className="h-8 w-8 text-emerald-500" />,
    path: "/database",
    color: "from-emerald-50 to-teal-50"
  },
  {
    title: "Security",
    description: "Manage security and permissions",
    icon: <Shield className="h-8 w-8 text-purple-500" />,
    path: "/security",
    color: "from-purple-50 to-fuchsia-50"
  },
  {
    title: "Academic Overview",
    description: "View all academic activities",
    icon: <BookOpen className="h-8 w-8 text-cyan-500" />,
    path: "/academic",
    color: "from-cyan-50 to-sky-50"
  },
  {
    title: "Reports",
    description: "Generate system reports",
    icon: <BarChart2 className="h-8 w-8 text-rose-500" />,
    path: "/reports",
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    systemHealth: 0,
    storageUsed: 0,
    currentSemester: 'Spring 2024'
  });

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      // Fetch system statistics
      const stats = await calculateSystemStats();
      setSystemStats(stats);
      
    } catch (error) {
      console.error('Error fetching system data:', error);
      toast({
        title: "Error",
        description: "Failed to load system data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSystemStats = async () => {
    // Mock system stats - in real app, these would come from admin endpoints
    return {
      totalUsers: Math.floor(Math.random() * 500) + 200,
      totalStudents: Math.floor(Math.random() * 400) + 150,
      totalTeachers: Math.floor(Math.random() * 50) + 20,
      totalClasses: Math.floor(Math.random() * 100) + 50,
      systemHealth: Math.floor(Math.random() * 20) + 80,
      storageUsed: Math.floor(Math.random() * 30) + 40,
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
              onClick={() => navigate('/admin-dashboard')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary" />
            </button>
            <div className="text-xl md:text-2xl font-bold">
              Admin Dashboard - <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">{user?.username || 'Administrator'}</span>
            </div>
            <p className="text-sm text-muted-foreground hidden md:block">College Administration Panel</p>
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
              Complete platform management and administration.
            </h2>
          </div>

          {/* System Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">All registered users</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Active students</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalTeachers}</div>
                <p className="text-xs text-muted-foreground">Active teachers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalClasses}</div>
                <p className="text-xs text-muted-foreground">Scheduled classes</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  System Overview
                </CardTitle>
                <CardDescription>Platform health and resource usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">System Health</span>
                    <span className="text-sm text-muted-foreground">{systemStats.systemHealth}%</span>
                  </div>
                  <Progress value={systemStats.systemHealth} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <span className="text-sm text-muted-foreground">{systemStats.storageUsed}%</span>
                  </div>
                  <Progress value={systemStats.storageUsed} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Server Load</span>
                    <span className="text-sm text-muted-foreground">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Database Performance</span>
                    <span className="text-sm text-muted-foreground">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Status
                </CardTitle>
                <CardDescription>System security overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Firewall</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SSL Certificate</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Backup</span>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Sessions</span>
                  <span className="text-sm text-muted-foreground">{Math.floor(Math.random() * 50) + 10}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Administration Tools</h3>
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

export default AdminDashboard;
