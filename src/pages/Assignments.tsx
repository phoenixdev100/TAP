
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, CheckCheck, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Assignments = () => {
  const { toast } = useToast();
  
  const handleAddAssignment = () => {
    toast({
      title: "Coming Soon",
      description: "The add assignment feature will be available in the next update.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assignments & Exams</h2>
          <p className="text-muted-foreground">
            Track your upcoming deadlines and exams
          </p>
        </div>
        <Button onClick={handleAddAssignment}>
          Add Assignment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <span>Upcoming</span>
              <CalendarClock className="h-5 w-5" />
            </CardTitle>
            <CardDescription>Due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              No upcoming assignments. Add one to get started.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-red-100 rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <span>Urgent</span>
              <Clock className="h-5 w-5" />
            </CardTitle>
            <CardDescription>Due in the next 48 hours</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              No urgent assignments due.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-green-100 rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <span>Completed</span>
              <CheckCheck className="h-5 w-5" />
            </CardTitle>
            <CardDescription>Recently completed tasks</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              No completed assignments yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assignments;
