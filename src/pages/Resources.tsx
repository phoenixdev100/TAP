import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  FileText,
  Link as LinkIcon,
  Download,
  Video,
  BookMarked,
  Library,
  Youtube,
  Globe,
  Calculator,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Resources = () => {
  const studyMaterials = [
    {
      title: "Course Notes",
      description: "Access comprehensive notes for all your subjects",
      icon: FileText,
      link: "#",
      category: "Notes",
      type: "PDF"
    },
    {
      title: "Video Tutorials",
      description: "Watch detailed video explanations of complex topics",
      icon: Video,
      link: "#",
      category: "Videos",
      type: "Video"
    },
    {
      title: "Practice Problems",
      description: "Test your knowledge with practice questions",
      icon: BookMarked,
      link: "#",
      category: "Practice",
      type: "Interactive"
    },
  ];

  const onlineResources = [
    {
      title: "Khan Academy",
      description: "Free online courses and tutorials",
      icon: Globe,
      link: "https://www.khanacademy.org",
      category: "Learning",
      type: "External"
    },
    {
      title: "MIT OpenCourseWare",
      description: "Access MIT course materials",
      icon: Library,
      link: "https://ocw.mit.edu",
      category: "Courses",
      type: "External"
    },
    {
      title: "Coursera",
      description: "Online courses from top universities",
      icon: BookOpen,
      link: "https://www.coursera.org",
      category: "Courses",
      type: "External"
    },
  ];

  const tools = [
    {
      title: "Scientific Calculator",
      description: "Online scientific calculator for complex calculations",
      icon: Calculator,
      link: "#",
      category: "Tools",
      type: "Web App"
    },
    {
      title: "Citation Generator",
      description: "Generate citations in various formats",
      icon: FileText,
      link: "#",
      category: "Tools",
      type: "Web App"
    },
    {
      title: "Educational Videos",
      description: "Curated educational video content",
      icon: Youtube,
      link: "#",
      category: "Videos",
      type: "External"
    },
  ];

  const ResourceCard = ({ resource }: { resource: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <resource.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{resource.title}</h3>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </div>
          </div>
          <Badge variant="secondary">{resource.type}</Badge>
        </div>
        <div className="mt-auto pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(resource.link, "_blank")}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Access Resource
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Library className="h-8 w-8 text-primary" />
          Academic Resources
        </h1>
        <p className="text-muted-foreground">
          Access study materials, online resources, and helpful tools for your academic success
        </p>
      </motion.div>

      <Tabs defaultValue="materials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="materials">Study Materials</TabsTrigger>
          <TabsTrigger value="online">Online Resources</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studyMaterials.map((resource, index) => (
              <ResourceCard key={index} resource={resource} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="online" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {onlineResources.map((resource, index) => (
              <ResourceCard key={index} resource={resource} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((resource, index) => (
              <ResourceCard key={index} resource={resource} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources; 