import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Calculator, GraduationCap, BookOpen, Award, History, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Course {
  id: number;
  name: string;
  credits: string;
  grade: string;
}

const GPACalculator = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: "", credits: "", grade: "" },
  ]);
  const [gpa, setGpa] = useState<number | null>(null);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [savedCalculations, setSavedCalculations] = useState<{ date: string; gpa: number; courses: number }[]>([]);

  const gradePoints: { [key: string]: number } = {
    "O": 10.0,
    "A+N": 9.0,
    "AN": 8.0,
    "B+N": 7.0,
    "BN": 6.0,
    "C+N": 5.0,
    "CN": 4.0,
    "C-N": 3.0,
    "D+N": 2.0,
    "DN": 1.0,
    "F": 0.0,
  };

  const gradeDescriptions: { [key: string]: string } = {
    "O": "Outstanding",
    "A+": "Excellent",
    "A": "Very Good",
    "A-": "Good",
    "B+": "Above Average",
    "B": "Average",
    "B-": "Below Average",
    "C+": "Fair",
    "C": "Pass",
    "C-": "Weak Pass",
    "D": "Poor",
    "F": "Fail",
  };

  const addCourse = () => {
    setCourses([
      ...courses,
      { id: courses.length + 1, name: "", credits: "", grade: "" },
    ]);
  };

  const removeCourse = (id: number) => {
    if (courses.length > 1) {
      setCourses(courses.filter((course) => course.id !== id));
    } else {
      toast.error("You must have at least one course");
    }
  };

  const updateCourse = (id: number, field: keyof Course, value: string) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      )
    );
  };

  const validateCourse = (course: Course): boolean => {
    if (!course.name.trim()) {
      toast.error("Please enter a course name");
      return false;
    }
    if (!course.credits || parseFloat(course.credits) <= 0) {
      toast.error("Please enter valid credits");
      return false;
    }
    if (!course.grade) {
      toast.error("Please select a grade");
      return false;
    }
    return true;
  };

  const calculateGPA = () => {
    let validationPassed = true;
    let points = 0;
    let credits = 0;

    courses.forEach((course) => {
      if (!validateCourse(course)) {
        validationPassed = false;
        return;
      }

      const courseCredits = parseFloat(course.credits);
      const gradePoint = gradePoints[course.grade];
      points += courseCredits * gradePoint;
      credits += courseCredits;
    });

    if (!validationPassed) return;

    const calculatedGPA = Number((points / credits).toFixed(2));
    setTotalPoints(points);
    setTotalCredits(credits);
    setGpa(calculatedGPA);

    // Save calculation history
    setSavedCalculations([
      {
        date: new Date().toLocaleString(),
        gpa: calculatedGPA,
        courses: courses.length,
      },
      ...savedCalculations.slice(0, 4), // Keep last 5 calculations
    ]);

    toast.success("GPA calculated successfully!");
  };

  const getGPAColor = (gpa: number): string => {
    if (gpa >= 9.0) return "text-green-500";
    if (gpa >= 8.0) return "text-blue-500";
    if (gpa >= 6.0) return "text-yellow-500";
    return "text-red-500";
  };

  const getGradeDescription = (gpa: number): string => {
    if (gpa >= 9.0) return "Outstanding Performance";
    if (gpa >= 8.0) return "Excellent Performance";
    if (gpa >= 7.0) return "Very Good Performance";
    if (gpa >= 6.0) return "Good Performance";
    if (gpa >= 5.0) return "Average Performance";
    return "Needs Improvement";
  };

  return (
    <div className="container max-w-5xl mx-auto p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">GPA Calculator</h1>
        </div>
        <p className="text-muted-foreground">
          Calculate your GPA using the 10-point grading system
        </p>
      </motion.div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="guide">Grade Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {courses.map((course) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-12 gap-4 items-center"
                    >
                      <div className="col-span-5">
                        <Input
                          placeholder="Course Name"
                          value={course.name}
                          onChange={(e) =>
                            updateCourse(course.id, "name", e.target.value)
                          }
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          placeholder="Credits"
                          type="number"
                          min="0"
                          max="6"
                          value={course.credits}
                          onChange={(e) =>
                            updateCourse(course.id, "credits", e.target.value)
                          }
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="col-span-3">
                        <Select
                          value={course.grade}
                          onValueChange={(value) =>
                            updateCourse(course.id, "grade", value)
                          }
                        >
                          <SelectTrigger className="border-primary/20 focus:border-primary">
                            <SelectValue placeholder="Grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(gradePoints).map(([grade, points]) => (
                              <SelectItem key={grade} value={grade}>
                                {grade} ({points.toFixed(1)}) - {gradeDescriptions[grade]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCourse(course.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    onClick={addCourse}
                    className="w-full border-dashed border-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>

                  <Button
                    onClick={calculateGPA}
                    className="w-full"
                    size="lg"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate GPA
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {gpa !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 md:grid-cols-3"
            >
              <Card className="p-6 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </Card>

              <Card className="p-6 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold">{totalCredits}</p>
              </Card>

              <Card className="p-6 text-center relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-medium text-muted-foreground">Your GPA</p>
                  <p className={`text-4xl font-bold ${getGPAColor(gpa)}`}>{gpa}</p>
                  <p className="text-sm text-muted-foreground mt-1">{getGradeDescription(gpa)}</p>
                </div>
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" 
                  style={{
                    clipPath: `polygon(0 ${100 - (gpa / 10) * 100}%, 100% 100%, 0 100%)`
                  }}
                />
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Calculation History</h2>
              </div>
              {savedCalculations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No calculation history yet</p>
              ) : (
                <div className="space-y-4">
                  {savedCalculations.map((calc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-primary/5"
                    >
                      <div>
                        <p className="font-medium">{calc.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {calc.courses} courses
                        </p>
                      </div>
                      <p className={`text-xl font-bold ${getGPAColor(calc.gpa)}`}>
                        {calc.gpa}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Grading Guide</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(gradePoints).map(([grade, points]) => (
                  <div
                    key={grade}
                    className="p-4 rounded-lg bg-primary/5 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{grade}</p>
                      <p className="text-sm text-muted-foreground">
                        {gradeDescriptions[grade]}
                      </p>
                    </div>
                    <p className="text-xl font-bold">{points.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GPACalculator; 