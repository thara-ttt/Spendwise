
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Recurring from "./pages/Recurring";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import Shared from "./pages/Shared";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/auth" 
              element={session ? <Navigate to="/" /> : <Auth />}
            />
            <Route 
              path="/" 
              element={
                <AppLayout session={session}>
                  <Dashboard />
                </AppLayout>
              } 
            />
            <Route 
              path="/expenses" 
              element={
                <AppLayout session={session}>
                  <Expenses />
                </AppLayout>
              } 
            />
            <Route 
              path="/recurring" 
              element={
                <AppLayout session={session}>
                  <Recurring />
                </AppLayout>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <AppLayout session={session}>
                  <Reports />
                </AppLayout>
              } 
            />
            <Route 
              path="/categories" 
              element={
                <AppLayout session={session}>
                  <Categories />
                </AppLayout>
              } 
            />
            <Route 
              path="/shared" 
              element={
                <AppLayout session={session}>
                  <Shared />
                </AppLayout>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <AppLayout session={session}>
                  <Settings />
                </AppLayout>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
