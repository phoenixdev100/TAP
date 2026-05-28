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
import { User, Plus, Edit, Trash2, BookOpen, ArrowLeft } from "lucide-react";
import api from '@/api/axios';

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
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/users?role=student');
      setStudents((response.data as any)?.data || []);
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
      console.error('Failed to fetch classes:', error);
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
      await api.post(`/api/classes/${assignFormData.classId}/students`, {
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/api/users/${id}`);
        toast({
          title: "Success",
          description: "Student deleted successfully"
        });
        fetchStudents();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete student",
          variant: "destructive"
        });
      }
    }
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
            <h1 className="text-3xl font-bold">Student Management</h1>
            <p className="text-muted-foreground">Create students and assign to classes</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStudent(null)}>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>Manage your institution's students</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Enrolled Classes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell className="font-medium">{student.username}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.enrolledClasses?.length > 0 ? (
                        student.enrolledClasses.map((cls) => (
                          <span key={cls._id} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs flex items-center gap-1">
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
                        <span className="text-muted-foreground text-sm">Not enrolled</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={assignDialogOpen && selectedStudent?._id === student._id} onOpenChange={(open) => {
                        setAssignDialogOpen(open);
                        if (open) setSelectedStudent(student);
                        else setSelectedStudent(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
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
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(student)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(student._id)}>
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

export default StudentManagement;
