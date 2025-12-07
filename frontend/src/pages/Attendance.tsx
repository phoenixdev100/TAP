import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, AlertCircle, CheckCircle2, XCircle, ChevronLeft, Calendar as CalendarIcon, Clock, TrendingUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";

interface AttendanceRecord {
  date: string;
  status: string;
  className: string;
  markedBy: string;
  notes?: string;
}

interface AttendanceStats {
  rate: number;
  studyHours: number;
  gpa: number;
  semester: string;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
}

interface SubjectData {
  className: string;
  records: AttendanceRecord[];
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
}

interface StatsResponse {
  success: boolean;
  rate: number;
  studyHours: number;
  gpa: number;
  semester: string;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
}

interface RecordsResponse {
  success: boolean;
  records: AttendanceRecord[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const shimmer = {
  hidden: { opacity: 0.5 },
  show: {
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: "reverse" as const,
      duration: 1
    }
  }
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <motion.div
          variants={shimmer}
          initial="hidden"
          animate="show"
          className="h-8 w-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"
        />
        <motion.div
          variants={shimmer}
          initial="hidden"
          animate="show"
          className="h-4 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"
        />
      </div>
      <motion.div
        variants={shimmer}
        initial="hidden"
        animate="show"
        className="h-10 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"
      />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          variants={shimmer}
          initial="hidden"
          animate="show"
          className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl"
        />
      ))}
    </div>
  </div>
);

const Attendance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats and records in parallel
      const [statsResponse, recordsResponse] = await Promise.all([
        api.get<StatsResponse>('/api/attendance/stats'),
        api.get<RecordsResponse>('/api/attendance/records')
      ]);

      // Handle stats response
      if (statsResponse.data && (statsResponse.data.success !== false)) {
        setStats(statsResponse.data);
      }

      // Handle records response
      if (recordsResponse.data && recordsResponse.data.records) {
        const fetchedRecords = recordsResponse.data.records;
        setRecords(fetchedRecords);

        // Group records by className
        const subjectMap = new Map<string, AttendanceRecord[]>();
        fetchedRecords.forEach((record: AttendanceRecord) => {
          if (!subjectMap.has(record.className)) {
            subjectMap.set(record.className, []);
          }
          subjectMap.get(record.className)!.push(record);
        });

        // Calculate stats for each subject
        const subjectsData: SubjectData[] = Array.from(subjectMap.entries()).map(([className, classRecords]) => {
          const totalClasses = classRecords.length;
          const attendedClasses = classRecords.filter(r => r.status === 'present').length;
          const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

          return {
            className,
            records: classRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            totalClasses,
            attendedClasses,
            attendancePercentage
          };
        });

        setSubjects(subjectsData);
      }
    } catch (err: any) {
      console.error('Error fetching attendance data:', err);
      setError(err.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'present':
        return 'bg-gradient-to-br from-emerald-50 to-green-100 text-green-700 border-green-200';
      case 'absent':
        return 'bg-gradient-to-br from-red-50 to-rose-100 text-red-700 border-red-200';
      case 'late':
        return 'bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-700 border-amber-200';
      case 'excused':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'present':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'absent':
        return <XCircle className="h-5 w-5" />;
      case 'late':
        return <Clock className="h-5 w-5" />;
      case 'excused':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
      >
        <div className="p-4 rounded-full bg-red-100">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Failed to Load Attendance</h3>
        <p className="text-gray-600 text-center max-w-md">{error}</p>
        <Button onClick={fetchAttendanceData} className="mt-4">
          <Loader2 className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </motion.div>
    );
  }

  if (subjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
      >
        <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-purple-100">
          <UserCheck className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">No Attendance Records</h3>
        <p className="text-gray-600 text-center max-w-md">
          Your attendance records will appear here once your teachers start marking attendance.
        </p>
      </motion.div>
    );
  }

  const overallAttendance = stats?.rate || 0;
  const isOverallGood = overallAttendance >= 75;

  if (selectedSubject) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedSubject(null)}
            className="rounded-full hover:bg-primary/10 transition-all duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {selectedSubject.className}
            </h2>
            <p className="text-muted-foreground mt-2">
              Detailed Attendance Records
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-3"
        >
          <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{selectedSubject.totalClasses}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Classes Attended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{selectedSubject.attendedClasses}</div>
            </CardContent>
          </Card>

          <Card className={`border-none shadow-lg ${selectedSubject.attendancePercentage >= 75
            ? "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
            : "bg-gradient-to-br from-red-50 via-rose-50 to-pink-50"
            }`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${selectedSubject.attendancePercentage >= 75 ? "text-green-600" : "text-red-600"
                }`}>
                {selectedSubject.attendancePercentage.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="border-none shadow-xl bg-gradient-to-br from-white via-gray-50 to-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Attendance History
            </CardTitle>
            <CardDescription>Your complete attendance record for this subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {selectedSubject.records.map((record, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 ${getStatusColor(record.status)} backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-white/80 shadow-sm">
                        {getStatusIcon(record.status)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Marked by {record.markedBy}
                        </p>
                        {record.notes && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            Note: {record.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/80">
                      {record.status}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Attendance Overview
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Track your attendance across all subjects
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg ${isOverallGood
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
            }`}
        >
          <UserCheck className="h-5 w-5" />
          <span className="font-bold text-lg">
            {overallAttendance.toFixed(1)}%
          </span>
        </motion.div>
      </motion.div>

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-4"
        >
          <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalClasses}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.presentClasses}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Absent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.absentClasses}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Study Hours/Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats.studyHours.toFixed(1)}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {subjects.map((subject, index) => {
          const isGood = subject.attendancePercentage >= 75;
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03, y: -5 }}
              onClick={() => setSelectedSubject(subject)}
              className="cursor-pointer"
            >
              <Card className={`overflow-hidden border-none shadow-xl transition-all duration-300 ${isGood
                ? "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 hover:shadow-green-200"
                : "bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 hover:shadow-red-200"
                }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900">{subject.className}</CardTitle>
                    <div className={`p-3 rounded-full shadow-md ${isGood ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      }`}>
                      {isGood ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Attendance Rate</span>
                      <span className={`text-2xl font-bold ${isGood ? "text-green-600" : "text-red-600"
                        }`}>
                        {subject.attendancePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={subject.attendancePercentage}
                      className={`h-3 ${isGood ? "bg-green-200" : "bg-red-200"
                        }`}
                    />
                    <div className="flex justify-between text-sm font-medium text-gray-600 pt-2">
                      <span>Attended: {subject.attendedClasses}</span>
                      <span>Total: {subject.totalClasses}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-primary/5 via-purple-50 to-pink-50 border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserCheck className="h-6 w-6 text-primary" />
              Attendance Guidelines
            </CardTitle>
            <CardDescription className="text-base">Important information about attendance requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 shadow-md"
              >
                <div className="p-3 rounded-full bg-green-500 text-white shadow-lg">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900">Good Standing</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    Maintain attendance above 75% to be in good academic standing
                  </p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200 shadow-md"
              >
                <div className="p-3 rounded-full bg-red-500 text-white shadow-lg">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900">Warning Zone</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    Below 75% attendance may affect your academic standing and eligibility
                  </p>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Attendance;
