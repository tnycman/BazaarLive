// Clean analytics dashboard with role-based access control
import { Header } from '@/components/Header';
import RoleBasedAnalytics from './RoleBasedAnalytics';

export default function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8" data-testid="analytics-dashboard">
        {/* Dashboard Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            BazaarLive Analytics
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Role-based analytics with tiered access control for secure insights and metrics
          </p>
        </div>

        {/* Role-based Analytics Component */}
        <RoleBasedAnalytics />
      </main>
    </div>
  );
}