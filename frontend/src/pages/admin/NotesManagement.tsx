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
import { FileText, Plus, Edit, Trash2, Download, Eye, ArrowLeft } from "lucide-react";
import api from '@/api/axios';

interface Note {
  _id: string;
  title: string;
  subject: string;
  description: string;
  classId?: string;
  author: {
    _id: string;
    username: string;
  };
  authorName: string;
  uploadDate: string;
  rating: number;
  downloads: number;
  pages: number;
  fileType: string;
  fileName: string;
  tags: string[];
  isPublic: boolean;
}

interface Class {
  _id: string;
  name: string;
  code: string;
}

const NotesManagement = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    classId: '',
    isPublic: true
  });

  useEffect(() => {
    fetchNotes();
    fetchClasses();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/api/notes');
      setNotes((response.data as any)?.notes || (response.data as any)?.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notes",
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
      const data = {
        ...formData,
        classId: formData.classId === 'none' ? '' : formData.classId
      };

      if (editingNote) {
        await api.put(`/api/notes/${editingNote._id}`, data);
        toast({
          title: "Success",
          description: "Note updated successfully"
        });
      } else {
        await api.post('/api/notes', data);
        toast({
          title: "Success",
          description: "Note created successfully"
        });
      }
      setDialogOpen(false);
      resetForm();
      fetchNotes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save note",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      subject: note.subject,
      description: note.description,
      classId: note.classId || '',
      isPublic: note.isPublic
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;

    try {
      await api.delete(`/api/notes/${noteToDelete._id}`);
      toast({
        title: "Success",
        description: "Note deleted successfully"
      });
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
      fetchNotes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete note",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = (note: Note) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  const handleTogglePublic = async (note: Note) => {
    try {
      await api.put(`/api/notes/${note._id}`, { isPublic: !note.isPublic });
      toast({
        title: "Success",
        description: `Note is now ${note.isPublic ? 'private' : 'public'}`
      });
      fetchNotes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update note",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      description: '',
      classId: '',
      isPublic: true
    });
    setEditingNote(null);
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
            <h1 className="text-3xl font-bold">Notes Management</h1>
            <p className="text-muted-foreground">Create and manage study notes</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingNote(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
              <DialogDescription>
                {editingNote ? 'Update the note information below.' : 'Fill in the details to create a new note.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="class">Assign to Class (Optional)</Label>
                  <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No class</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls._id} value={cls._id}>
                          {cls.code} - {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isPublic">Make public</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingNote ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notes</CardTitle>
          <CardDescription>Manage study materials and resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[18%]">Title</TableHead>
                  <TableHead className="w-[12%]">Subject</TableHead>
                  <TableHead className="w-[12%]">Author</TableHead>
                  <TableHead className="w-[10%]">Class</TableHead>
                  <TableHead className="w-[10%]">Downloads</TableHead>
                  <TableHead className="w-[10%]">Rating</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="w-[18%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow key={note._id}>
                    <TableCell className="font-medium w-[18%]">{note.title}</TableCell>
                    <TableCell className="w-[12%]">{note.subject}</TableCell>
                    <TableCell className="w-[12%]">{note.authorName}</TableCell>
                    <TableCell className="w-[10%]">
                      {note.classId ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          Assigned
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="w-[10%]">
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {note.downloads}
                      </div>
                    </TableCell>
                    <TableCell className="w-[10%]">
                      <div className="flex items-center">
                        <span className="mr-1">{note.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[10%]">
                      <span className={`px-2 py-1 rounded-full text-xs ${note.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {note.isPublic ? 'Public' : 'Private'}
                      </span>
                    </TableCell>
                    <TableCell className="w-[18%] text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleTogglePublic(note)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(note)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => confirmDelete(note)}>
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
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note "{noteToDelete?.title}"? This action cannot be undone.
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

export default NotesManagement;
