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
import { Users, Plus, Edit, Trash2, BookOpen, ArrowLeft } from "lucide-react";
import api from '@/api/axios';

interface Teacher {
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

const TeacherManagement = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'teacher'
  });

  const [assignFormData, setAssignFormData] = useState({
    classId: ''
  });

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/api/users?role=teacher');
      setTeachers((response.data as any)?.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
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
      if (editingTeacher) {
        await api.put(`/api/users/${editingTeacher._id}`, formData);
        toast({
          title: "Success",
          description: "Teacher updated successfully"
        });
      } else {
        await api.post('/api/users', formData);
        toast({
          title: "Success",
          description: "Teacher created successfully"
        });
      }
      setDialogOpen(false);
      resetForm();
      fetchTeachers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save teacher",
        variant: "destructive"
      });
    }
  };

  const handleAssignClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !assignFormData.classId) return;

    try {
      await api.post(`/api/classes/${assignFormData.classId}/teacher`, {
        teacherId: selectedTeacher._id
      });
      toast({
        title: "Success",
        description: "Class assigned successfully"
      });
      setAssignDialogOpen(false);
      setAssignFormData({ classId: '' });
      fetchTeachers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign class",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      username: teacher.username,
      email: teacher.email,
      password: '',
      role: teacher.role
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;

    try {
      await api.delete(`/api/users/${teacherToDelete._id}`);
      toast({
        title: "Success",
        description: "Teacher deleted successfully"
      });
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
      fetchTeachers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete teacher",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setDeleteDialogOpen(true);
  };

  const handleRemoveClass = async (teacherId: string, classId: string) => {
    try {
      await api.delete(`/api/classes/${classId}/teacher/${teacherId}`);
      toast({
        title: "Success",
        description: "Class removed successfully"
      });
      fetchTeachers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove class",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'teacher'
    });
    setEditingTeacher(null);
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
            <h1 className="text-3xl font-bold">Teacher Management</h1>
            <p className="text-muted-foreground">Create teachers and assign classes</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTeacher(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTeacher ? 'Edit Teacher' : 'Create New Teacher'}</DialogTitle>
              <DialogDescription>
                {editingTeacher ? 'Update the teacher information below.' : 'Fill in the details to create a new teacher.'}
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
                {!editingTeacher && (
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
                <Button type="submit">{editingTeacher ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <CardDescription>Manage your institution's teachers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Name</TableHead>
                  <TableHead className="w-[30%]">Email</TableHead>
                  <TableHead className="w-[30%]">Assigned Classes</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher._id}>
                    <TableCell className="font-medium w-[25%]">{teacher.username}</TableCell>
                    <TableCell className="w-[30%]">{teacher.email}</TableCell>
                    <TableCell className="w-[30%]">
                      <div className="flex flex-wrap gap-1">
                        {teacher.enrolledClasses?.length > 0 ? (
                          teacher.enrolledClasses.map((cls) => (
                            <span key={cls._id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs flex items-center gap-1">
                              {cls.code}
                              <button
                                onClick={() => handleRemoveClass(teacher._id, cls._id)}
                                className="hover:text-red-600"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No classes assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-[15%] text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog open={assignDialogOpen && selectedTeacher?._id === teacher._id} onOpenChange={(open) => {
                          setAssignDialogOpen(open);
                          if (open) setSelectedTeacher(teacher);
                          else setSelectedTeacher(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <BookOpen className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Class to {teacher.username}</DialogTitle>
                              <DialogDescription>Select a class to assign to this teacher</DialogDescription>
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
                                <Button type="submit">Assign Class</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(teacher)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => confirmDelete(teacher)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Teacher</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {teacherToDelete?.username}? This action cannot be undone.
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

export default TeacherManagement;
