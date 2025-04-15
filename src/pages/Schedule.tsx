import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, Users, ChevronLeft, ChevronRight, Plus, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock schedule data
const mockSchedule = [
  {
    day: "Monday",
    classes: [
      {
        id: 1,
        name: "Mathematics",
        time: "9:00 AM - 10:30 AM",
        room: "Room 101",
        instructor: "Dr. Smith",
        type: "lecture",
        color: "bg-blue-500"
      },
      {
        id: 2,
        name: "Physics",
        time: "11:00 AM - 12:30 PM",
        room: "Lab 203",
        instructor: "Prof. Johnson",
        type: "lab",
        color: "bg-purple-500"
      }
    ]
  },
  {
    day: "Tuesday",
    classes: [
      {
        id: 3,
        name: "Computer Science",
        time: "10:00 AM - 11:30 AM",
        room: "Room 205",
        instructor: "Dr. Williams",
        type: "lecture",
        color: "bg-emerald-500"
      }
    ]
  },
  {
    day: "Wednesday",
    classes: [
      {
        id: 4,
        name: "Chemistry",
        time: "9:00 AM - 10:30 AM",
        room: "Lab 101",
        instructor: "Dr. Brown",
        type: "lab",
        color: "bg-amber-500"
      }
    ]
  },
  {
    day: "Thursday",
    classes: [
      {
        id: 5,
        name: "Biology",
        time: "11:00 AM - 12:30 PM",
        room: "Room 103",
        instructor: "Prof. Davis",
        type: "lecture",
        color: "bg-rose-500"
      }
    ]
  },
  {
    day: "Friday",
    classes: [
      {
        id: 6,
        name: "English",
        time: "10:00 AM - 11:30 AM",
        room: "Room 201",
        instructor: "Dr. Wilson",
        type: "lecture",
        color: "bg-indigo-500"
      }
    ]
  }
];

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Class Schedule
          </h2>
          <p className="text-muted-foreground mt-2">
            View and manage your class timetable
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "day" ? "week" : "day")}
          >
            {viewMode === "day" ? "Week View" : "Day View"}
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </div>
      </div>

      {viewMode === "day" ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const currentIndex = mockSchedule.findIndex(d => d.day === selectedDay);
                  const prevIndex = (currentIndex - 1 + mockSchedule.length) % mockSchedule.length;
                  setSelectedDay(mockSchedule[prevIndex].day);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-xl font-semibold">{selectedDay}</h3>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const currentIndex = mockSchedule.findIndex(d => d.day === selectedDay);
                  const nextIndex = (currentIndex + 1) % mockSchedule.length;
                  setSelectedDay(mockSchedule[nextIndex].day);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {mockSchedule.map((day) => (
                <Button
                  key={day.day}
                  variant={selectedDay === day.day ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(day.day)}
                  className={cn(
                    "transition-all duration-300",
                    selectedDay === day.day && "bg-gradient-to-r from-primary to-purple-600"
                  )}
                >
                  {day.day.slice(0, 3)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {mockSchedule
              .find((day) => day.day === selectedDay)
              ?.classes.map((classItem) => (
                <motion.div key={classItem.id} variants={item}>
                  <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
                    <div className={`h-2 ${classItem.color}`} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{classItem.name}</CardTitle>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {classItem.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {classItem.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {classItem.instructor}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          classItem.type === "lecture" 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {classItem.type.charAt(0).toUpperCase() + classItem.type.slice(1)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-5"
        >
          {mockSchedule.map((day) => (
            <motion.div key={day.day} variants={item}>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{day.day}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {day.classes.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="p-3 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{classItem.name}</h4>
                        <span className={`h-2 w-2 rounded-full ${classItem.color}`} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {classItem.time}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {classItem.room}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Schedule;
