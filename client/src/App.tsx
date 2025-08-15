import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Feed from "@/pages/feed";
import UniversalCategoryPage from "@/components/universal/UniversalCategoryPage";

// Fashion root redirect
const FashionRootRedirect = () => {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate('/fashion/women', { replace: true });
  }, [navigate]);
  return null;
};

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
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
  }

  return (
    <Switch>
      {/* Fashion routes with width standardization */}
      <Route path="/fashion" component={FashionRootRedirect} />
      <Route path="/fashion/:subcategory" 
             component={({ params }) => (
               <UniversalCategoryPage 
                 category="fashion" 
                 subcategory={params.subcategory} 
               />
             )} 
      />
      
      {/* Main routes */}
      <Route path="/" component={isAuthenticated ? Feed : Landing} />
      
      {/* Default fallback */}
      <Route component={() => <div>Page not found</div>} />
    </Switch>
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
