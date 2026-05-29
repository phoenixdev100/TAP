import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Eye, ArrowLeft, Link, FileText, Search, Bookmark, ThumbsUp, Clock, Download, Star, Upload, Lock } from "lucide-react";
import { motion } from "framer-motion";
import api from '@/api/axios';
import Loader from '@/components/Loader';
import logger from '@/utils/logger';

interface Note {
  _id: string;
  title: string;
  subject: string;
  description: string;
  classId?: string;
  className?: string;
  url?: string;
  date?: string;
  author: {
    _id: string;
    username: string;
  };
  authorName: string;
  uploadDate: string;
  pages: number;
  fileType?: string;
  fileName?: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    classId: '',
    className: '',
    url: '',
    date: '',
    isPublic: true
  });

  const categories = [
    { id: "all", label: "All Notes", icon: FileText },
    { id: "public", label: "Public", icon: Eye },
    { id: "private", label: "Private", icon: Lock },
  ];

  useEffect(() => {
    fetchNotes();
    fetchClasses();
  }, [selectedCategory, searchQuery]);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/api/notes');
      let allNotes = (response.data as any)?.notes || (response.data as any)?.data || [];

      // Filter by category
      if (selectedCategory === 'public') {
        allNotes = allNotes.filter((note: Note) => note.isPublic);
      } else if (selectedCategory === 'private') {
        allNotes = allNotes.filter((note: Note) => !note.isPublic);
      }

      // Filter by search
      if (searchQuery) {
        allNotes = allNotes.filter((note: Note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setNotes(allNotes);
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
      logger.error('Failed to fetch classes:', error);
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
    const matchedClass = classes.find(c => c._id === note.classId);
    setFormData({
      title: note.title,
      subject: note.subject,
      description: note.description,
      classId: note.classId || '',
      className: note.className || matchedClass ? `${matchedClass.code} - ${matchedClass.name}` : '',
      url: note.url || '',
      date: note.date || '',
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
      className: '',
      url: '',
      date: '',
      isPublic: true
    });
    setEditingNote(null);
  };

  if (loading) {
    return <Loader text="Loading notes..." />;
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
              Notes Management
            </h2>
            <p className="text-muted-foreground dark:text-gray-400 text-sm sm:text-base">
              Create and manage study notes
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingNote(null)} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white shadow-lg transition-all duration-300">
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
              <div className="grid gap-3 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="class">Assign to Class (Optional)</Label>
                  <Select value={formData.classId} onValueChange={(value) => {
                    const selectedClass = classes.find(c => c._id === value);
                    setFormData(prev => ({
                      ...prev,
                      classId: value,
                      className: selectedClass ? `${selectedClass.code} - ${selectedClass.name}` : '',
                      url: prev.url,
                      date: prev.date
                    }));
                  }}>
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
                  <Label htmlFor="url">URL (Optional)</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
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
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes, subjects, or materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-800/50 dark:border-slate-600 rounded-2xl"
          />
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted dark:bg-slate-800 rounded-2xl">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-2 py-2.5 px-3 text-sm sm:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7C3AED] data-[state=active]:to-[#A855F7] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-xl"
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="pt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="space-y-3">
                {notes.map((note) => (
                  <Card key={note._id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-2 dark:border-slate-700">
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <CardTitle className="text-base sm:text-lg font-semibold truncate">{note.title}</CardTitle>
                            {note.url && (
                              <a
                                href={note.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-primary hover:underline whitespace-nowrap"
                              >
                                <Link className="h-3 w-3" />
                                Link
                              </a>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground hidden sm:inline">{note.subject}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground font-medium">{note.className || '-'}</span>
                          {note.date && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{note.date}</span>
                            </>
                          )}
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{note.authorName}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${note.isPublic ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'}`}>
                            {note.isPublic ? 'Public' : 'Private'}
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => handleTogglePublic(note)} className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(note)} className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(note)} className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

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
