// Dynamic vertical page component following enterprise patterns
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from '@/hooks/useRouter';
import { routeConfigService } from '@/services/routing/RouteConfigService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VerticalPageProps {
  vertical: string;
}

export default function VerticalPage({ vertical }: VerticalPageProps) {
  const { user } = useAuth();
  const { navigate, getBreadcrumbs, getMetadata } = useRouter();
  const { toast } = useToast();

  // Get vertical configuration
  const verticalConfig = routeConfigService.getVerticalRoute(vertical);
  
  // Fetch listings for this vertical
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['/api/listings', { vertical }],
    queryFn: async () => {
      const response = await fetch(`/api/listings?vertical=${encodeURIComponent(vertical)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${vertical} listings`);
      }
      return response.json();
    },
    enabled: !!vertical && !!user
  });

  // Set page metadata
  useEffect(() => {
    const metadata = getMetadata();
    if (metadata) {
      document.title = metadata.title;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', metadata.description);
    }
  }, [getMetadata]);

  // Handle error states
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Listings",
        description: "Failed to load marketplace listings. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (!verticalConfig) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Marketplace Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The requested marketplace vertical does not exist.
            </p>
            <Button onClick={() => navigate('/marketplace')} data-testid="back-to-marketplace">
              Back to Marketplace
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-6" aria-label="Breadcrumb" data-testid="breadcrumb-nav">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {getBreadcrumbs().map((crumb, index, array) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {index === array.length - 1 ? (
                  <span className="font-medium text-gray-900 dark:text-white">
                    {crumb}
                  </span>
                ) : (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-purple-600 hover:text-purple-700"
                    onClick={() => {
                      if (index === 0) navigate('/');
                      else if (index === 1) navigate('/marketplace');
                    }}
                    data-testid={`breadcrumb-${index}`}
                  >
                    {crumb}
                  </Button>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl" data-testid="vertical-icon">
                {verticalConfig.icon === 'briefcase' && '💼'}
                {verticalConfig.icon === 'home' && '🏠'}
                {verticalConfig.icon === 'car' && '🚗'}
                {verticalConfig.icon === 'anchor' && '⚓'}
                {verticalConfig.icon === 'wrench' && '🔧'}
                {verticalConfig.icon === 'trophy' && '🏆'}
                {verticalConfig.icon === 'shirt' && '👕'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
                {verticalConfig.displayName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1" data-testid="page-description">
                {verticalConfig.metadata.description}
              </p>
            </div>
          </div>
          
          {/* Keywords/Tags */}
          <div className="flex flex-wrap gap-2">
            {verticalConfig.metadata.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" data-testid={`keyword-${index}`}>
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12" data-testid="loading-state">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Loading {verticalConfig.displayName.toLowerCase()} listings...
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-12" data-testid="error-state">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Unable to Load Listings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We encountered an error while loading the marketplace listings.
            </p>
            <Button onClick={() => window.location.reload()} data-testid="retry-button">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="listings-grid">
            {listings?.length > 0 ? (
              listings.map((listing: any, index: number) => (
                <Card key={listing.id || index} className="hover:shadow-lg transition-shadow" data-testid={`listing-card-${index}`}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-semibold truncate">
                      {listing.title || 'Untitled Listing'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {listing.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-600">
                        ${listing.price || '0.00'}
                      </span>
                      <Badge variant="outline">
                        {listing.category || 'General'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12" data-testid="empty-state">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-6m-8 0h6m-6 0v3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Listings Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  There are currently no listings in the {verticalConfig.displayName.toLowerCase()} marketplace.
                </p>
                <Button onClick={() => navigate('/create-listing')} data-testid="create-listing-button">
                  Create First Listing
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}