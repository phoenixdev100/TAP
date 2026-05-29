import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, CalendarDays, ListTodo, FileText, UserCheck, Sparkles, Moon, Sun, GraduationCap, Award, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>('college_admin');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signup, user, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Redirect logged-in users to their appropriate dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigateToDashboard(user.role);
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (activeTab === 'signup') {
      if (!name.trim()) {
        newErrors.name = "Name is required";
      } else if (name.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
        toast({
          title: "Login successful",
          description: "Welcome back!",
          duration: 5000,
        });
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        navigateToDashboard(user.role);
      } else {
        await signup(name, email, password, role);
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
          duration: 5000,
        });
        navigateToDashboard(role);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Authentication failed';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      if (error.response?.data?.field) {
        setErrors({ [error.response.data.field]: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDashboard = (userRole: UserRole) => {
    switch (userRole) {
      case 'student':
        navigate('/student-dashboard');
        break;
      case 'teacher':
        navigate('/teacher-dashboard');
        break;
      case 'college_admin':
        navigate('/admin-dashboard');
        break;
      default:
        navigate('/student-dashboard');
    }
  };

  const features = [
    {
      title: "Class Schedule",
      description: "Manage your classes and lectures efficiently",
      icon: <CalendarDays className="h-6 w-6" />,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-50 dark:bg-violet-950/30"
    },
    {
      title: "Assignments",
      description: "Track deadlines and submit work on time",
      icon: <ListTodo className="h-6 w-6" />,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30"
    },
    {
      title: "Study Notes",
      description: "Organize and share study materials",
      icon: <FileText className="h-6 w-6" />,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      title: "Attendance",
      description: "Monitor and track attendance records",
      icon: <UserCheck className="h-6 w-6" />,
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/30"
    },
  ];

  const stats = [
    { icon: <Users className="h-5 w-5" />, label: "Active Users", value: "10K+" },
    { icon: <BookOpen className="h-5 w-5" />, label: "Courses", value: "500+" },
    { icon: <Award className="h-5 w-5" />, label: "Assignments", value: "50K+" },
    { icon: <TrendingUp className="h-5 w-5" />, label: "Success Rate", value: "95%" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-rose-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 relative z-10">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              TAP
            </h1>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={toggleTheme}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            {theme === 'light' ? <Moon className="h-4 w-4 text-violet-600" /> : <Sun className="h-4 w-4 text-amber-400" />}
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 relative z-10 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 lg:mb-16">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-4 sm:space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-violet-100 dark:bg-violet-900/30 rounded-full text-violet-700 dark:text-violet-300 text-xs sm:text-sm font-medium"
              >
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Your Ultimate College Companion</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight"
              >
                Transform Your
                <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-1 sm:mt-2">
                  College Experience
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed"
              >
                Manage classes, track assignments, organize notes, and monitor attendance—all in one powerful platform designed for academic success.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2 sm:pt-4"
              >
                {stats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                      <div className="h-4 w-4 sm:h-5 sm:w-5">{stat.icon}</div>
                    </div>
                    <div>
                      <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{stat.value}</p>
                      <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Auth Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="max-w-md mx-auto lg:mx-0 w-full"
            >
              <Card className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/20 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-violet-400/30 to-purple-500/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl"></div>

                <CardHeader className="relative pb-3 sm:pb-4 px-4 sm:px-6">
                  <div className="flex gap-1 sm:gap-2 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                    <button
                      onClick={() => setActiveTab('login')}
                      className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 ${activeTab === 'login'
                        ? 'bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setActiveTab('signup')}
                      className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 ${activeTab === 'signup'
                        ? 'bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                      Sign Up
                    </button>
                  </div>
                  <CardTitle className="mt-4 sm:mt-6 text-xl sm:text-2xl text-slate-900 dark:text-white">
                    {activeTab === 'login' ? 'Welcome back!' : 'Create an account'}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                    {activeTab === 'login'
                      ? 'Enter your credentials to access your account'
                      : 'Fill out the form below to get started'}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleAuth}>
                  <CardContent className="space-y-3 sm:space-y-4 relative px-4 sm:px-6 pt-2">
                    {activeTab === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`h-10 sm:h-11 text-xs sm:text-sm ${errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-violet-500'} bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600`}
                          disabled={isLoading}
                        />
                        {errors.name && <p className="text-xs sm:text-sm text-red-500">{errors.name}</p>}
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: activeTab === 'signup' ? 0.1 : 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`h-10 sm:h-11 text-xs sm:text-sm ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-violet-500'} bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600`}
                        disabled={isLoading}
                      />
                      {errors.email && <p className="text-xs sm:text-sm text-red-500">{errors.email}</p>}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: activeTab === 'signup' ? 0.2 : 0.1 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`h-10 sm:h-11 text-xs sm:text-sm ${errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-violet-500'} bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600`}
                        disabled={isLoading}
                      />
                      {errors.password && <p className="text-xs sm:text-sm text-red-500">{errors.password}</p>}
                    </motion.div>
                    {activeTab === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="role" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                          Role
                        </Label>
                        <Select value={role} onValueChange={(value) => setRole(value as UserRole)} disabled={isLoading}>
                          <SelectTrigger className="h-10 sm:h-11 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="college_admin">College Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                          Full platform management and administration
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col pt-3 sm:pt-4 px-4 sm:px-6">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 h-10 sm:h-11 text-xs sm:text-sm font-medium shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {activeTab === 'login' ? 'Logging in...' : 'Creating account...'}
                        </div>
                      ) : (
                        activeTab === 'login' ? 'Login' : 'Sign Up'
                      )}
                    </Button>
                    {activeTab === 'login' && (
                      <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab('signup')}
                          className="text-violet-600 dark:text-violet-400 font-medium hover:underline transition-colors"
                        >
                          Sign up
                        </button>
                      </p>
                    )}
                    {activeTab === 'signup' && (
                      <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab('login')}
                          className="text-violet-600 dark:text-violet-400 font-medium hover:underline transition-colors"
                        >
                          Login
                        </button>
                      </p>
                    )}
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${feature.bgColor} dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <div className="text-white scale-75 sm:scale-100">{feature.icon}</div>
                </div>
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white mb-1.5 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
