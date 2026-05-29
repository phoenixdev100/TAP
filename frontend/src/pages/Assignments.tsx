
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import logger from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import {
  Plus,
  Edit,
  Trash2,
  CalendarClock,
  CheckCheck,
  Clock,
  Upload,
  Download,
  FileText,
  Eye,
  Star,
  MessageSquare,
  User,
  Link
} from 'lucide-react';
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  className: string;
  link?: string;
  status?: string;
  score?: number | null;
  submittedAt?: string;
  submissionFile?: string | null;
  totalSubmissions?: number;
  gradedSubmissions?: number;
  pendingGrading?: number;
  teacher?: string;
  submission?: {
    submittedAt: string;
    status: string;
    score?: number;
    link?: string;
  };
  submissions?: Array<{
    student: string;
    studentId: string;
    submittedAt: string;
    status: string;
    score?: number;
    link?: string;
    fileData?: boolean;
    originalFileName?: string;
    fileType?: string;
    fileSize?: number;
    gradedBy?: string;
    feedback?: string;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  assignments?: T[];
  assignment?: T;
}

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmissionsDialogOpen, setIsSubmissionsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    className: '',
    classId: '',
    link: ''
  });
  const [submissionData, setSubmissionData] = useState({
    link: ''
  });
  const [gradeData, setGradeData] = useState({
    score: '',
    feedback: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if user has permission to edit assignments
  const canEditAssignment = user?.role === 'teacher' || user?.role === 'college_admin';

  // Check if user has full admin control
  const hasFullControl = user?.role === 'college_admin';

  const fetchAssignments = async () => {
    try {
      const response = await api.get<ApiResponse<Assignment>>('/api/assignments');

      if (response.data.success && response.data.assignments) {
        setAssignments(response.data.assignments);
      } else {
        throw new Error(response.data.message || 'Failed to fetch assignments');
      }
    } catch (error: any) {
      logger.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to fetch assignments",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/api/classes');
      setClasses((response.data as any)?.data || []);
    } catch (error) {
      logger.error('Failed to fetch classes:', error);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchClasses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.title || !formData.description || !formData.dueDate || !formData.className) {
        throw new Error('Please fill in all required fields');
      }

      const response = await api.post<ApiResponse<Assignment>>('/api/assignments', formData);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Assignment created successfully",
          duration: 5000,
        });
        setIsAddDialogOpen(false);
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          className: '',
          classId: '',
          link: ''
        });
        fetchAssignments();
      } else {
        throw new Error(response.data.message || 'Failed to create assignment');
      }
    } catch (error: any) {
      logger.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create assignment",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedAssignment) return;

      const response = await api.put<ApiResponse<Assignment>>(`/api/assignments/${selectedAssignment.id}`, formData);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Assignment updated successfully",
          duration: 5000,
        });
        setIsEditDialogOpen(false);
        setSelectedAssignment(null);
        fetchAssignments();
      } else {
        throw new Error(response.data.message || 'Failed to update assignment');
      }
    } catch (error: any) {
      logger.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to update assignment",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      setAssignmentToDelete(assignment);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;

    try {
      const response = await api.delete<ApiResponse<Assignment>>(`/api/assignments/${assignmentToDelete.id}`);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Assignment deleted successfully",
          duration: 5000,
        });
        setIsDeleteDialogOpen(false);
        setAssignmentToDelete(null);
        fetchAssignments();
      } else {
        throw new Error(response.data.message || 'Failed to delete assignment');
      }
    } catch (error: any) {
      logger.error('Error deleting assignment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to delete assignment",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedAssignment) return;

      const response = await api.post(`/api/assignments/${selectedAssignment.id}/submit`, {
        link: submissionData.link
      }) as any;

      if ((response.data as any).success) {
        toast({
          title: "Success",
          description: "Assignment submitted successfully",
          duration: 5000,
        });
        setIsSubmitDialogOpen(false);
        setSelectedAssignment(null);
        setSubmissionData({ link: '' });
        fetchAssignments();
      } else {
        throw new Error((response.data as any).message || 'Failed to submit assignment');
      }
    } catch (error: any) {
      logger.error('Error submitting assignment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to submit assignment",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedAssignment || !selectedSubmission) return;

      const response = await api.post(`/api/assignments/${selectedAssignment.id}/grade/${selectedSubmission.studentId}`, gradeData) as any;

      if ((response.data as any).success) {
        toast({
          title: "Success",
          description: "Submission graded successfully",
          duration: 5000,
        });
        setIsGradeDialogOpen(false);
        setSelectedAssignment(null);
        setSelectedSubmission(null);
        setGradeData({ score: '', feedback: '' });
        fetchAssignments();
      } else {
        throw new Error((response.data as any).message || 'Failed to grade submission');
      }
    } catch (error: any) {
      logger.error('Error grading submission:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to grade submission",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (assignmentId: string, studentId: string, fileName: string) => {
    try {
      const response = await api.get(`/api/assignments/download/${assignmentId}/${studentId}`, {
        responseType: 'blob'
      });

      // Create blob from response with proper typing
      const blob = new Blob([response.data as BlobPart]);
      const url = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const openEditDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const matchedClass = classes.find(c => `${c.code} - ${c.name}` === assignment.className);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      className: assignment.className,
      classId: matchedClass?._id || '',
      link: assignment.link || ''
    });
    setIsEditDialogOpen(true);
  };

  const openSubmitDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionData({ link: '' });
    setIsSubmitDialogOpen(true);
  };

  const openSubmissionsDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionsDialogOpen(true);
  };

  const openGradeDialog = (assignment: Assignment, submission: any) => {
    setSelectedAssignment(assignment);
    setSelectedSubmission(submission);
    setGradeData({
      score: submission.score?.toString() || '',
      feedback: submission.feedback || ''
    });
    setIsGradeDialogOpen(true);
  };

  const getAssignmentStats = () => {
    const total = assignments.length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const overdue = assignments.filter(a =>
      a.status === 'pending' && new Date(a.dueDate) < new Date()
    ).length;

    return { total, completed, pending, overdue };
  };

  const stats = getAssignmentStats();

  return (
    <div className="min-h-screen w-full flex flex-col pb-10 sm:pb-0 space-y-6 px-6 py-8 md:px-10 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Assignments
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            {user?.role === 'student'
              ? 'Track your upcoming deadlines and submit your work'
              : 'Manage assignments and grade student submissions'
            }
          </p>
        </div>
        {canEditAssignment && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white shadow-lg transition-all duration-300 flex items-center gap-2 text-sm sm:text-base">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add Assignment</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-w-[95vw] border-0 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Create New Assignment
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <Input
                  placeholder="Assignment Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="border-2 focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                />
                <Textarea
                  placeholder="Assignment Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="border-2 focus:ring-2 focus:ring-purple-500 text-sm sm:text-base resize-none"
                />
                <Input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                  className="border-2 focus:ring-2 focus:ring-purple-500"
                />
                <Select value={formData.classId} onValueChange={(value) => {
                  const selectedClass = classes.find(c => c._id === value);
                  setFormData(prev => ({
                    ...prev,
                    classId: value,
                    className: selectedClass ? `${selectedClass.code} - ${selectedClass.name}` : '',
                    link: prev.link
                  }));
                }}>
                  <SelectTrigger className="border-2 focus:ring-2 focus:ring-purple-500">
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
                <Input
                  placeholder="Drive Link (optional)"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="border-2 focus:ring-2 focus:ring-purple-500"
                />
                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                  {isLoading ? 'Creating...' : 'Create Assignment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {/* Enhanced Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:to-indigo-950 border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="dark:text-white">Total</span>
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Assignments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:to-emerald-950 border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="dark:text-white">Completed</span>
              <CheckCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Submitted</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:to-orange-950 border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="dark:text-white">Pending</span>
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
            <p className="text-sm text-muted-foreground dark:text-gray-400">To Do</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-950 dark:to-rose-950 border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="dark:text-white">Overdue</span>
              <CalendarClock className="h-5 w-5 text-red-600 dark:text-red-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Late</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Assignments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {assignments.length === 0 ? (
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-2 dark:border-slate-700">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground dark:text-gray-400 py-8">
                {user?.role === 'student'
                  ? 'No assignments assigned to you yet.'
                  : 'No assignments created yet. Create one to get started.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`hover:shadow-lg transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-2 dark:border-slate-700 cursor-pointer ${user?.role !== 'student' ? 'hover:border-purple-500' : ''}`}
                onClick={() => user?.role !== 'student' && openSubmissionsDialog(assignment)}
              >
              <CardHeader className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg font-semibold truncate">{assignment.title}</CardTitle>
                    {assignment.status === 'completed' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full whitespace-nowrap">
                        Submitted
                      </span>
                    )}
                    {assignment.status === 'pending' && new Date(assignment.dueDate) < new Date() && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full whitespace-nowrap">
                        Overdue
                      </span>
                    )}
                    {assignment.status === 'completed' && assignment.submission?.link && (
                      <a
                        href={assignment.submission.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline whitespace-nowrap"
                      >
                        <Link className="h-3 w-3" />
                        Your Submission
                      </a>
                    )}
                    {assignment.link && (
                      <a
                        href={assignment.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline whitespace-nowrap"
                      >
                        <Link className="h-3 w-3" />
                        Assignment Link
                      </a>
                    )}
                    <span className="text-xs text-muted-foreground hidden sm:inline">{assignment.description}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground font-medium">{assignment.className}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {user?.role === 'student' ? (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); openSubmitDialog(assignment); }}
                        disabled={assignment.status === 'completed'}
                        className="h-8 w-8"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); openEditDialog(assignment); }}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleDelete(assignment.id); }}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Edit Assignment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Edit Assignment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <Input
              placeholder="Assignment Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="border-2 focus:ring-2 focus:ring-purple-500"
            />
            <Textarea
              placeholder="Assignment Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="border-2 focus:ring-2 focus:ring-purple-500"
            />
            <Input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              required
              className="border-2 focus:ring-2 focus:ring-purple-500"
            />
            <Select value={formData.classId} onValueChange={(value) => {
              const selectedClass = classes.find(c => c._id === value);
              setFormData(prev => ({
                ...prev,
                classId: value,
                className: selectedClass ? `${selectedClass.code} - ${selectedClass.name}` : '',
                link: prev.link
              }));
            }}>
              <SelectTrigger className="border-2 focus:ring-2 focus:ring-purple-500">
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
            <Input
              placeholder="Drive Link (optional)"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              className="border-2 focus:ring-2 focus:ring-purple-500"
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
              {isLoading ? 'Updating...' : 'Update Assignment'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submit Assignment Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Submit Assignment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmission} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Submission Link</Label>
              <Input
                placeholder="Paste your submission link here (e.g., Google Drive, GitHub, etc.)"
                name="link"
                value={submissionData.link}
                onChange={(e) => setSubmissionData(prev => ({ ...prev, link: e.target.value }))}
                required
                className="border-2 focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-muted-foreground">
                Provide a link to your assignment submission
              </p>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
              {isLoading ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Grade Submission
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGrade} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Score (out of 100)</label>
              <Input
                type="number"
                min="0"
                max="100"
                name="score"
                value={gradeData.score}
                onChange={(e) => setGradeData(prev => ({ ...prev, score: e.target.value }))}
                required
                className="border-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Feedback</label>
              <Textarea
                placeholder="Provide feedback for the student"
                name="feedback"
                value={gradeData.feedback}
                onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                rows={4}
                className="border-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
              {isLoading ? 'Grading...' : 'Grade Submission'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{assignmentToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submissions Dialog */}
      <Dialog open={isSubmissionsDialogOpen} onOpenChange={setIsSubmissionsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] border-0 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Submissions - {selectedAssignment?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedAssignment?.submissions && selectedAssignment.submissions.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submission Link</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedAssignment.submissions.map((submission, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{submission.student}</TableCell>
                      <TableCell>{format(new Date(submission.submittedAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          submission.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {submission.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {submission.link ? (
                          <a
                            href={submission.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Link className="h-3 w-3" />
                            View
                          </a>
                        ) : (
                          <span className="text-muted-foreground">No link</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.score !== undefined ? (
                          <span className="font-semibold text-green-600">{submission.score}/100</span>
                        ) : (
                          <span className="text-muted-foreground">Not graded</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.score !== undefined ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openGradeDialog(selectedAssignment, submission)}
                            className="flex items-center gap-1"
                          >
                            <MessageSquare className="h-3 w-3" />
                            {submission.feedback ? 'View Feedback' : 'Add Feedback'}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openGradeDialog(selectedAssignment, submission)}
                            className="flex items-center gap-1"
                          >
                            <Star className="h-3 w-3" />
                            Grade
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No submissions yet</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assignments;
