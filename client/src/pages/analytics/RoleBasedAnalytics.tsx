// Role-based analytics dashboard with tiered access control
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Users, BarChart3, TrendingUp, ShieldCheck, Lock } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface UserWithRole {
  id: string;
  email?: string;
  role?: 'user' | 'moderator' | 'admin';
  analyticsAccess?: 'personal' | 'category' | 'platform';
}

export default function RoleBasedAnalytics() {
  const { user, isAuthenticated } = useAuth();
  
  // Fetch user role and access level
  const { data: userProfile, isLoading: userLoading } = useQuery<UserWithRole>({
    queryKey: ['/api/auth/user'],
    enabled: isAuthenticated,
  });

  const role = userProfile?.role || 'user';
  const analyticsAccess = userProfile?.analyticsAccess || 'personal';

  // Access level configurations
  const accessConfig = {
    personal: {
      title: "Personal Analytics",
      description: "View your own activity and performance metrics",
      color: "bg-blue-500",
      icon: Users,
      endpoints: [`/api/analytics/users/${userProfile?.id}`]
    },
    category: {
      title: "Category Analytics", 
      description: "View category performance and marketplace insights",
      color: "bg-purple-500",
      icon: BarChart3,
      endpoints: [`/api/analytics/users/${userProfile?.id}`, '/api/analytics/categories']
    },
    platform: {
      title: "Platform Analytics",
      description: "Full access to all platform metrics and real-time data",
      color: "bg-emerald-500", 
      icon: TrendingUp,
      endpoints: [`/api/analytics/users/${userProfile?.id}`, '/api/analytics/categories', '/api/analytics/platform', '/api/analytics/realtime']
    }
  };

  const currentAccess = accessConfig[analyticsAccess];

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-6 text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to access analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Access Level Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${currentAccess.color} text-white`}>
                <currentAccess.icon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{currentAccess.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {role.toUpperCase()}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {currentAccess.description}
                </p>
              </div>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
        </CardHeader>
      </Card>

      {/* Access Level Information */}
      <Alert>
        <ShieldCheck className="w-4 h-4" />
        <AlertDescription>
          <strong>Your Access Level:</strong> {analyticsAccess.charAt(0).toUpperCase() + analyticsAccess.slice(1)} 
          {analyticsAccess === 'personal' && " - You can view your own activity and listing performance."}
          {analyticsAccess === 'category' && " - You can view category trends and your own metrics."}
          {analyticsAccess === 'platform' && " - You have full access to all platform analytics and real-time data."}
        </AlertDescription>
      </Alert>

      {/* Analytics Tabs Based on Access Level */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {analyticsAccess !== 'personal' && (
            <TabsTrigger value="categories">Categories</TabsTrigger>
          )}
          {analyticsAccess === 'platform' && (
            <>
              <TabsTrigger value="platform">Platform</TabsTrigger>
              <TabsTrigger value="realtime">Real-time</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PersonalAnalytics userId={userProfile?.id} />
        </TabsContent>

        {analyticsAccess !== 'personal' && (
          <TabsContent value="categories" className="space-y-4">
            <CategoryAnalytics />
          </TabsContent>
        )}

        {analyticsAccess === 'platform' && (
          <>
            <TabsContent value="platform" className="space-y-4">
              <PlatformAnalytics />
            </TabsContent>
            <TabsContent value="realtime" className="space-y-4">
              <RealtimeAnalytics />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Upgrade Notice for Limited Access */}
      {analyticsAccess === 'personal' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-orange-500" />
              <div>
                <h4 className="font-medium text-orange-800">Limited Access</h4>
                <p className="text-sm text-orange-700">
                  Contact an administrator to request higher analytics access levels for category or platform insights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Personal Analytics Component
function PersonalAnalytics({ userId }: { userId?: string }) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: [`/api/analytics/users/${userId}`],
    enabled: !!userId,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Your Listings</span>
          </div>
          <p className="text-2xl font-bold mt-2">{(metrics as any)?.totalListings || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Total Views</span>
          </div>
          <p className="text-2xl font-bold mt-2">{(metrics as any)?.totalViews || 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">Likes Received</span>
          </div>
          <p className="text-2xl font-bold mt-2">{(metrics as any)?.totalLikes || 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">Sales Made</span>
          </div>
          <p className="text-2xl font-bold mt-2">{(metrics as any)?.totalSales || 0}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Category Analytics Component
function CategoryAnalytics() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/analytics/categories'],
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Category analytics data will be displayed here.</p>
      </CardContent>
    </Card>
  );
}

// Platform Analytics Component  
function PlatformAnalytics() {
  const { data: platform, isLoading } = useQuery({
    queryKey: ['/api/analytics/platform'],
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Platform-wide analytics data will be displayed here.</p>
      </CardContent>
    </Card>
  );
}

// Real-time Analytics Component
function RealtimeAnalytics() {
  const { data: realtime, isLoading } = useQuery({
    queryKey: ['/api/analytics/realtime'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{(realtime as any)?.activeUsers || 0}</p>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{(realtime as any)?.currentPageViews || 0}</p>
            <p className="text-sm text-gray-600">Page Views</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">{(realtime as any)?.realtimeEvents || 0}</p>
            <p className="text-sm text-gray-600">Real-time Events</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}