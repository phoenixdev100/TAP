
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Search, Upload, Bookmark, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Notes = () => {
  const { toast } = useToast();
  
  const handleUpload = () => {
    toast({
      title: "Coming Soon",
      description: "The upload notes feature will be available in the next update.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notes & Study Material</h2>
          <p className="text-muted-foreground">
            Access, upload, and share study materials
          </p>
        </div>
        <Button onClick={handleUpload}>
          <Upload className="mr-2 h-4 w-4" /> Upload Notes
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes, subjects, or materials..."
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="my">My Uploads</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" /> 
                    {["Calculus Notes", "Data Structures", "Physics Formulas"][i]}
                  </CardTitle>
                  <CardDescription>
                    {["Mathematics", "Computer Science", "Physics"][i]}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {[
                      "Complete lecture notes for Calculus III, including integrals and series.",
                      "Comprehensive guide to data structures with examples.",
                      "Quick reference for all important physics formulas and equations."
                    ][i]}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    Uploaded by Prof. {["Smith", "Johnson", "Williams"][i]}
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="my" className="pt-4">
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Uploads Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven't uploaded any notes or study materials yet.
            </p>
            <Button onClick={handleUpload} className="mt-4">
              <Upload className="mr-2 h-4 w-4" /> Upload Your First Note
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="bookmarked" className="pt-4">
          <div className="text-center py-12">
            <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Bookmarks Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven't bookmarked any notes or study materials yet.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="popular" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 2 }, (_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" /> 
                    {["Programming Basics", "Chemistry Reference"][i]}
                  </CardTitle>
                  <CardDescription>
                    {["Computer Science", "Chemistry"][i]}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {[
                      "Introduction to programming concepts and basics of syntax.",
                      "Comprehensive reference guide for organic chemistry reactions."
                    ][i]}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    {["4.9 ★ (120 ratings)", "4.7 ★ (98 ratings)"][i]}
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notes;
