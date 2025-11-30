import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Search, Upload, Bookmark, ThumbsUp, Clock, Download, Eye, Star, Filter, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Notes = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    subject: "",
    description: "",
    tags: "",
    isPublic: true,
    file: null
  });
  const [uploading, setUploading] = useState(false);
  
  const categories = [
    { id: "all", label: "All Notes", icon: FileText },
    { id: "bookmarked", label: "Bookmarked", icon: Bookmark },
    { id: "popular", label: "Popular", icon: Star },
  ];

  // Fetch notes from API
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/notes?category=${selectedCategory}&search=${searchQuery}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch notes",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes on component mount and when filters change
  useEffect(() => {
    fetchNotes();
  }, [selectedCategory, searchQuery]);

  const handleUpload = () => {
    setUploadDialogOpen(true);
  };

  const handleBookmark = async (noteId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notes/${noteId}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: data.message,
          duration: 2000,
        });
        fetchNotes(); // Refresh notes
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update bookmark",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    }
  };

  const handleLike = async (noteId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notes/${noteId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: data.message,
          duration: 2000,
        });
        fetchNotes(); // Refresh notes
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update like",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (noteId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notes/${noteId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Download Started",
          description: "Your note download has started.",
          duration: 2000,
        });
        fetchNotes(); // Refresh to update download count
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to download note",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error downloading note:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    
    if (!uploadForm.title || !uploadForm.subject || !uploadForm.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('subject', uploadForm.subject);
      formData.append('description', uploadForm.description);
      formData.append('tags', uploadForm.tags);
      formData.append('isPublic', uploadForm.isPublic.toString());
      
      const response = await fetch('http://localhost:5000/api/notes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Note uploaded successfully",
          duration: 3000,
        });
        setUploadDialogOpen(false);
        setUploadForm({
          title: "",
          subject: "",
          description: "",
          tags: "",
          isPublic: true,
          file: null
        });
        fetchNotes(); // Refresh notes
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to upload note",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error uploading note:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchNotes();
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen w-full flex flex-col pb-10 sm:pb-0 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Notes & Study Material
            {user?.role === 'student' && (
              <span className="ml-2 text-sm text-muted-foreground font-normal block sm:inline">
                (Student View)
              </span>
            )}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            {user?.role === 'student' 
              ? 'Access and download study materials shared by teachers and peers'
              : 'Upload, manage, and share study materials with students'
            }
          </p>
        </div>
        {user?.role !== 'student' && (
          <Button 
            onClick={handleUpload}
            className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Notes</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes, subjects, or materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <Button
          variant="outline"
          className="h-12 border-2 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 h-auto p-1 bg-muted rounded-lg">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-2 py-2.5 px-3 text-sm sm:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7C3AED] data-[state=active]:to-[#A855F7] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        {/* All Notes Tab */}
        <TabsContent value="all" className="pt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">No Notes Found</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery ? "No notes match your search criteria." : "No notes available yet. Be the first to upload!"}
              </p>
              {!searchQuery && user?.role !== 'student' && (
                <Button 
                  onClick={handleUpload}
                  className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white shadow-lg transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" /> Upload First Note
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <Card key={note._id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200 dark:hover:border-purple-800 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {note.title}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {note.subject}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {note.pages || 0} pages
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {note.rating || '0.0'}
                        </div>
                        <span className="text-xs text-muted-foreground">{note.fileType?.split('/')[1]?.toUpperCase() || 'PDF'}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {note.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags?.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      )) || []}
                      {note.tags?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(note.uploadDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {note.downloads || 0}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 border-t">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-muted-foreground">
                        by {note.authorName || note.author?.username || 'Unknown'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(note._id)}
                          className={`h-8 w-8 p-0 transition-colors ${
                            note.isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
                          }`}
                        >
                          <ThumbsUp className={`h-4 w-4 ${note.isLiked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(note._id)}
                          className={`h-8 w-8 p-0 transition-colors ${
                            note.isBookmarked ? 'text-purple-500 hover:text-purple-600' : 'hover:text-purple-500'
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${note.isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(note._id, note.fileName)}
                          className="h-8 w-8 p-0 hover:text-green-600 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Bookmarked Tab */}
        <TabsContent value="bookmarked" className="pt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 rounded-full flex items-center justify-center mb-4">
                <Bookmark className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">No Bookmarks Yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't bookmarked any notes or study materials yet. Save your favorite notes for quick access!
              </p>
              <Button 
                variant="outline"
                className="border-2 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                onClick={() => setSelectedCategory('all')}
              >
                <Eye className="mr-2 h-4 w-4" /> Browse Notes
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <Card key={note._id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200 dark:hover:border-purple-800 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {note.title}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {note.subject}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {note.pages || 0} pages
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {note.rating || '0.0'}
                        </div>
                        <span className="text-xs text-muted-foreground">{note.fileType?.split('/')[1]?.toUpperCase() || 'PDF'}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {note.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags?.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      )) || []}
                      {note.tags?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(note.uploadDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {note.downloads || 0}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 border-t">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-muted-foreground">
                        by {note.authorName || note.author?.username || 'Unknown'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(note._id)}
                          className={`h-8 w-8 p-0 transition-colors ${
                            note.isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
                          }`}
                        >
                          <ThumbsUp className={`h-4 w-4 ${note.isLiked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(note._id)}
                          className={`h-8 w-8 p-0 transition-colors ${
                            note.isBookmarked ? 'text-purple-500 hover:text-purple-600' : 'hover:text-purple-500'
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${note.isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(note._id, note.fileName)}
                          className="h-8 w-8 p-0 hover:text-green-600 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Popular Tab */}
        <TabsContent value="popular" className="pt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-full flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">No Popular Notes Yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Popular notes will appear here once they get more downloads and ratings.
              </p>
              <Button 
                variant="outline"
                className="border-2 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                onClick={() => setSelectedCategory('all')}
              >
                <Eye className="mr-2 h-4 w-4" /> Browse All Notes
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <Card key={note._id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200 dark:hover:border-purple-800 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {note.title}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {note.subject}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {note.pages || 0} pages
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {note.rating || '0.0'}
                        </div>
                        <span className="text-xs text-muted-foreground">{note.fileType?.split('/')[1]?.toUpperCase() || 'PDF'}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {note.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags?.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      )) || []}
                      {note.tags?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(note.uploadDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {note.downloads || 0}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 border-t">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-muted-foreground">
                        by {note.authorName || note.author?.username || 'Unknown'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(note._id)}
                          className={`h-8 w-8 p-0 transition-colors ${
                            note.isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
                          }`}
                        >
                          <ThumbsUp className={`h-4 w-4 ${note.isLiked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(note._id)}
                          className={`h-8 w-8 p-0 transition-colors ${
                            note.isBookmarked ? 'text-purple-500 hover:text-purple-600' : 'hover:text-purple-500'
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${note.isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(note._id, note.fileName)}
                          className="h-8 w-8 p-0 hover:text-green-600 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] border-0 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Upload New Note
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Note Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter note title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  required
                  className="border-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics, Computer Science"
                  value={uploadForm.subject}
                  onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
                  required
                  className="border-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your note content..."
                value={uploadForm.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                required
                rows={3}
                className="border-2 focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., calculus, mathematics, exam"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                className="border-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">File *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  {uploadForm.file ? (
                    <div className="space-y-2">
                      <FileText className="mx-auto h-8 w-8 text-purple-600" />
                      <p className="text-sm font-medium">{uploadForm.file.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF, Word, or text files (MAX. 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={uploadForm.isPublic}
                onChange={(e) => setUploadForm({...uploadForm, isPublic: e.target.checked})}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <Label htmlFor="isPublic" className="text-sm font-medium">
                Make this note public (visible to all users)
              </Label>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                className="border-2 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white shadow-lg transition-all duration-300"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Note
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notes;
