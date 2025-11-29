import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, CalendarDays, FileText, ListTodo, UserCheck, LogOut, User, Settings, Bell, BookOpenCheck } from "lucide-react";
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

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { toast } = useToast();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const tabs = [
    { value: "/dashboard", label: "Dashboard", icon: <BookOpen className="h-4 w-4" /> },
    { value: "/schedule", label: "Schedule", icon: <CalendarDays className="h-4 w-4" /> },
    { value: "/assignments", label: "Assignments", icon: <ListTodo className="h-4 w-4" /> },
    { value: "/notes", label: "Notes", icon: <FileText className="h-4 w-4" /> },
    { value: "/resources", label: "Resources", icon: <BookOpenCheck className="h-4 w-4" /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b shadow-sm p-3">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">TAP</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{localStorage.getItem("userName") || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        student@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 md:px-6 flex-1 pb-16">
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
