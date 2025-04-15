import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Assignments from "./pages/Assignments";
import Notes from "./pages/Notes";
import Resources from "./pages/Resources";
import Attendance from "./pages/Attendance";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import AuthCheck from "./components/AuthCheck";
import { TooltipProvider } from "@/components/ui/tooltip";
import GPACalculator from "./pages/GPACalculator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route
            path="/"
            element={
              <AuthCheck>
                <Layout>
                  <Dashboard />
                </Layout>
              </AuthCheck>
            }
          />
          <Route
            path="/schedule"
            element={
              <AuthCheck>
                <Layout>
                  <Schedule />
                </Layout>
              </AuthCheck>
            }
          />
          <Route
            path="/assignments"
            element={
              <AuthCheck>
                <Layout>
                  <Assignments />
                </Layout>
              </AuthCheck>
            }
          />
          <Route
            path="/notes"
            element={
              <AuthCheck>
                <Layout>
                  <Notes />
                </Layout>
              </AuthCheck>
            }
          />
          <Route
            path="/attendance"
            element={
              <AuthCheck>
                <Layout>
                  <Attendance />
                </Layout>
              </AuthCheck>
            }
          />
          <Route
            path="/resources"
            element={
              <AuthCheck>
                <Layout>
                  <Resources />
                </Layout>
              </AuthCheck>
            }
          />
          <Route
            path="/gpa-calculator"
            element={
              <AuthCheck>
                <Layout>
                  <GPACalculator />
                </Layout>
              </AuthCheck>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
