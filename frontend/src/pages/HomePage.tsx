import React, { useState } from "react";
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
import { BookOpen, CalendarDays, ListTodo, FileText, UserCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock user data - in a real app, this would come from a backend
  const mockUsers = [
    { email: "test@example.com", password: "password123", name: "Test User" }
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (activeTab === 'signup') {
      if (!name.trim()) {
        newErrors.name = "Name is required";
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

    setIsLoading(true);
    setErrors({});

    try {
      if (activeTab === 'login') {
        const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
          email,
          password
        });

        if (response.data.success) {
          localStorage.setItem('token', response.data.token || '');
          localStorage.setItem('user', JSON.stringify(response.data.user));
          toast({
            title: "Success",
            description: response.data.message,
          });
          navigate("/dashboard");
        }
      } else {
        const response = await axios.post<AuthResponse>(`${API_URL}/signup`, {
          username: name,
          email,
          password
        });

        if (response.data.success) {
          localStorage.setItem('token', response.data.token || '');
          localStorage.setItem('user', JSON.stringify(response.data.user));
          toast({
            title: "Success",
            description: response.data.message,
          });
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      // Show error message immediately
      const errorMessage = error.response?.data?.message || "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Clear form on login error
      if (activeTab === 'login') {
        setPassword('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      title: "Class Schedule",
      description: "Manage your classes and lectures",
      icon: <CalendarDays className="h-12 w-12 text-indigo-400" />,
      color: "from-indigo-50 to-blue-50"
    },
    {
      title: "Assignments",
      description: "Track deadlines and submissions",
      icon: <ListTodo className="h-12 w-12 text-amber-400" />,
      color: "from-amber-50 to-orange-50"
    },
    {
      title: "Study Notes",
      description: "Organize and share study materials",
      icon: <FileText className="h-12 w-12 text-emerald-400" />,
      color: "from-emerald-50 to-teal-50"
    },
    {
      title: "Attendance",
      description: "Track your attendance records",
      icon: <UserCheck className="h-12 w-12 text-purple-400" />,
      color: "from-purple-50 to-fuchsia-50"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <header className="px-6 py-4 md:py-6 md:px-10 relative z-10">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            TAP
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:px-10 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-4 sm:space-y-6"
          >
            <div className="space-y-3 sm:space-y-4">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
              >
                Your Ultimate <span className="text-gradient bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">College Helper</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-lg text-muted-foreground md:pr-10"
              >
                Manage your classes, assignments, notes, and attendance all in one place. Boost your academic performance with our all-in-one TAP platform.
              </motion.p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
            >
              {features.map((feature, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  className={`p-3 sm:p-4 rounded-lg bg-gradient-to-br ${feature.color} shadow-sm border border-white/20 backdrop-blur-sm hover:shadow-md transition-all duration-300`}
                >
                  <div className="mb-2">{feature.icon}</div>
                  <h3 className="font-medium text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md mx-auto mt-8 sm:mt-0"
          >
            <Card className="w-full shadow-xl bg-background/95 backdrop-blur-sm border-white/20 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
              <CardHeader className="relative">
                <div className="flex border-b space-x-4">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`pb-2 px-2 font-medium text-sm transition-colors ${
                      activeTab === 'login' 
                        ? 'border-b-2 border-primary text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`pb-2 px-2 font-medium text-sm transition-colors ${
                      activeTab === 'signup' 
                        ? 'border-b-2 border-primary text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
                <CardTitle className="mt-4 text-xl sm:text-2xl">
                  {activeTab === 'login' ? 'Welcome back!' : 'Create an account'}
                </CardTitle>
                <CardDescription>
                  {activeTab === 'login' 
                    ? 'Enter your credentials to access your account' 
                    : 'Fill out the form below to get started'}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleAuth}>
                <CardContent className="space-y-4 relative">
                  {activeTab === 'signup' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`bg-background/50 backdrop-blur-sm ${errors.name ? 'border-red-500' : ''}`}
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
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`bg-background/50 backdrop-blur-sm ${errors.email ? 'border-red-500' : ''}`}
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
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`bg-background/50 backdrop-blur-sm ${errors.password ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </motion.div>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300"
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
                    <p className="mt-2 text-sm text-center text-muted-foreground">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab('signup')}
                        className="text-primary hover:underline transition-colors"
                      >
                        Sign up
                      </button>
                    </p>
                  )}
                  {activeTab === 'signup' && (
                    <p className="mt-2 text-sm text-center text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-primary hover:underline transition-colors"
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
