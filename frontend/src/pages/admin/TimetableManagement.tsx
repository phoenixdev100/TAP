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
import { CalendarDays, Plus, Edit, Trash2, Clock, MapPin, ArrowLeft } from "lucide-react";
import api from '@/api/axios';

interface Schedule {
  _id: string;
  className: string;
  professor: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  color: string;
  classId?: string;
}

interface Class {
  _id: string;
  name: string;
  code: string;
}

const TimetableManagement = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    classId: '',
    className: '',
    professor: '',
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    location: '',
    color: '#3b82f6'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  useEffect(() => {
    fetchSchedules();
    fetchClasses();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/api/schedule');
      setSchedules((response.data as any)?.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch schedules",
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
      console.error('Failed to fetch classes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await api.put(`/api/schedule/${editingSchedule._id}`, formData);
        toast({
          title: "Success",
          description: "Schedule updated successfully"
        });
      } else {
        await api.post('/api/schedule', formData);
        toast({
          title: "Success",
          description: "Schedule created successfully"
        });
      }
      setDialogOpen(false);
      resetForm();
      fetchSchedules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save schedule",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      classId: schedule.classId || '',
      className: schedule.className,
      professor: schedule.professor,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      color: schedule.color
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await api.delete(`/api/schedule/${id}`);
        toast({
          title: "Success",
          description: "Schedule deleted successfully"
        });
        fetchSchedules();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete schedule",
          variant: "destructive"
        });
      }
    }
  };

  const handleClassChange = (classId: string) => {
    const selectedClass = classes.find(c => c._id === classId);
    setFormData({
      ...formData,
      classId,
      className: selectedClass ? `${selectedClass.code} - ${selectedClass.name}` : ''
    });
  };

  const resetForm = () => {
    setFormData({
      classId: '',
      className: '',
      professor: '',
      dayOfWeek: 'Monday',
      startTime: '',
      endTime: '',
      location: '',
      color: '#3b82f6'
    });
    setEditingSchedule(null);
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
            <h1 className="text-3xl font-bold">Timetable Management</h1>
            <p className="text-muted-foreground">Create, update, and manage timetables</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSchedule(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
              <DialogDescription>
                {editingSchedule ? 'Update the schedule information below.' : 'Fill in the details to create a new schedule.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="class">Assign to Class</Label>
                  <Select value={formData.classId} onValueChange={handleClassChange}>
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
                  <Label htmlFor="className">Class Name</Label>
                  <Input
                    id="className"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="professor">Professor/Teacher</Label>
                  <Input
                    id="professor"
                    value={formData.professor}
                    onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dayOfWeek">Day</Label>
                  <Select value={formData.dayOfWeek} onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-900' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingSchedule ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Schedules</CardTitle>
          <CardDescription>Manage your institution's timetables</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule._id}>
                  <TableCell className="font-medium">{schedule.className}</TableCell>
                  <TableCell>{schedule.professor}</TableCell>
                  <TableCell>{schedule.dayOfWeek}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {schedule.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(schedule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(schedule._id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableManagement;
