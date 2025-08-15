import { Switch, Route, useLocation } from "wouter";
import { useEffect, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
// Essential page imports - Core functionality only
import { lazy } from "react";
// Core pages (immediate load)
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
// Lazy-loaded pages to prevent cyclic dependencies
const Feed = lazy(() => import("@/pages/feed"));
const UniversalCategoryPage = lazy(() => import("@/components/universal/UniversalCategoryPage"));
const Marketplace = lazy(() => import("@/pages/marketplace"));
const CreateListing = lazy(() => import("@/pages/create-listing"));
const Profile = lazy(() => import("@/pages/profile"));
const AIAssistant = lazy(() => import("@/pages/ai-assistant"));
const AnalyticsDashboard = lazy(() => import("@/pages/analytics/AnalyticsDashboard"));

// Fashion root redirect
const FashionRootRedirect = () => {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate('/fashion/women', { replace: true });
  }, [navigate]);
  return null;
};

// Loading component for Suspense
const LoadingPage = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    fontSize: '18px' 
  }}>
    Loading...
  </div>
);

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <Switch>
        {/* Fashion Category Routes (with width standardization) */}
        <Route path="/fashion" component={FashionRootRedirect} />
        <Route path="/fashion/:subcategory" 
               component={({ params }) => (
                 <UniversalCategoryPage 
                   category="fashion" 
                   subcategory={params.subcategory} 
                 />
               )} 
        />

        {/* Core Application Routes */}
        <Route path="/" component={isAuthenticated ? Feed : Landing} />
        <Route path="/feed" component={Feed} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/create-listing" component={CreateListing} />
        <Route path="/profile/:username?" component={Profile} />
        <Route path="/ai-assistant" component={AIAssistant} />
        <Route path="/analytics" component={AnalyticsDashboard} />
        
        {/* 404 Handler */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}



export default App;
