import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import api from "@/api/axios";
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Eye,
} from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from '@/contexts/AuthContext';
import { motion } from "framer-motion";

interface ScheduleItem {
  _id: string;
  className: string;
  professor: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  color: string;
}

type ScheduleFormData = Omit<ScheduleItem, "_id">;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  schedules?: T[];
  schedule?: T;
}

const ClassSchedule: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState<ScheduleFormData>({
    className: '',
    professor: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    location: '',
    color: '#4F46E5',
  });

  const { toast } = useToast();

  // Check if user has permission to edit schedules
  const canEditSchedule = user?.role === 'teacher' || user?.role === 'college_admin';
  // Check if user has full admin control
  const hasFullControl = user?.role === 'college_admin';

  const fetchSchedules = async () => {
    try {
      const response = await api.get<ApiResponse<ScheduleItem>>('/api/schedule');

      if (response.data.success && response.data.schedules) {
        setSchedules(response.data.schedules);
      } else {
        throw new Error(response.data.message || 'Failed to fetch schedules');
      }
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Failed to fetch schedules",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    fetchSchedules();
    // Scroll to top when component mounts (guard for SSR)
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof ScheduleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        !formData.className ||
        !formData.professor ||
        !formData.dayOfWeek ||
        !formData.startTime ||
        !formData.endTime ||
        !formData.location
      ) {
        throw new Error('Please fill in all required fields');
      }

      const response = await api.post<ApiResponse<ScheduleItem>>(
        '/api/schedule',
        formData
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Class schedule added successfully",
          duration: 5000,
        });
        setIsAddDialogOpen(false);
        setFormData({
          className: '',
          professor: '',
          dayOfWeek: '',
          startTime: '',
          endTime: '',
          location: '',
          color: '#4F46E5',
        });
        setSelectedDate(undefined);
        fetchSchedules();
      } else {
        throw new Error(response.data.message || 'Failed to add schedule');
      }
    } catch (error: any) {
      console.error('Error adding schedule:', error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Failed to add schedule",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    try {
      if (
        !formData.className ||
        !formData.professor ||
        !formData.dayOfWeek ||
        !formData.startTime ||
        !formData.endTime ||
        !formData.location
      ) {
        throw new Error('Please fill in all required fields');
      }

      const response = await api.put<ApiResponse<ScheduleItem>>(
        `/api/schedule/${selectedSchedule._id}`,
        formData
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Class schedule updated successfully",
          duration: 5000,
        });
        setIsEditDialogOpen(false);
        setSelectedSchedule(null);
        setSelectedDate(undefined);
        fetchSchedules();
      } else {
        throw new Error(response.data.message || 'Failed to update schedule');
      }
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Failed to update schedule",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;

    try {
      const response = await api.delete<ApiResponse<ScheduleItem>>(
        `/api/schedule/${id}`
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Class schedule deleted successfully",
          duration: 5000,
        });
        fetchSchedules();
      } else {
        throw new Error(response.data.message || 'Failed to delete schedule');
      }
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Failed to delete schedule",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (viewMode === 'daily') {
        newDate.setDate(prevDate.getDate() + (direction === 'next' ? 1 : -1));
      } else {
        newDate.setDate(prevDate.getDate() + (direction === 'next' ? 7 : -7));
      }
      return newDate;
    });
  };

  const getCurrentWeekDates = () => {
    const week: Date[] = [];
    const curr = new Date(currentDate);
    const day = curr.getDay(); // 0 (Sun) - 6 (Sat)
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      week.push(d);
    }

    return week;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getCurrentDayName = () => {
    return currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  // Define time slots for the table
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  // Helper to get schedule for a specific day and time slot
  const getScheduleForSlot = (day: string, timeSlot: string) => {
    const [time] = timeSlot.split(' ');
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const isPM = timeSlot.includes('PM') && hourNum !== 12;
    const hour24 = isPM ? hourNum + 12 : (hourNum === 12 ? 0 : hourNum);
    
    return schedules.find(schedule => {
      if (schedule.dayOfWeek !== day) return false;
      const [startHour] = schedule.startTime.split(':').map(Number);
      return startHour === hour24;
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const dayName = format(date, 'EEEE'); // Full day name
      handleSelectChange('dayOfWeek', dayName);
    }
  };

  const currentWeekDates = getCurrentWeekDates();

  return (
    <div className="min-h-screen w-full flex flex-col pb-10 sm:pb-0">
      <div className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6">
        <div className="flex flex-col space-y-6 sm:space-y-8">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Class Schedule
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">
                {user?.role === 'student'
                  ? 'View your class schedule and upcoming classes'
                  : 'Manage class schedules and timetables'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-muted rounded-lg p-1 mx-auto sm:mx-0">
                <Button
                  variant={viewMode === 'daily' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('daily')}
                  className="px-3 py-1 text-xs sm:text-sm"
                >
                  Daily
                </Button>
                <Button
                  variant={viewMode === 'weekly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('weekly')}
                  className="px-3 py-1 text-xs sm:text-sm"
                >
                  Weekly
                </Button>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg border hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <div className="min-w-[120px] sm:min-w-[150px] text-center font-medium text-xs sm:text-sm">
                  {viewMode === 'daily'
                    ? `${getCurrentDayName()}, ${formatDate(currentDate)}`
                    : `Week of ${formatDate(currentWeekDates[0])}`}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg border hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>

              {/* Add Schedule Button */}
              {canEditSchedule && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white shadow-lg transition-all duration-300 flex items-center gap-2 text-sm sm:text-base">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Add Schedule</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] border-0 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Add New Class
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        placeholder="Class Name"
                        name="className"
                        value={formData.className}
                        onChange={handleInputChange}
                        required
                        className="border-2 focus:ring-2 focus:ring-purple-500"
                      />
                      <Input
                        placeholder="Professor Name"
                        name="professor"
                        value={formData.professor}
                        onChange={handleInputChange}
                        required
                        className="border-2 focus:ring-2 focus:ring-purple-500"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-2 focus:ring-2 focus:ring-purple-500"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          required
                          className="border-2 focus:ring-2 focus:ring-purple-500"
                        />
                        <Input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          required
                          className="border-2 focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <Input
                        placeholder="Room Number / Location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="border-2 focus:ring-2 focus:ring-purple-500"
                      />
                      <Input
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="h-12 cursor-pointer"
                      />
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                      >
                        Add Class
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </motion.div>

          {/* Schedule Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 sm:mt-8"
          >
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-2 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="p-3 text-left font-semibold text-sm bg-muted/50 dark:bg-slate-700/50 border-r border-border">Time</th>
                      {viewMode === 'daily' ? (
                        <th className={`p-3 text-center font-semibold text-sm min-w-[120px] border-r border-border bg-primary/10 dark:bg-primary/20`}>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-primary">{getCurrentDayName()}</span>
                            <span className="text-xs font-medium text-primary">Today</span>
                          </div>
                        </th>
                      ) : (
                        daysOfWeek.map(day => {
                          const isToday = day === getCurrentDayName();
                          return (
                            <th key={day} className={`p-3 text-center font-semibold text-sm min-w-[120px] border-r border-border ${
                              isToday ? 'bg-primary/10 dark:bg-primary/20' : 'bg-muted/50 dark:bg-slate-700/50'
                            }`}>
                              <div className="flex flex-col items-center gap-1">
                                <span className={isToday ? 'text-primary' : ''}>{day}</span>
                                {isToday && (
                                  <span className="text-xs font-medium text-primary">Today</span>
                                )}
                              </div>
                            </th>
                          );
                        })
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(timeSlot => (
                      <tr key={timeSlot} className="border-b border-border hover:bg-muted/30 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 text-sm font-medium text-muted-foreground whitespace-nowrap border-r border-border">
                          {timeSlot}
                        </td>
                        {viewMode === 'daily' ? (
                          (() => {
                            const currentDay = getCurrentDayName();
                            const schedule = getScheduleForSlot(currentDay, timeSlot);
                            return (
                              <td key={`${currentDay}-${timeSlot}`} className="p-2 border-r border-border">
                                {schedule ? (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer relative group"
                                    style={{
                                      borderColor: schedule.color,
                                      backgroundColor: `${schedule.color}20`,
                                    }}
                                  >
                                    <div className="space-y-1">
                                      <h4 className="font-semibold text-sm" style={{ color: schedule.color }}>
                                        {schedule.className}
                                      </h4>
                                      <p className="text-xs text-muted-foreground">{schedule.professor}</p>
                                      <p className="text-xs text-muted-foreground">{schedule.location}</p>
                                      <p className="text-xs text-muted-foreground">{schedule.startTime} - {schedule.endTime}</p>
                                    </div>
                                    {canEditSchedule && (
                                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => {
                                            setSelectedSchedule(schedule);
                                            const { _id, ...rest } = schedule;
                                            setFormData(rest);
                                            setSelectedDate(undefined);
                                            setIsEditDialogOpen(true);
                                          }}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 hover:text-destructive"
                                          onClick={() => handleDelete(schedule._id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </motion.div>
                                ) : (
                                  <div className="h-full min-h-[80px] flex items-center justify-center text-muted-foreground/30">
                                    -
                                  </div>
                                )}
                              </td>
                            );
                          })()
                        ) : (
                          daysOfWeek.map(day => {
                            const schedule = getScheduleForSlot(day, timeSlot);
                            return (
                              <td key={`${day}-${timeSlot}`} className="p-2 border-r border-border">
                                {schedule ? (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer relative group"
                                    style={{
                                      borderColor: schedule.color,
                                      backgroundColor: `${schedule.color}20`,
                                    }}
                                  >
                                    <div className="space-y-1">
                                      <h4 className="font-semibold text-sm" style={{ color: schedule.color }}>
                                        {schedule.className}
                                      </h4>
                                      <p className="text-xs text-muted-foreground">{schedule.professor}</p>
                                      <p className="text-xs text-muted-foreground">{schedule.location}</p>
                                      <p className="text-xs text-muted-foreground">{schedule.startTime} - {schedule.endTime}</p>
                                    </div>
                                    {canEditSchedule && (
                                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => {
                                            setSelectedSchedule(schedule);
                                            const { _id, ...rest } = schedule;
                                            setFormData(rest);
                                            setSelectedDate(undefined);
                                            setIsEditDialogOpen(true);
                                          }}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 hover:text-destructive"
                                          onClick={() => handleDelete(schedule._id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </motion.div>
                                ) : (
                                  <div className="h-full min-h-[80px] flex items-center justify-center text-muted-foreground/30">
                                    -
                                  </div>
                                )}
                              </td>
                            );
                          })
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          {canEditSchedule && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="border-0 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Edit Class
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEdit} className="space-y-4">
                  <Input
                    placeholder="Class Name"
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                    required
                    className="border-2 focus:ring-2 focus:ring-purple-500"
                  />
                  <Input
                    placeholder="Professor Name"
                    name="professor"
                    value={formData.professor}
                    onChange={handleInputChange}
                    required
                    className="border-2 focus:ring-2 focus:ring-purple-500"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-2 focus:ring-2 focus:ring-purple-500"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      className="border-2 focus:ring-2 focus:ring-purple-500"
                    />
                    <Input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      className="border-2 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <Input
                    placeholder="Room Number / Location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="border-2 focus:ring-2 focus:ring-purple-500"
                  />
                  <Input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="h-12 cursor-pointer"
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                  >
                    Update Class
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div >
  );
};

export default ClassSchedule;
