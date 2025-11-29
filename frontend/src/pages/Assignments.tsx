
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  User
} from 'lucide-react';
import { format } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  className: string;
  status?: string;
  score?: number | null;
  submittedAt?: string;
  submissionFile?: string | null;
  totalSubmissions?: number;
  gradedSubmissions?: number;
  pendingGrading?: number;
  teacher?: string;
  submissions?: Array<{
    student: string;
    studentId: string;
    submittedAt: string;
    score?: number;
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    className: '',
    assignedTo: [] as string[]
  });
  const [submissionData, setSubmissionData] = useState({
    submissionText: '',
    file: null as File | null,
    fileData: '',
    fileName: '',
    fileType: ''
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
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to fetch assignments",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64String = event.target.result as string;
          // Remove the data URL prefix to get pure base64
          const pureBase64 = base64String.split(',')[1];
          setSubmissionData(prev => ({ 
            ...prev, 
            file: file,
            fileData: pureBase64,
            fileName: file.name,
            fileType: file.type
          }));
        }
      };
      
      reader.readAsDataURL(file);
    }
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
          assignedTo: []
        });
        fetchAssignments();
      } else {
        throw new Error(response.data.message || 'Failed to create assignment');
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error);
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
      console.error('Error updating assignment:', error);
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
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const response = await api.delete<ApiResponse<Assignment>>(`/api/assignments/${id}`);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Assignment deleted successfully",
          duration: 5000,
        });
        fetchAssignments();
      } else {
        throw new Error(response.data.message || 'Failed to delete assignment');
      }
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
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
        submissionText: submissionData.submissionText,
        fileData: submissionData.fileData,
        fileName: submissionData.fileName,
        fileType: submissionData.fileType
      }) as any;

      if ((response.data as any).success) {
        toast({
          title: "Success",
          description: "Assignment submitted successfully",
          duration: 5000,
        });
        setIsSubmitDialogOpen(false);
        setSelectedAssignment(null);
        setSubmissionData({ submissionText: '', file: null, fileData: '', fileName: '', fileType: '' });
        fetchAssignments();
      } else {
        throw new Error((response.data as any).message || 'Failed to submit assignment');
      }
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
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
      console.error('Error grading submission:', error);
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
    setFormData({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      className: assignment.className,
      assignedTo: []
    });
    setIsEditDialogOpen(true);
  };

  const openSubmitDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionData({ submissionText: '', file: null, fileData: '', fileName: '', fileType: '' });
    setIsSubmitDialogOpen(true);
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
    <div className="min-h-screen w-full flex flex-col pb-10 sm:pb-0 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Assignments
            {user?.role === 'student' && (
              <span className="ml-2 text-sm text-muted-foreground font-normal block sm:inline">
                (Student View)
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
                <Input
                  placeholder="Class Name"
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  required
                  className="border-2 focus:ring-2 focus:ring-purple-500"
                />
                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                  {isLoading ? 'Creating...' : 'Create Assignment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="bg-blue-100 rounded-t-lg py-3 sm:py-4">
            <CardTitle className="flex items-center justify-between text-sm sm:text-lg">
              <span className="text-sm sm:text-base">Total</span>
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-2xl sm:text-3xl font-bold text-center">{stats.total}</p>
            <p className="text-center text-muted-foreground text-xs sm:text-sm">Assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-green-100 rounded-t-lg py-3 sm:py-4">
            <CardTitle className="flex items-center justify-between text-sm sm:text-lg">
              <span className="text-sm sm:text-base">Completed</span>
              <CheckCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-2xl sm:text-3xl font-bold text-center">{stats.completed}</p>
            <p className="text-center text-muted-foreground text-xs sm:text-sm">Submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-amber-100 rounded-t-lg py-3 sm:py-4">
            <CardTitle className="flex items-center justify-between text-sm sm:text-lg">
              <span className="text-sm sm:text-base">Pending</span>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-2xl sm:text-3xl font-bold text-center">{stats.pending}</p>
            <p className="text-center text-muted-foreground text-xs sm:text-sm">To Do</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-red-100 rounded-t-lg py-3 sm:py-4">
            <CardTitle className="flex items-center justify-between text-sm sm:text-lg">
              <span className="text-sm sm:text-base">Overdue</span>
              <CalendarClock className="h-4 w-4 sm:h-5 sm:w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-2xl sm:text-3xl font-bold text-center">{stats.overdue}</p>
            <p className="text-center text-muted-foreground text-xs sm:text-sm">Late</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                {user?.role === 'student' 
                  ? 'No assignments assigned to you yet.'
                  : 'No assignments created yet. Create one to get started.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-lg sm:text-xl">{assignment.title}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">{assignment.description}</CardDescription>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="font-medium">{assignment.className}</span>
                      <span>Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}</span>
                      {assignment.teacher && <span>Teacher: {assignment.teacher}</span>}
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 sm:gap-2">
                    {user?.role === 'student' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSubmitDialog(assignment)}
                          disabled={assignment.status === 'completed'}
                          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        >
                          <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">{assignment.status === 'completed' ? 'Submitted' : 'Submit'}</span>
                          <span className="sm:hidden">{assignment.status === 'completed' ? 'Done' : 'Sub'}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">View</span>
                          <span className="sm:hidden">👁</span>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(assignment)}
                          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Edit</span>
                          <span className="sm:hidden">✏</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(assignment.id)}
                          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Delete</span>
                          <span className="sm:hidden">🗑</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              {user?.role !== 'student' && assignment.submissions && assignment.submissions.length > 0 && (
                <CardContent className="border-t">
                  <h4 className="font-semibold mb-3">Submissions ({assignment.submissions.length})</h4>
                  <div className="space-y-2">
                    {assignment.submissions.map((submission, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{submission.student}</span>
                          <span className="text-sm text-muted-foreground">
                            Submitted: {format(new Date(submission.submittedAt), 'MMM dd, yyyy')}
                          </span>
                          {submission.fileData && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadFile(assignment.id, submission.studentId, submission.originalFileName || 'file')}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              File
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {submission.score !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-green-600">{submission.score}/100</span>
                              {submission.feedback && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  Feedback
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openGradeDialog(assignment, submission)}
                              className="flex items-center gap-1"
                            >
                              <Star className="h-3 w-3" />
                              Grade
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

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
            <Input
              placeholder="Class Name"
              name="className"
              value={formData.className}
              onChange={handleInputChange}
              required
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
            <Textarea
              placeholder="Write your submission text here (optional)"
              name="submissionText"
              value={submissionData.submissionText}
              onChange={(e) => setSubmissionData(prev => ({ ...prev, submissionText: e.target.value }))}
              rows={4}
              className="border-2 focus:ring-2 focus:ring-purple-500"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload File (optional)</label>
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
                className="border-2 focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: Images, PDFs, Documents, ZIP (Max 10MB)
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
    </div>
  );
};

export default Assignments;
