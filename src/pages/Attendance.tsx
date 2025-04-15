import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, AlertCircle, CheckCircle2, XCircle, ChevronLeft, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// Mock data for subjects
const subjects = [
  { 
    id: 1, 
    name: "Mathematics", 
    code: "MATH101",
    totalClasses: 30,
    attendedClasses: 25,
    attendancePercentage: 83.3,
    lastUpdated: "2024-03-20",
    dailyAttendance: [
      { date: "2024-03-20", status: "Present", time: "09:00 AM" },
      { date: "2024-03-18", status: "Present", time: "09:00 AM" },
      { date: "2024-03-15", status: "Absent", time: "09:00 AM" },
      { date: "2024-03-13", status: "Present", time: "09:00 AM" },
      { date: "2024-03-11", status: "Present", time: "09:00 AM" },
    ]
  },
  { 
    id: 2, 
    name: "Physics", 
    code: "PHY102",
    totalClasses: 28,
    attendedClasses: 24,
    attendancePercentage: 85.7,
    lastUpdated: "2024-03-20",
    dailyAttendance: [
      { date: "2024-03-20", status: "Present", time: "11:00 AM" },
      { date: "2024-03-18", status: "Present", time: "11:00 AM" },
      { date: "2024-03-15", status: "Present", time: "11:00 AM" },
      { date: "2024-03-13", status: "Absent", time: "11:00 AM" },
      { date: "2024-03-11", status: "Present", time: "11:00 AM" },
    ]
  },
  { 
    id: 3, 
    name: "Chemistry", 
    code: "CHEM103",
    totalClasses: 30,
    attendedClasses: 20,
    attendancePercentage: 66.7,
    lastUpdated: "2024-03-19",
    dailyAttendance: [
      { date: "2024-03-19", status: "Absent", time: "02:00 PM" },
      { date: "2024-03-17", status: "Present", time: "02:00 PM" },
      { date: "2024-03-14", status: "Absent", time: "02:00 PM" },
      { date: "2024-03-12", status: "Present", time: "02:00 PM" },
      { date: "2024-03-10", status: "Absent", time: "02:00 PM" },
    ]
  },
  { 
    id: 4, 
    name: "Biology", 
    code: "BIO104",
    totalClasses: 25,
    attendedClasses: 22,
    attendancePercentage: 88.0,
    lastUpdated: "2024-03-19",
    dailyAttendance: [
      { date: "2024-03-19", status: "Present", time: "10:00 AM" },
      { date: "2024-03-17", status: "Present", time: "10:00 AM" },
      { date: "2024-03-14", status: "Present", time: "10:00 AM" },
      { date: "2024-03-12", status: "Present", time: "10:00 AM" },
      { date: "2024-03-10", status: "Absent", time: "10:00 AM" },
    ]
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

const Attendance = () => {
  const [selectedSubject, setSelectedSubject] = useState<typeof subjects[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const overallAttendance = subjects.reduce((acc, subject) => acc + subject.attendancePercentage, 0) / subjects.length;
  const isOverallGood = overallAttendance >= 75;

  const getAttendanceForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return subjects.map(subject => {
      const attendance = subject.dailyAttendance.find(a => a.date === dateStr);
      return {
        subject,
        attendance: attendance || null
      };
    });
  };

  if (selectedSubject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedSubject(null)}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {selectedSubject.name}
            </h2>
            <p className="text-muted-foreground mt-2">
              {selectedSubject.code} - Daily Attendance Records
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Select Date
              </CardTitle>
              <CardDescription>Choose a date to view attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Attendance for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}
              </CardTitle>
              <CardDescription>View attendance record for the selected date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedDate && (() => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  const attendance = selectedSubject.dailyAttendance.find(a => a.date === dateStr);
                  return (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            attendance?.status === "Present"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {attendance?.status === "Present" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{selectedSubject.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {attendance ? attendance.time : "No class scheduled"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          attendance?.status === "Present"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {attendance ? attendance.status : "No Record"}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-purple-50 border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Attendance Summary
                </CardTitle>
                <CardDescription>Detailed attendance records for {selectedSubject.name}</CardDescription>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                selectedSubject.attendancePercentage >= 75 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}>
                <span className="text-sm font-medium">
                  {selectedSubject.attendancePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Classes</span>
                <span className="text-sm text-muted-foreground">
                  {selectedSubject.attendedClasses} / {selectedSubject.totalClasses}
                </span>
              </div>
              <Progress 
                value={selectedSubject.attendancePercentage} 
                className={`h-2 ${
                  selectedSubject.attendancePercentage >= 75 ? "bg-green-100" : "bg-red-100"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Daily Records
            </CardTitle>
            <CardDescription>Your attendance history for this subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedSubject.dailyAttendance.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        record.status === "Present"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {record.status === "Present" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {record.time}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      record.status === "Present"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Attendance Overview
          </h2>
          <p className="text-muted-foreground mt-2">
            Track your attendance across all subjects
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
          isOverallGood ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}>
          <UserCheck className="h-4 w-4" />
          <span className="text-sm font-medium">
            Overall Attendance: {overallAttendance.toFixed(1)}%
          </span>
        </div>
      </div>

      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {subjects.map((subject) => {
          const isGood = subject.attendancePercentage >= 75;
          return (
            <motion.div 
              key={subject.id} 
              variants={item}
              onClick={() => setSelectedSubject(subject)}
              className="cursor-pointer"
            >
              <Card className={`overflow-hidden border-none ${
                isGood ? "bg-gradient-to-br from-green-50 to-emerald-50" : "bg-gradient-to-br from-red-50 to-rose-50"
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <div className={`p-2 rounded-full ${
                      isGood ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}>
                      {isGood ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                  </div>
                  <CardDescription className="text-sm">{subject.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Attendance</span>
                      <span className={`text-sm font-medium ${
                        isGood ? "text-green-600" : "text-red-600"
                      }`}>
                        {subject.attendancePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={subject.attendancePercentage} 
                      className={`h-2 ${
                        isGood ? "bg-green-100" : "bg-red-100"
                      }`}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Attended: {subject.attendedClasses}</span>
                      <span>Total: {subject.totalClasses}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(subject.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <Card className="bg-gradient-to-br from-primary/5 to-purple-50 border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Attendance Guidelines
          </CardTitle>
          <CardDescription>Important information about attendance requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">Good Standing</h4>
                <p className="text-sm text-muted-foreground">
                  Maintain attendance above 75% to be in good standing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white">
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">Warning Zone</h4>
                <p className="text-sm text-muted-foreground">
                  Below 75% attendance may affect your academic standing
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
