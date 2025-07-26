// Comprehensive analytics dashboard with enterprise-grade reporting features
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService, AnalyticsMetrics, CategoryMetrics } from '@/services/analytics/AnalyticsService';
import { AnalyticsPeriodType } from '@shared/analytics-schema';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUpIcon, TrendingDownIcon, UsersIcon, ShoppingBagIcon, 
  EyeIcon, HeartIcon, MessageCircleIcon, DollarSignIcon,
  BarChart3Icon, PieChartIcon, ActivityIcon, TargetIcon
} from 'lucide-react';

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, change, changeLabel, icon, trend }: MetricCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUpIcon className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDownIcon className="w-4 h-4" />;
    return null;
  };

  return (
    <Card data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid={`metric-value-${title}`}>
                {value}
              </p>
            </div>
          </div>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium" data-testid={`metric-change-${title}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, children, className = "" }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {children}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriodType>('monthly');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });

  // Fetch platform analytics
  const { data: platformMetrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['/api/analytics/platform', selectedPeriod, dateRange.start, dateRange.end],
    queryFn: () => analyticsService.getPlatformMetrics(selectedPeriod, dateRange.start, dateRange.end),
    enabled: isAuthenticated
  });

  // Fetch category analytics
  const { data: categoryMetrics, isLoading: categoryLoading } = useQuery({
    queryKey: ['/api/analytics/categories', selectedPeriod],
    queryFn: () => analyticsService.getCategoryMetrics(undefined, undefined, selectedPeriod),
    enabled: isAuthenticated
  });

  // Fetch realtime metrics
  const { data: realtimeMetrics, isLoading: realtimeLoading } = useQuery({
    queryKey: ['/api/analytics/realtime'],
    queryFn: () => analyticsService.getRealtimeMetrics(),
    enabled: isAuthenticated,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      window.location.href = '/api/login';
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isLoading = metricsLoading || categoryLoading || realtimeLoading;

  // Prepare chart data
  const revenueChartData = platformMetrics ? [
    { name: 'Revenue', value: platformMetrics.revenueMetrics.totalRevenue },
    { name: 'Commissions', value: platformMetrics.revenueMetrics.commissionEarned },
    { name: 'AOV', value: platformMetrics.revenueMetrics.avgOrderValue }
  ] : [];

  const categoryChartData = categoryMetrics?.slice(0, 6).map((category, index) => ({
    name: category.category,
    revenue: category.performance.totalRevenue,
    listings: category.performance.totalListings,
    color: CHART_COLORS[index % CHART_COLORS.length]
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8" data-testid="analytics-dashboard">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="dashboard-title">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive marketplace insights and performance metrics
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={selectedPeriod} onValueChange={(value: AnalyticsPeriodType) => setSelectedPeriod(value)}>
              <SelectTrigger className="w-32" data-testid="period-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" data-testid="export-button">
              Export Report
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12" data-testid="loading-state">
            <LoadingSpinner size="lg" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading analytics...</span>
          </div>
        ) : metricsError ? (
          <div className="text-center py-12" data-testid="error-state">
            <div className="text-red-500 mb-4">
              <BarChart3Icon className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Unable to Load Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We encountered an error while loading your analytics data.
            </p>
            <Button onClick={() => window.location.reload()} data-testid="retry-analytics">
              Try Again
            </Button>
          </div>
        ) : (
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="analytics-tabs">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Users"
                  value={platformMetrics?.userMetrics.totalUsers.toLocaleString() || '0'}
                  change={12.5}
                  changeLabel="vs last period"
                  icon={<UsersIcon className="w-5 h-5 text-purple-600" />}
                  trend="up"
                />
                <MetricCard
                  title="Active Listings"
                  value={platformMetrics?.contentMetrics.totalListings.toLocaleString() || '0'}
                  change={8.3}
                  changeLabel="vs last period"
                  icon={<ShoppingBagIcon className="w-5 h-5 text-purple-600" />}
                  trend="up"
                />
                <MetricCard
                  title="Total Revenue"
                  value={`$${(platformMetrics?.revenueMetrics.totalRevenue || 0).toLocaleString()}`}
                  change={platformMetrics?.revenueMetrics.revenueGrowth || 0}
                  changeLabel="vs last period"
                  icon={<DollarSignIcon className="w-5 h-5 text-purple-600" />}
                  trend={platformMetrics?.revenueMetrics.revenueGrowth ? (platformMetrics.revenueMetrics.revenueGrowth > 0 ? 'up' : 'down') : 'neutral'}
                />
                <MetricCard
                  title="Avg Order Value"
                  value={`$${(platformMetrics?.revenueMetrics.avgOrderValue || 0).toFixed(2)}`}
                  change={5.7}
                  changeLabel="vs last period"
                  icon={<TargetIcon className="w-5 h-5 text-purple-600" />}
                  trend="up"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Revenue Breakdown">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${value}`}
                      >
                        {revenueChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Top Categories by Revenue">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Realtime Metrics */}
              {realtimeMetrics && (
                <ChartCard title="Real-time Activity">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <ActivityIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{realtimeMetrics.activeUsers}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <EyeIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{realtimeMetrics.currentPageViews}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Page Views</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <PieChartIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">{realtimeMetrics.topPages.length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Top Pages</p>
                    </div>
                  </div>
                </ChartCard>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Users"
                  value={platformMetrics?.userMetrics.totalUsers.toLocaleString() || '0'}
                  icon={<UsersIcon className="w-5 h-5 text-purple-600" />}
                />
                <MetricCard
                  title="Active Users"
                  value={platformMetrics?.userMetrics.activeUsers.toLocaleString() || '0'}
                  icon={<ActivityIcon className="w-5 h-5 text-purple-600" />}
                />
                <MetricCard
                  title="New Users"
                  value={platformMetrics?.userMetrics.newUsers.toLocaleString() || '0'}
                  icon={<TrendingUpIcon className="w-5 h-5 text-purple-600" />}
                />
                <MetricCard
                  title="Avg Session Duration"
                  value={`${Math.round((platformMetrics?.userMetrics.avgSessionDuration || 0) / 60)}m`}
                  icon={<ActivityIcon className="w-5 h-5 text-purple-600" />}
                />
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Listings"
                  value={platformMetrics?.contentMetrics.totalListings.toLocaleString() || '0'}
                  icon={<ShoppingBagIcon className="w-5 h-5 text-purple-600" />}
                />
                <MetricCard
                  title="New Listings"
                  value={platformMetrics?.contentMetrics.newListings.toLocaleString() || '0'}
                  icon={<TrendingUpIcon className="w-5 h-5 text-purple-600" />}
                />
                <MetricCard
                  title="Sold Listings"
                  value={platformMetrics?.contentMetrics.soldListings.toLocaleString() || '0'}
                  icon={<TargetIcon className="w-5 h-5 text-purple-600" />}
                />
                <MetricCard
                  title="Avg Views/Listing"
                  value={platformMetrics?.contentMetrics.avgViewsPerListing.toFixed(1) || '0'}
                  icon={<EyeIcon className="w-5 h-5 text-purple-600" />}
                />
              </div>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Revenue"
                  value={`$${(platformMetrics?.revenueMetrics.totalRevenue || 0).toLocaleString()}`}
                  icon={<DollarSignIcon className="w-5 h-5 text-purple-600" />}
                />
                <MetricCard
                  title="Commission Earned"
                  value={`$${(platformMetrics?.revenueMetrics.commissionEarned || 0).toLocaleString()}`}
                  icon={<TrendingUpIcon className="w-5 h-5 text-purple-600" />}
                />
                <MetricCard
                  title="Average Order Value"
                  value={`$${(platformMetrics?.revenueMetrics.avgOrderValue || 0).toFixed(2)}`}
                  icon={<TargetIcon className="w-5 h-5 text-purple-600" />}
                />
                <MetricCard
                  title="Revenue Growth"
                  value={`${(platformMetrics?.revenueMetrics.revenueGrowth || 0).toFixed(1)}%`}
                  trend={platformMetrics?.revenueMetrics.revenueGrowth ? (platformMetrics.revenueMetrics.revenueGrowth > 0 ? 'up' : 'down') : 'neutral'}
                  icon={<BarChart3Icon className="w-5 h-5 text-purple-600" />}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}