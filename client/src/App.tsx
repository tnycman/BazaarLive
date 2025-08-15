import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Feed from "@/pages/feed";
import HomePageEnterprise from "@/pages/HomePageEnterprise";
import CreateListing from "@/pages/create-listing";
import Profile from "@/pages/profile";
import AnalyticsDashboard from "@/pages/analytics/AnalyticsDashboard";
import AIAssistant from "@/pages/ai-assistant";
import UniversalCategoryPage from "@/components/universal/UniversalCategoryPage";

// Fashion root redirect to prevent 404
const FashionRootRedirect: React.FC = () => {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate('/fashion/women', { replace: true });
  }, [navigate]);
  return null;
};

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Fashion category routes with width standardization */}
      <Route path="/fashion" component={FashionRootRedirect} />
      <Route path="/fashion/:subcategory" 
             component={({ params }) => (
               <UniversalCategoryPage 
                 category="fashion" 
                 subcategory={params.subcategory} 
               />
             )} 
      />
      <Route path="/fashion/:subcategory/:subSubcategory" 
             component={({ params }) => (
               <UniversalCategoryPage 
                 category="fashion" 
                 subcategory={params.subcategory} 
                 subSubcategory={params.subSubcategory}
               />
             )} 
      />

      {/* Main application routes */}
      <Route path="/" component={isAuthenticated ? Feed : Landing} />
      <Route path="/feed" component={Feed} />
      <Route path="/home" component={HomePageEnterprise} />
      <Route path="/create" component={CreateListing} />
      <Route path="/profile" component={Profile} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('[App] Critical error:', error);
    return (
      <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b' }}>
        <h1>Application Error</h1>
        <p>There was an error loading the application. Check console for details.</p>
      </div>
    );
  }
}

export default App;
