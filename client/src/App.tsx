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

// Fashion subcategory pages
import WomenPage from "@/pages/fashion/WomenPage";
import MenPage from "@/pages/fashion/MenPage";
import KidsPage from "@/pages/fashion/KidsPage";
import HomePage from "@/pages/fashion/HomePage";
import ElectronicsPage from "@/pages/fashion/ElectronicsPage";
import PetsPage from "@/pages/fashion/PetsPage";
import BeautyWellnessPage from "@/pages/fashion/BeautyWellnessPage";
import SportsOutdoorsPage from "@/pages/fashion/SportsOutdoorsPage";
import BrandsPage from "@/pages/fashion/BrandsPage";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes - accessible to all users */}
      <Route path="/fashion/women" component={WomenPage} />
      <Route path="/fashion/men" component={MenPage} />
      <Route path="/fashion/kids" component={KidsPage} />
      <Route path="/fashion/home" component={HomePage} />
      <Route path="/fashion/electronics" component={ElectronicsPage} />
      <Route path="/fashion/pets" component={PetsPage} />
      <Route path="/fashion/beauty-wellness" component={BeautyWellnessPage} />
      <Route path="/fashion/sports-outdoors" component={SportsOutdoorsPage} />
      <Route path="/fashion/brands" component={BrandsPage} />
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
        path="/marketplace/:vertical/:category?"
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
