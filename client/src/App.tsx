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
import Marketplace from "@/pages/marketplace";
import CreateListing from "@/pages/create-listing";
import Profile from "@/pages/profile";
import VerticalPage from "@/pages/marketplace/VerticalPage";
import AnalyticsDashboard from "@/pages/analytics/AnalyticsDashboard";
import DynamicCategoryPage from "@/pages/DynamicCategoryPage";
import AIAssistant from "@/pages/ai-assistant";
import WomenPageEnterprise from "@/pages/fashion/WomenPageEnterprise";
import MenPageEnterprise from "@/pages/fashion/MenPageEnterprise";
import KidsPageEnterprise from "@/pages/fashion/KidsPageEnterprise";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Enterprise fashion routes - using sophisticated domain-driven components */}
      <Route path="/fashion/women" component={WomenPageEnterprise} />
      <Route path="/fashion/men" component={MenPageEnterprise} />
      <Route path="/fashion/kids" component={KidsPageEnterprise} />
      
      {/* Dynamic fashion routes - lower priority fallback */}
      <Route path="/fashion/:category/:subcategory?" component={({ params }) => (
        <DynamicCategoryPage vertical="fashion" category={params?.category} subcategory={params?.subcategory} />
      )} />
      <Route path="/marketplace/:vertical/:category/:subcategory?" component={({ params }) => (
        <DynamicCategoryPage vertical={params?.vertical} category={params?.category} subcategory={params?.subcategory} />
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
          <Route path="/home" component={Home} />
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
