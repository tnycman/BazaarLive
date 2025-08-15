import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
// import { routeConfigService } from "@/services/routing/RouteConfigService";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Feed from "@/pages/feed";
import Home from "@/pages/home";
import HomePageEnterprise from "@/pages/HomePageEnterprise";
// import Marketplace from "@/pages/marketplace";
import CreateListing from "@/pages/create-listing";
import Profile from "@/pages/profile";
import AnalyticsDashboard from "@/pages/analytics/AnalyticsDashboard";
import AIAssistant from "@/pages/ai-assistant";
import BrandsIndex from "@/pages/brands/index";
import BrandSegmentPage from "@/pages/brands/segments/[segment]";
import BrandUniversalAdapter from "@/components/universal/BrandUniversalAdapter";
// Universal Category Page Component - Single unified component for ALL categories
import UniversalCategoryPage from "@/components/universal/UniversalCategoryPage";
// Removed legacy test/simple pages to prevent regressions
import MetricsDashboard from "@/pages/dev/MetricsDashboard";

// Redirect `/fashion` root to a default section to avoid 404s and ensure UX consistency
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
      {/* Universal Category Routes - Unified routing architecture using UniversalCategoryPage */}
      {import.meta.env.MODE === 'development' && (
        <Route path="/__metrics" component={() => <MetricsDashboard />} />
      )}
      {/* Handle fashion root explicitly to prevent unmatched route */}
      <Route path="/fashion" component={FashionRootRedirect} />
      <Route path="/fashion/brands" component={BrandsIndex} />
      <Route path="/fashion/brands/segments/:segment" component={BrandSegmentPage} />
      <Route path="/fashion/brands/:brand" component={BrandUniversalAdapter} />
      <Route path="/fashion/:section" component={({ params }) => {
        const section = (params?.section || '').toLowerCase();
        return <UniversalCategoryPage category="fashion" subcategory={section} />;
      }} />
      <Route path="/fashion/:section/:subsection" component={({ params }) => {
        const section = (params?.section || '').toLowerCase();
        const subsection = (params?.subsection || '').toLowerCase();
        return <UniversalCategoryPage category="fashion" subcategory={section} subSubcategory={subsection} />;
      }} />
      <Route path="/fashion/:section/:subsection/:leaf" component={({ params }) => {
        const section = (params?.section || '').toLowerCase();
        const subsection = (params?.subsection || '').toLowerCase();
        const leaf = (params?.leaf || '').toLowerCase();
        return <UniversalCategoryPage category="fashion" subcategory={section} subSubcategory={subsection} leaf={leaf} />;
      }} />
      
      {/* Marketplace root deprecated for category navigation */}
      
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
