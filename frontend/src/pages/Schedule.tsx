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
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

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
      <div className="flex-1 container mx-auto py-4 sm:py-6">
        <div className="flex flex-col space-y-6 sm:space-y-8">
          {/* Header with responsive controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Class Schedule
                {user?.role === 'student' && (
                  <span className="ml-2 text-sm text-muted-foreground font-normal block sm:inline">
                    (View Only)
                  </span>
                )}
                {hasFullControl && (
                  <span className="ml-2 text-sm text-green-600 font-normal block sm:inline">
                    (Admin Control)
                  </span>
                )}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
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
          </div>

          {/* Schedule grid */}
          <div
            className={`mt-6 sm:mt-8 grid gap-4 sm:gap-6 ${viewMode === 'weekly'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : ''
              }`}
          >
            {(viewMode === 'weekly'
              ? daysOfWeek
              : [getCurrentDayName()]
            ).map((day) => {
              const daySchedules = schedules.filter(
                (schedule) => schedule.dayOfWeek === day
              );

              return (
                <Card
                  key={day}
                  className="h-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-2"
                >
                  <CardHeader className="flex flex-row items-center justify-between py-3 sm:py-4">
                    <CardTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
                      {day}
                      {viewMode === 'weekly' && (
                        <span className="text-xs sm:text-sm text-muted-foreground ml-2 block sm:inline">
                          {formatDate(
                            currentWeekDates[daysOfWeek.indexOf(day)]
                          )}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {daySchedules.length === 0 ? (
                      <div className="text-center py-4">
                        {day === 'Sunday' ? (
                          <div className="space-y-2">
                            <p className="text-sm text-red-600 font-semibold">🎉 Holiday</p>
                            <p className="text-xs text-muted-foreground">Sunday is always a holiday</p>
                          </div>
                        ) : day === 'Saturday' ? (
                          <div className="space-y-2">
                            <p className="text-sm text-amber-600 font-semibold">🏖️ Weekend</p>
                            <p className="text-xs text-muted-foreground">No extra classes scheduled</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No classes scheduled</p>
                        )}
                      </div>
                    ) : (
                      <>
                        {day === 'Sunday' && (
                          <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">
                              ⚠️ Extra Class on Sunday
                            </p>
                          </div>
                        )}
                        {day === 'Saturday' && (
                          <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium text-center">
                              📚 Saturday Extra Class
                            </p>
                          </div>
                        )}
                        {daySchedules.map((schedule) => (
                          <div
                            key={schedule._id}
                            className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors relative"
                            style={{
                              borderLeft: `4px solid ${schedule.color}`,
                            }}
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-lg">
                                  {schedule.className}
                                </h3>
                                {canEditSchedule ? (
                                  <div className="flex gap-1.5 opacity-0 hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-lg hover:bg-accent/20"
                                      onClick={() => {
                                        setSelectedSchedule(schedule);
                                        const { _id, ...rest } = schedule;
                                        setFormData(rest);
                                        setSelectedDate(undefined);
                                        setIsEditDialogOpen(true);
                                      }}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() =>
                                        handleDelete(schedule._id)
                                      }
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex gap-1.5 opacity-0 hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-lg hover:bg-accent/20"
                                      title="View only - Students cannot edit schedules"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-3.5 w-3.5" />
                                    <span className="font-medium">
                                      Professor:
                                    </span>
                                  </div>
                                  <span>{schedule.professor}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="font-medium">Time:</span>
                                  </div>
                                  <span>
                                    {schedule.startTime} - {schedule.endTime}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="font-medium">Room No:</span>
                                  </div>
                                  <span>{schedule.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

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
    </div>
  );
};

export default ClassSchedule;
