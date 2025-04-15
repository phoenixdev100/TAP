import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, BookOpen, ListTodo, FileText, UserCheck, Clock, Bell, BarChart2, Bookmark, Users, BookOpenCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

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

const upcomingEvents = [
  { title: "Math Exam", time: "10:00 AM", date: "Tomorrow", type: "exam" },
  { title: "Physics Assignment Due", time: "11:59 PM", date: "Today", type: "assignment" },
  { title: "Chemistry Lab", time: "2:00 PM", date: "Today", type: "class" }
];

const recentActivities = [
  { title: "Uploaded Physics Notes", time: "2 hours ago", icon: <FileText className="h-4 w-4" /> },
  { title: "Marked Attendance", time: "4 hours ago", icon: <UserCheck className="h-4 w-4" /> },
  { title: "Updated Schedule", time: "1 day ago", icon: <CalendarDays className="h-4 w-4" /> }
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
  const userName = localStorage.getItem("userName") || "Student";
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Welcome back, {userName}!
          </h2>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your academic tools and resources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Current Semester: Spring 2024</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <BarChart2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">GPA: 3.8</span>
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
              <span className="text-sm text-muted-foreground">92%</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Assignment Completion</span>
              <span className="text-sm text-muted-foreground">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Study Time</span>
              <span className="text-sm text-muted-foreground">15 hours this week</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
