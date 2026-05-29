import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { BookOpen, CalendarDays, ListTodo, FileText, UserCheck, Sparkles, Moon, Sun } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>('student');
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

  // Mock user data - in a real app, this would come from a backend
  const mockUsers = [
    { email: "test@example.com", password: "password123", name: "Test User" }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (activeTab === 'signup') {
      if (!name.trim()) {
        newErrors.name = "Name is required";
      } else if (name.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      } else if (name.length > 50) {
        newErrors.name = "Name must be less than 50 characters";
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
    } else if (password.length > 128) {
      newErrors.password = "Password must be less than 128 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
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
          duration: 5000, // Auto-dismiss after 5 seconds
        });
        // Navigate based on user role
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        navigateToDashboard(user.role);
      } else {
        await signup(name, email, password, role);
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
          duration: 5000, // Auto-dismiss after 5 seconds
        });
        navigateToDashboard(role);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Authentication failed';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000, // Auto-dismiss after 5 seconds
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
      description: "Manage your classes and lectures",
      icon: <CalendarDays className="h-8 w-8" />,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-50 dark:bg-violet-950/30"
    },
    {
      title: "Assignments",
      description: "Track deadlines and submissions",
      icon: <ListTodo className="h-8 w-8" />,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30"
    },
    {
      title: "Study Notes",
      description: "Organize and share study materials",
      icon: <FileText className="h-8 w-8" />,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      title: "Attendance",
      description: "Track your attendance records",
      icon: <UserCheck className="h-8 w-8" />,
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/30"
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, they will be redirected by useEffect
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 relative overflow-hidden">
      {/* Modern animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-rose-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[size:32px_32px] pointer-events-none"></div>

      <header className="px-0.5 sm:px-4 md:px-6 lg:px-8 py-0.5 sm:py-4 md:py-6 lg:py-8 relative z-10">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-3 h-3 sm:w-8 sm:h-8 md:w-10 md:h-12 rounded-sm sm:rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="h-1.5 w-1.5 sm:h-4 sm:w-4 md:h-5 md:w-6 text-white" />
            </div>
            <h1 className="text-xs sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              TAP
            </h1>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={toggleTheme}
            className="flex items-center gap-0.5 sm:gap-2 px-0.5 py-0.5 sm:px-3 sm:py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="h-1.5 w-1.5 sm:h-4 sm:w-4 text-violet-600" /> : <Sun className="h-1.5 w-1.5 sm:h-4 sm:w-4 text-amber-400" />}
          </motion.button>
        </div>
      </header>

      <main className="w-full px-0.5 sm:px-4 md:px-6 lg:px-8 py-0.5 sm:py-6 md:py-8 lg:py-12 relative z-10 min-h-[calc(100vh-40px)] flex items-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0.5 sm:gap-4 md:gap-6 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col space-y-0.5 sm:space-y-4 md:space-y-6 lg:space-y-8"
          >
            <div className="space-y-0.5 sm:space-y-3 md:space-y-4 lg:space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-0.5 sm:gap-1.5 md:gap-2 px-0.5 py-0.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-violet-100 dark:bg-violet-900/30 rounded-full text-violet-700 dark:text-violet-300 text-[5px] sm:text-xs md:text-sm font-medium"
              >
                <Sparkles className="h-1 w-1 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                <span className="text-[5px] sm:text-xs md:text-sm">Your Ultimate College Companion</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-sm sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight"
              >
                Transform Your
                <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                  College Experience
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-[7px] sm:text-sm md:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed"
              >
                Manage classes, track assignments, organize notes, and monitor attendance—all in one powerful platform designed for academic success.
              </motion.p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-0.5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5"
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`p-0.5 sm:p-3 md:p-4 lg:p-5 rounded-sm sm:rounded-xl lg:rounded-2xl ${feature.bgColor} dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group`}
                >
                  <div className={`w-4 h-4 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-sm sm:rounded-lg md:rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-0.5 sm:mb-2 md:mb-3 lg:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="text-white scale-25 sm:scale-75 md:scale-100">{feature.icon}</div>
                  </div>
                  <h3 className="font-semibold text-[5px] sm:text-xs md:text-sm lg:text-base text-slate-900 dark:text-white mb-0.5 sm:mb-1 md:mb-2">{feature.title}</h3>
                  <p className="text-[4px] sm:text-[10px] md:text-xs lg:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="w-full max-w-[100vw] sm:max-w-[220px] md:max-w-sm lg:max-w-md mx-auto lg:max-w-none"
          >
            <Card className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/20 relative overflow-hidden">
              {/* Decorative gradient blobs */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-violet-400/30 to-purple-500/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl"></div>

              <CardHeader className="relative pb-0.5 sm:pb-3 md:pb-4 lg:pb-6 px-1 sm:px-4 md:px-6 lg:px-8">
                <div className="flex gap-0.5 sm:gap-1 md:gap-2 p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-700/50 rounded-sm sm:rounded-lg md:rounded-xl">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-0.5 sm:py-2 md:py-2.5 lg:py-3 px-0.5 sm:px-3 md:px-4 rounded-sm sm:rounded-md md:rounded-lg font-medium text-[5px] sm:text-xs md:text-sm lg:text-base transition-all duration-300 ${activeTab === 'login'
                      ? 'bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`flex-1 py-0.5 sm:py-2 md:py-2.5 lg:py-3 px-0.5 sm:px-3 md:px-4 rounded-sm sm:rounded-md md:rounded-lg font-medium text-[5px] sm:text-xs md:text-sm lg:text-base transition-all duration-300 ${activeTab === 'signup'
                      ? 'bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                  >
                    Sign Up
                  </button>
                </div>
                <CardTitle className="mt-1 sm:mt-4 md:mt-6 lg:mt-8 text-xs sm:text-xl md:text-2xl lg:text-3xl text-slate-900 dark:text-white">
                  {activeTab === 'login' ? 'Welcome back!' : 'Create an account'}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-[5px] sm:text-xs md:text-sm lg:text-base">
                  {activeTab === 'login'
                    ? 'Enter your credentials to access your account'
                    : 'Fill out the form below to get started'}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleAuth}>
                <CardContent className="space-y-0.5 sm:space-y-3 md:space-y-4 lg:space-y-5 relative px-1 sm:px-4 md:px-6 lg:px-8 pt-0.5 sm:pt-2 md:pt-4">
                  {activeTab === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <label htmlFor="name" className="text-[5px] sm:text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`h-5 sm:h-9 md:h-10 lg:h-11 xl:h-12 text-[5px] sm:text-xs md:text-sm ${errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-violet-500'} bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600`}
                        disabled={isLoading}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: activeTab === 'signup' ? 0.1 : 0 }}
                    className="space-y-2"
                  >
                    <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`h-11 sm:h-12 text-sm sm:text-base ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-violet-500'} bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600`}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: activeTab === 'signup' ? 0.2 : 0.1 }}
                    className="space-y-2"
                  >
                    <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`h-11 sm:h-12 text-sm sm:text-base ${errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-violet-500'} bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600`}
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </motion.div>
                  {activeTab === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="space-y-2"
                    >
                      <label htmlFor="role" className="text-[5px] sm:text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">
                        Role
                      </label>
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full px-0.5 sm:px-3 md:px-4 py-0.5 sm:py-2 md:py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-sm sm:rounded-md md:rounded-lg text-[5px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 text-slate-900 dark:text-white h-5 sm:h-9 md:h-10 lg:h-11 xl:h-12"
                        disabled={isLoading}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="college_admin">College Administrator</option>
                      </select>
                      <p className="text-[4px] sm:text-[10px] md:text-xs lg:text-sm text-slate-600 dark:text-slate-400">
                        {role === 'student' && 'View your classes, assignments, and attendance'}
                        {role === 'teacher' && 'Manage classes, assignments, and track student progress'}
                        {role === 'college_admin' && 'Full platform management and administration'}
                      </p>
                    </motion.div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col pt-0.5 sm:pt-3 md:pt-4 lg:pt-6 px-1 sm:px-4 md:px-6 lg:px-8">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 h-5 sm:h-9 md:h-10 lg:h-11 xl:h-12 text-[5px] sm:text-xs md:text-sm lg:text-base font-medium shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
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
                    <p className="mt-0.5 sm:mt-3 md:mt-4 text-[5px] sm:text-xs md:text-sm text-center text-slate-600 dark:text-slate-400">
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
                    <p className="mt-0.5 sm:mt-3 md:mt-4 text-[5px] sm:text-xs md:text-sm text-center text-slate-600 dark:text-slate-400">
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
      </main>
    </div>
  );
};

export default HomePage;
