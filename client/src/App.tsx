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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Feed} />
          <Route path="/feed" component={Feed} />
          <Route path="/home" component={Home} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/create-listing" component={CreateListing} />
          <Route path="/profile/:username?" component={Profile} />
          <Route path="/analytics" component={AnalyticsDashboard} />
          
          {/* Dynamic marketplace vertical routes */}
          {routeConfigService.getAllVerticalRoutes().map(verticalRoute => (
            <Route 
              key={verticalRoute.vertical}
              path={`/marketplace/${verticalRoute.vertical}`}
              component={() => <VerticalPage vertical={verticalRoute.vertical} />}
            />
          ))}
          
          {/* Catch-all dynamic routes */}
          <Route 
            path="/marketplace/:vertical/:category?"
            component={({ params }) => {
              const vertical = params?.vertical;
              if (vertical && routeConfigService.getVerticalRoute(vertical)) {
                return <VerticalPage vertical={vertical} />;
              }
              return <NotFound />;
            }}
          />
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
