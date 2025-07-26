import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, Share2, Eye, ShoppingBag, TrendingUp, Users, Calendar } from "lucide-react";
import { Link } from "wouter";
import type { Listing, User } from "@shared/schema";

interface ListingWithSeller extends Listing {
  seller: User;
  isLiked?: boolean;
}

interface FeedData {
  forYouListings: ListingWithSeller[];
  followingListings: ListingWithSeller[];
  likedListings: ListingWithSeller[];
  recentlyViewed: ListingWithSeller[];
  trendingItems: ListingWithSeller[];
  suggestedUsers: User[];
}

export default function Feed() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");

  const { data: feedData, isLoading } = useQuery<FeedData>({
    queryKey: ["/api/feed"],
  });

  const { data: brandCounts } = useQuery<Record<string, number>>({
    queryKey: ["/api/feed/brand-counts"],
  });

  if (isLoading) {
    return <FeedSkeleton />;
  }

  const currentListings = activeTab === "for-you" 
    ? feedData?.forYouListings || []
    : feedData?.followingListings || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Brand Collections */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Brands</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(brandCounts || {}).slice(0, 10).map(([brand, count]) => (
                    <div key={brand} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{brand}</span>
                      <Badge variant="secondary" className="text-xs">{count}</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                  ALL BRANDS
                </Button>
              </CardContent>
            </Card>

            {/* My Likes */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">My Likes</h3>
                  <Button variant="ghost" size="sm" className="text-xs text-purple-600">
                    ALL LIKES
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {feedData?.likedListings?.slice(0, 9).map((listing, index) => (
                    <Link key={listing.id} href={`/listing/${listing.id}`}>
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
                        {listing.images?.[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Views */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Views</h3>
                  <Button variant="ghost" size="sm" className="text-xs text-purple-600">
                    RECENTLY VIEWED
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {feedData?.recentlyViewed?.slice(0, 9).map((listing, index) => (
                    <Link key={listing.id} href={`/listing/${listing.id}`}>
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
                        {listing.images?.[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "for-you" | "following")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="for-you" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  data-testid="tab-for-you"
                >
                  FOR YOU
                </TabsTrigger>
                <TabsTrigger 
                  value="following"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  data-testid="tab-following"
                >
                  FOLLOWING
                </TabsTrigger>
              </TabsList>

              <TabsContent value="for-you" className="space-y-8">
                <FeedSection
                  title="Trending Now"
                  subtitle="New Listings"
                  listings={currentListings.slice(0, 4)}
                  showBrandHeader
                />
                
                {/* Group remaining listings by brand */}
                {Object.entries(
                  currentListings.slice(4).reduce((acc, listing) => {
                    const brand = listing.brand || 'Other';
                    if (!acc[brand]) acc[brand] = [];
                    acc[brand].push(listing);
                    return acc;
                  }, {} as Record<string, ListingWithSeller[]>)
                ).map(([brand, brandListings]) => (
                  <FeedSection
                    key={brand}
                    title={brand}
                    subtitle="New Listings"
                    listings={brandListings.slice(0, 4)}
                    showBrandHeader
                  />
                ))}
              </TabsContent>

              <TabsContent value="following" className="space-y-8">
                {currentListings.length > 0 ? (
                  <FeedSection
                    title="From People You Follow"
                    subtitle="Latest Updates"
                    listings={currentListings}
                    showBrandHeader={false}
                  />
                ) : (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No posts from people you follow
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Discover and follow sellers to see their latest listings here.
                      </p>
                      <Link href="/marketplace">
                        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                          Explore Marketplace
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Items */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Today's Trends</h3>
                </div>
                <div className="space-y-3">
                  {feedData?.trendingItems?.slice(0, 3).map((listing) => (
                    <Link key={listing.id} href={`/listing/${listing.id}`}>
                      <div className="flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors cursor-pointer">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {listing.images?.[0] ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {listing.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {listing.brand}
                          </p>
                          <p className="text-sm font-semibold text-purple-600">
                            ${listing.price}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Users */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Suggested for You</h3>
                <div className="space-y-3">
                  {feedData?.suggestedUsers?.slice(0, 4).map((suggestedUser) => (
                    <div key={suggestedUser.id} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={suggestedUser.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {suggestedUser.firstName?.[0] || suggestedUser.username?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {suggestedUser.firstName || suggestedUser.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {suggestedUser.followersCount} followers
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        Follow
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeedSectionProps {
  title: string;
  subtitle: string;
  listings: ListingWithSeller[];
  showBrandHeader?: boolean;
}

function FeedSection({ title, subtitle, listings, showBrandHeader = false }: FeedSectionProps) {
  if (listings.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
          SHOP {title.toUpperCase()}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} showSeller={!showBrandHeader} />
        ))}
      </div>
    </div>
  );
}

interface ListingCardProps {
  listing: ListingWithSeller;
  showSeller?: boolean;
}

function ListingCard({ listing, showSeller = true }: ListingCardProps) {
  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="glass-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
          {listing.images?.[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        
        <CardContent className="p-3">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight">
              {listing.title}
            </h3>
            
            {listing.brand && (
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {listing.brand}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-purple-600">${listing.price}</p>
              {listing.originalPrice && parseFloat(listing.originalPrice) > parseFloat(listing.price) && (
                <p className="text-xs text-gray-400 line-through">${listing.originalPrice}</p>
              )}
            </div>

            {showSeller && listing.seller && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={listing.seller.profileImageUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {listing.seller.firstName?.[0] || listing.seller.username?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {listing.seller.firstName || listing.seller.username}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {listing.likesCount}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {listing.viewsCount}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(listing.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function FeedSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <Skeleton key={j} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="glass-card">
                  <Skeleton className="aspect-square rounded-lg mb-3" />
                  <CardContent className="p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            {[1, 2].map((i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}