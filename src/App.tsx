import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TrafficControl from "./pages/TrafficControl";
import About from "./pages/About";
import Help from "./pages/Help";
import SmartTraffic from "./pages/SmartTraffic";

import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Map-heavy pages load on demand so the rest of the app stays fast
const Planner = lazy(() => import("./pages/Planner"));
const RwandaMap = lazy(() => import("./pages/RwandaMap"));

const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center text-primary">Loading…</div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/smart-traffic" element={<SmartTraffic />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/map" element={<RwandaMap />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/traffic-control" 
            element={
              <ProtectedRoute>
                <TrafficControl />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
