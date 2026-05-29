import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { UserCheck, Calendar, Plus, BarChart3, ArrowLeft } from "lucide-react";
import api from '@/api/axios';

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

const AttendanceManagement = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const { toast } = useToast();

  const [markFormData, setMarkFormData] = useState<Record<string, 'present' | 'absent'>>({});

  const [reportFilters, setReportFilters] = useState({
    classId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

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
      console.error('Failed to fetch class with students:', error);
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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="w-full px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin-dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Attendance Management</h1>
            <p className="text-muted-foreground">Take attendance and view reports</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={markDialogOpen} onOpenChange={(open) => {
            setMarkDialogOpen(open);
            if (!open) {
              setSelectedClass(null);
              setSelectedDate('');
              setMarkFormData({});
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
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
                    <Select value={selectedClass?._id || ''} onValueChange={(value) => {
                      const cls = classes.find(c => c._id === value);
                      setSelectedClass(cls || null);
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
          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
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
        </div>
      </div>

      {attendance.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Attendance Report</CardTitle>
            <CardDescription>Showing {attendance.length} records</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell className="font-medium">{record.student?.username || 'Unknown'}</TableCell>
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
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage attendance for your classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Mark Attendance</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Take daily attendance for any class</p>
              <Button variant="outline" size="sm" onClick={() => setMarkDialogOpen(true)}>
                Mark Now
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">View Reports</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Generate attendance reports for analysis</p>
              <Button variant="outline" size="sm" onClick={() => setReportDialogOpen(true)}>
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManagement;
