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
import { User, Plus, Edit, Trash2, BookOpen, ArrowLeft, Search } from "lucide-react";
import { motion } from "framer-motion";
import api from '@/api/axios';
import Loader from '@/components/Loader';
import logger from '@/utils/logger';

interface Student {
  _id: string;
  username: string;
  email: string;
  role: string;
  enrolledClasses: Array<{
    _id: string;
    name: string;
    code: string;
  }>;
}

interface Class {
  _id: string;
  name: string;
  code: string;
}

const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });

  const [assignFormData, setAssignFormData] = useState({
    classId: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [searchQuery]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/users?role=student');
      let allStudents = (response.data as any)?.data || [];

      // Filter by search
      if (searchQuery) {
        allStudents = allStudents.filter((student: Student) =>
          student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setStudents(allStudents);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
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
      logger.error('Failed to fetch classes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/api/users/${editingStudent._id}`, formData);
        toast({
          title: "Success",
          description: "Student updated successfully"
        });
      } else {
        await api.post('/api/users', formData);
        toast({
          title: "Success",
          description: "Student created successfully"
        });
      }
      setDialogOpen(false);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save student",
        variant: "destructive"
      });
    }
  };

  const handleAssignClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !assignFormData.classId) return;

    try {
      await api.post(`/api/classes/${assignFormData.classId}/enroll`, {
        studentId: selectedStudent._id
      });
      toast({
        title: "Success",
        description: "Student enrolled successfully"
      });
      setAssignDialogOpen(false);
      setAssignFormData({ classId: '' });
      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to enroll student",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      username: student.username,
      email: student.email,
      password: '',
      role: student.role
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;

    try {
      await api.delete(`/api/users/${studentToDelete._id}`);
      toast({
        title: "Success",
        description: "Student deleted successfully"
      });
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete student",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleRemoveClass = async (studentId: string, classId: string) => {
    try {
      await api.delete(`/api/classes/${classId}/students/${studentId}`);
      toast({
        title: "Success",
        description: "Student removed from class successfully"
      });
      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove student from class",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'student'
    });
    setEditingStudent(null);
  };

  if (loading) {
    return <Loader text="Loading students..." />;
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin-dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Student Management
            </h2>
            <p className="text-muted-foreground dark:text-gray-400 text-sm sm:text-base">
              Create students and assign to classes
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStudent(null)} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white shadow-lg transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Create Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingStudent ? 'Edit Student' : 'Create New Student'}</DialogTitle>
              <DialogDescription>
                {editingStudent ? 'Update the student information below.' : 'Fill in the details to create a new student.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Full Name</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {!editingStudent && (
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">{editingStudent ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-800/50 dark:border-slate-600 rounded-2xl"
          />
        </div>
      </motion.div>

      {/* Students List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {students.map((student) => (
          <Card key={student._id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-2 dark:border-slate-700">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <CardTitle className="text-base sm:text-lg font-semibold truncate">{student.username}</CardTitle>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground truncate">{student.email}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">•</span>
                  <div className="flex flex-wrap gap-1">
                    {student.enrolledClasses?.length > 0 ? (
                      student.enrolledClasses.map((cls) => (
                        <span key={cls._id} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs flex items-center gap-1">
                          {cls.code}
                          <button
                            onClick={() => handleRemoveClass(student._id, cls._id)}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Not enrolled</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Dialog open={assignDialogOpen && selectedStudent?._id === student._id} onOpenChange={(open) => {
                    setAssignDialogOpen(open);
                    if (open) setSelectedStudent(student);
                    else setSelectedStudent(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enroll {student.username} in Class</DialogTitle>
                        <DialogDescription>Select a class to enroll this student</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAssignClass}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="class">Select Class</Label>
                            <Select value={assignFormData.classId} onValueChange={(value) => setAssignFormData({ classId: value })}>
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
                        </div>
                        <DialogFooter>
                          <Button type="submit">Enroll Student</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(student)} className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => confirmDelete(student)} className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </motion.div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {studentToDelete?.username}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;
