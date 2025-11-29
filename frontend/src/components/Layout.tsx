import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, CalendarDays, FileText, ListTodo, UserCheck, LogOut, User, Settings, Bell, BookOpenCheck, Sparkles, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Get dashboard route based on user role
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
        return '/student-dashboard';
    }
  };

  const tabs = [
    { value: "/dashboard", label: "Dashboard", icon: <BookOpen className="h-4 w-4" /> },
    { value: "/schedule", label: "Schedule", icon: <CalendarDays className="h-4 w-4" /> },
    { value: "/assignments", label: "Assignments", icon: <ListTodo className="h-4 w-4" /> },
    { value: "/notes", label: "Notes", icon: <FileText className="h-4 w-4" /> },
    { value: "/resources", label: "Resources", icon: <BookOpenCheck className="h-4 w-4" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50">
      <header className="py-4 md:py-6">
        <div className="container mx-auto px-6 md:px-10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(getDashboardRoute())}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary" />
            </button>
            <div className="text-xl md:text-2xl font-bold">
              Welcome, <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">{user?.username || 'User'}</span>
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
                  <span>View Profile</span>
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
        {children}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 w-full bg-background border-t border-border shadow-lg z-50">
        <div className="h-14">
          <Tabs value={currentPath} className="w-full h-full" defaultValue="/">
            <TabsList className="grid w-full h-full grid-cols-5 rounded-none border-0 bg-transparent">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  onClick={() => navigate(tab.value)}
                  className="group relative flex flex-col items-center justify-center space-y-0.5 py-1 rounded-none transition-colors duration-200 h-full"
                >
                  {/* Icon container */}
                  <div className={cn(
                    "relative z-10 transition-colors duration-200",
                    currentPath === tab.value
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary"
                  )}>
                    {tab.icon}
                  </div>

                  {/* Label */}
                  <span className={cn(
                    "text-[10px] font-medium leading-none transition-colors duration-200",
                    currentPath === tab.value
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary"
                  )}>
                    {tab.label}
                  </span>

                  {/* Active indicator */}
                  <div className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-12 bg-primary scale-x-0 transition-transform duration-200",
                    currentPath === tab.value && "scale-x-100"
                  )} />
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
