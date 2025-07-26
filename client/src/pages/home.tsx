import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { CategoryCard } from "@/components/CategoryCard";
import { ListingCard } from "@/components/ListingCard";
import { UserCard } from "@/components/UserCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, SearchIcon, TrendingUpIcon, HeartIcon, MessageCircleIcon } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  const { data: featuredListings, isLoading: loadingListings } = useQuery({
    queryKey: ["/api/listings", { limit: 12 }],
  });

  const { data: trendingCategories, isLoading: loadingCategories } = useQuery({
    queryKey: ["/api/listings", { limit: 6 }],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-welcome">
                Welcome back, {user?.firstName || user?.username || 'Friend'}! 👋
              </h1>
              <p className="text-gray-600" data-testid="text-welcome-subtitle">
                Discover amazing finds, connect with sellers, and turn your unused items into cash.
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex space-x-3">
              <Button 
                className="gradient-primary text-white" 
                asChild
                data-testid="button-create-listing"
              >
                <Link href="/create-listing">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Listing
                </Link>
              </Button>
              <Button 
                variant="outline"
                asChild
                data-testid="button-browse-marketplace"
              >
                <Link href="/marketplace">
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card data-testid="card-stat-listings">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1" data-testid="text-stat-listings">
                {user?.listingsCount || 0}
              </div>
              <div className="text-sm text-gray-600" data-testid="text-stat-listings-label">Your Listings</div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-sales">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1" data-testid="text-stat-sales">
                {user?.salesCount || 0}
              </div>
              <div className="text-sm text-gray-600" data-testid="text-stat-sales-label">Sales Made</div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-followers">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1" data-testid="text-stat-followers">
                {user?.followersCount || 0}
              </div>
              <div className="text-sm text-gray-600" data-testid="text-stat-followers-label">Followers</div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-following">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1" data-testid="text-stat-following">
                {user?.followingCount || 0}
              </div>
              <div className="text-sm text-gray-600" data-testid="text-stat-following-label">Following</div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-8" data-testid="card-search">
          <CardContent className="p-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                className="pl-10 text-lg" 
                placeholder="Search for items, brands, or sellers..."
                data-testid="input-search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Trending Categories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center" data-testid="text-trending-title">
              <TrendingUpIcon className="w-6 h-6 mr-2 text-primary" />
              Trending Categories
            </h2>
            <Button variant="link" asChild data-testid="button-view-all-categories">
              <Link href="/marketplace">View All →</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <CategoryCard 
              name="Fashion"
              icon="shirt"
              count="12.5K"
              trend="+15%"
              color="pink"
              data-testid="card-category-fashion"
            />
            <CategoryCard 
              name="Jobs"
              icon="briefcase"
              count="8.2K"
              trend="+12%"
              color="blue"
              data-testid="card-category-jobs"
            />
            <CategoryCard 
              name="Real Estate"
              icon="home"
              count="3.1K"
              trend="+8%"
              color="green"
              data-testid="card-category-real-estate"
            />
            <CategoryCard 
              name="Cars"
              icon="car"
              count="5.7K"
              trend="+6%"
              color="orange"
              data-testid="card-category-cars"
            />
            <CategoryCard 
              name="Boats"
              icon="ship"
              count="892"
              trend="+4%"
              color="cyan"
              data-testid="card-category-boats"
            />
            <CategoryCard 
              name="Services"
              icon="wrench"
              count="6.4K"
              trend="+11%"
              color="purple"
              data-testid="card-category-services"
            />
          </div>
        </section>

        {/* Featured Listings */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900" data-testid="text-featured-title">
              Featured Listings
            </h2>
            <Button variant="link" asChild data-testid="button-view-all-listings">
              <Link href="/marketplace">View All →</Link>
            </Button>
          </div>
          
          {loadingListings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card>
                    <CardContent className="p-0">
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredListings?.slice(0, 8).map((listing: any) => (
                <ListingCard 
                  key={listing.id}
                  listing={listing}
                  data-testid={`card-listing-${listing.id}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Community Activity */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" data-testid="text-community-title">
            Community Activity
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card data-testid="card-recent-activity">
              <CardHeader>
                <CardTitle className="flex items-center" data-testid="text-recent-activity-title">
                  <HeartIcon className="w-5 h-5 mr-2 text-red-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3" data-testid="activity-item-1">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm"><span className="font-medium">@sarah_styles</span> liked your listing</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3" data-testid="activity-item-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm"><span className="font-medium">@mike_trades</span> started following you</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3" data-testid="activity-item-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm"><span className="font-medium">@vintage_finds</span> commented on your post</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Users */}
            <Card data-testid="card-suggested-users">
              <CardHeader>
                <CardTitle data-testid="text-suggested-users-title">Suggested for You</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <UserCard 
                  user={{
                    id: "1",
                    username: "fashion_guru",
                    firstName: "Emma",
                    lastName: "Wilson",
                    profileImageUrl: null,
                    followersCount: 1523,
                    listingsCount: 89
                  }}
                  showFollowButton
                  data-testid="user-card-1"
                />
                <UserCard 
                  user={{
                    id: "2", 
                    username: "home_stylist",
                    firstName: "David",
                    lastName: "Chen",
                    profileImageUrl: null,
                    followersCount: 892,
                    listingsCount: 156
                  }}
                  showFollowButton
                  data-testid="user-card-2"
                />
                <UserCard 
                  user={{
                    id: "3",
                    username: "tech_seller",
                    firstName: "Sarah",
                    lastName: "Johnson", 
                    profileImageUrl: null,
                    followersCount: 2341,
                    listingsCount: 67
                  }}
                  showFollowButton
                  data-testid="user-card-3"
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6" data-testid="text-quick-actions-title">
            Quick Actions
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-action-sell">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2" data-testid="text-action-sell-title">Start Selling</h3>
                <p className="text-gray-600 text-sm mb-4" data-testid="text-action-sell-description">
                  List your items and start earning money today
                </p>
                <Button variant="outline" className="w-full" data-testid="button-action-sell">
                  Create Listing
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-action-messages">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircleIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2" data-testid="text-action-messages-title">Messages</h3>
                <p className="text-gray-600 text-sm mb-4" data-testid="text-action-messages-description">
                  Connect with buyers and sellers
                </p>
                <Button variant="outline" className="w-full" data-testid="button-action-messages">
                  View Messages
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-action-profile">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2" data-testid="text-action-profile-title">My Profile</h3>
                <p className="text-gray-600 text-sm mb-4" data-testid="text-action-profile-description">
                  Manage your closet and profile
                </p>
                <Button variant="outline" className="w-full" asChild data-testid="button-action-profile">
                  <Link href="/profile">View Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
