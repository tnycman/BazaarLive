import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { routeConfigService } from "@/services/routing/RouteConfigService";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Feed from "@/pages/feed";
import Home from "@/pages/home";
import HomePageEnterprise from "@/pages/HomePageEnterprise";
import Marketplace from "@/pages/marketplace";
import CreateListing from "@/pages/create-listing";
import Profile from "@/pages/profile";
import VerticalPage from "@/pages/marketplace/VerticalPage";
import AnalyticsDashboard from "@/pages/analytics/AnalyticsDashboard";
import AIAssistant from "@/pages/ai-assistant";
// Universal Category Page Component - Single unified component for ALL categories
import UniversalCategoryPage from "@/components/universal/UniversalCategoryPage";
import { SimpleCategoryPage } from "@/components/SimpleCategoryPage";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Universal Category Routes - Unified routing architecture using UniversalCategoryPage */}
      <Route path="/fashion/women" component={() => <SimpleCategoryPage />} />
      <Route path="/fashion/men" component={() => <UniversalCategoryPage category="fashion" subcategory="men" />} />
      <Route path="/fashion/kids" component={() => <UniversalCategoryPage category="fashion" subcategory="kids" />} />
      <Route path="/fashion/home" component={() => <UniversalCategoryPage category="fashion" subcategory="home" />} />
      <Route path="/fashion/electronics" component={() => <UniversalCategoryPage category="fashion" subcategory="electronics" />} />
      <Route path="/fashion/pets" component={() => <UniversalCategoryPage category="fashion" subcategory="pets" />} />
      <Route path="/fashion/beauty" component={() => <UniversalCategoryPage category="fashion" subcategory="beauty" />} />
      <Route path="/fashion/sports" component={() => <UniversalCategoryPage category="fashion" subcategory="sports" />} />
      
      {/* Unified subcategory routes using UniversalCategoryPage - Enterprise AOP pattern */}
      <Route path="/fashion/:category/:subcategory" component={({ params }) => (
        <UniversalCategoryPage 
          category="fashion" 
          subcategory={params?.category} 
          subSubcategory={params?.subcategory} 
        />
      )} />
      <Route path="/marketplace/:vertical/:category/:subcategory?" component={({ params }) => (
        <UniversalCategoryPage 
          category={params?.vertical || "marketplace"} 
          subcategory={params?.category} 
          subSubcategory={params?.subcategory} 
        />
      )} />
      <Route path="/marketplace" component={Marketplace} />
      
      {/* Dynamic marketplace vertical routes - public */}
      {routeConfigService.getAllVerticalRoutes().map(verticalRoute => (
        <Route 
          key={verticalRoute.vertical}
          path={`/marketplace/${verticalRoute.vertical}`}
          component={() => <VerticalPage vertical={verticalRoute.vertical} />}
        />
      ))}
      
      {/* Catch-all dynamic routes - public */}
      <Route 
        path="/marketplace/:vertical"
        component={({ params }) => {
          const vertical = params?.vertical;
          if (vertical && routeConfigService.getVerticalRoute(vertical)) {
            return <VerticalPage vertical={vertical} />;
          }
          return <NotFound />;
        }}
      />
      
      {/* Authentication-based routing */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Feed} />
          <Route path="/feed" component={Feed} />
          <Route path="/home" component={HomePageEnterprise} />
          <Route path="/create-listing" component={CreateListing} />
          <Route path="/profile/:username?" component={Profile} />
          <Route path="/analytics" component={AnalyticsDashboard} />
          <Route path="/ai-assistant" component={AIAssistant} />
        </>
      )}
      <Route component={NotFound} />
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
