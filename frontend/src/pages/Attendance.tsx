import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserCheck, Calendar, BarChart3, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import api from '@/api/axios';
import Loader from '@/components/Loader';
import logger from '@/utils/logger';

interface AttendanceRecord {
  _id: string;
  student: {
    _id: string;
    username: string;
  };
  classId: string;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

interface Class {
  _id: string;
  name: string;
  code: string;
  students: Array<{
    _id: string;
    username: string;
  }>;
}

const Attendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const { toast } = useToast();

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher' || user?.role === 'college_admin';

  const [markFormData, setMarkFormData] = useState<Record<string, 'present' | 'absent'>>({});

  const [reportFilters, setReportFilters] = useState({
    classId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (isStudent) {
      fetchStudentAttendance();
    } else {
      fetchClasses();
    }
  }, [isStudent]);

  const fetchStudentAttendance = async () => {
    try {
      const response = await api.get('/api/attendance/records');
      const records = (response.data as any)?.records || [];
      setAttendance(records);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/api/classes');
      setClasses((response.data as any)?.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClassWithStudents = async (classId: string) => {
    try {
      const response = await api.get(`/api/classes/${classId}`);
      return (response.data as any)?.class || (response.data as any)?.data;
    } catch (error) {
      logger.error('Failed to fetch class with students:', error);
      return null;
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedDate) return;

    try {
      const promises = Object.entries(markFormData).map(([studentId, status]) =>
        api.post('/api/attendance/mark', {
          studentId,
          classId: selectedClass._id,
          className: selectedClass.name,
          status,
          date: selectedDate
        })
      );

      await Promise.all(promises);
      toast({
        title: "Success",
        description: "Attendance marked successfully"
      });
      setMarkDialogOpen(false);
      setMarkFormData({});
      setSelectedDate('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to mark attendance",
        variant: "destructive"
      });
    }
  };

  const handleGenerateReport = async () => {
    try {
      const params = new URLSearchParams();
      if (reportFilters.classId && reportFilters.classId !== 'all') params.append('classId', reportFilters.classId);
      if (reportFilters.startDate) params.append('startDate', reportFilters.startDate);
      if (reportFilters.endDate) params.append('endDate', reportFilters.endDate);

      const response = await api.get(`/api/attendance/report?${params}`);
      setAttendance((response.data as any)?.data || []);
      setReportDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate report",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <Loader text="Loading attendance data..." />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col pb-10 sm:pb-0 space-y-6 px-6 py-8 md:px-10 md:py-12">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(isStudent ? '/student-dashboard' : '/teacher-dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Attendance Management
            </h2>
            <p className="text-muted-foreground dark:text-gray-400 text-sm sm:text-base">
              {isStudent ? 'View your attendance records' : 'Take attendance and view reports'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isStudent && (
            <Dialog open={markDialogOpen} onOpenChange={(open) => {
              setMarkDialogOpen(open);
              if (!open) {
                setSelectedClass(null);
                setSelectedDate('');
                setMarkFormData({});
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white shadow-lg transition-all duration-300 border-0">
                  <Calendar className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
                <DialogDescription>Select a class and date to mark attendance</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleMarkAttendance}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="class">Select Class</Label>
                    <Select value={selectedClass?._id || ''} onValueChange={async (value) => {
                      const cls = classes.find(c => c._id === value);
                      setSelectedClass(cls || null);
                      if (cls) {
                        const classWithStudents = await fetchClassWithStudents(cls._id);
                        if (classWithStudents) {
                          setSelectedClass(classWithStudents);
                        }
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls._id} value={cls._id}>
                            {cls.code} - {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                    />
                  </div>
                  {selectedClass && (
                    <div className="space-y-2">
                      <Label>Students</Label>
                      {selectedClass.students && selectedClass.students.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {selectedClass.students.map((student) => (
                            <div key={student._id} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{student.username}</span>
                              <Select
                                value={markFormData[student._id] || ''}
                                onValueChange={(value: 'present' | 'absent') =>
                                  setMarkFormData({ ...markFormData, [student._id]: value })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="present">Present</SelectItem>
                                  <SelectItem value="absent">Absent</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No students enrolled in this class. Please enroll students first.</p>
                      )}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          )}
          {!isStudent && (
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white shadow-lg transition-all duration-300 border-0">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Attendance Report</DialogTitle>
                <DialogDescription>Filter attendance records</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="reportClass">Class</Label>
                  <Select value={reportFilters.classId} onValueChange={(value) => setReportFilters({ ...reportFilters, classId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls._id} value={cls._id}>
                          {cls.code} - {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={reportFilters.startDate}
                    onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={reportFilters.endDate}
                    onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleGenerateReport}>Generate Report</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </motion.div>

      {attendance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div>
            <h3 className="text-lg font-semibold">Attendance Report</h3>
            <p className="text-sm text-muted-foreground">Showing {attendance.length} records</p>
          </div>
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-2 dark:border-slate-700">
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {!isStudent && <TableHead>Student</TableHead>}
                      <TableHead>Class</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record._id}>
                        {!isStudent && <TableCell className="font-medium">{record.student?.username || 'Unknown'}</TableCell>}
                        <TableCell>{record.className}</TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {attendance.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Attendance Records</h3>
          <p className="text-sm text-muted-foreground mb-4">Start by marking attendance for your classes</p>
          <Button onClick={() => setMarkDialogOpen(true)} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white shadow-lg transition-all duration-300">
            <Calendar className="h-4 w-4 mr-2" />
            Mark Attendance
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Attendance;
