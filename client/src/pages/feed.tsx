import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
// import { Navigation } from "@/components/Navigation"; // REMOVED: Dropdowns now in Header
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
                <div className="space-y-8">
                  {/* People You Follow: New Listings */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        People You Follow: New Listings
                      </h2>
                      <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        + New Feed Items
                      </div>
                    </div>
                    
                    {/* Following Users Avatars */}
                    <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
                      {[
                        { id: '1', username: 'melissamorris', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c723?w=100&h=100&fit=crop&crop=face' },
                        { id: '2', username: 'maggieG', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
                        { id: '3', username: 'sweetdeal', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
                        { id: '4', username: 'chic3', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
                        { id: '5', username: 'summer', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face' },
                        { id: '6', username: 'campus', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face' },
                        { id: '7', username: 'alicestyle', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face' },
                        { id: '8', username: 'boho', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' }
                      ].map((user) => (
                        <div key={user.id} className="flex flex-col items-center space-y-2 min-w-[80px]">
                          <div className="relative">
                            <img 
                              src={user.avatar} 
                              alt={user.username}
                              className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            {user.username}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* User Activity Feeds */}
                  <div className="space-y-8">
                    {/* cwpritchard shared listings */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-4">
                          <img 
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
                            alt="cwpritchard"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">
                              <span className="font-semibold">cwpritchard</span> shared 12 listings from their closet
                            </p>
                            <p className="text-sm text-gray-500">2 secs ago</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {[
                            { id: '1', image: 'https://images.unsplash.com/photo-1521498542256-5aeb47ba2b36?w=300&h=400&fit=crop', price: '$45', likes: 8 },
                            { id: '2', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop', price: '$32', likes: 12 },
                            { id: '3', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop', price: '$28', likes: 6 },
                            { id: '4', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=400&fit=crop', price: '$58', likes: 15 }
                          ].map((item) => (
                            <div key={item.id} className="relative group cursor-pointer">
                              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                                <img 
                                  src={item.image} 
                                  alt="Listing"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                <span className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                                  {item.price}
                                </span>
                                <div className="flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded">
                                  <Heart className="w-3 h-3" />
                                  <span className="text-sm">{item.likes}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm">
                          SHOP CWPRITCHARD'S CLOSET
                        </button>
                      </div>
                    </div>

                    {/* myvintagevanity shared listings */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-4">
                          <img 
                            src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" 
                            alt="myvintagevanity"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">
                              <span className="font-semibold">myvintagevanity</span> shared 3 listings from their closet
                            </p>
                            <p className="text-sm text-gray-500">4 secs ago</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            { id: '1', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop', price: '$85', likes: 22 },
                            { id: '2', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=400&fit=crop', price: '$120', likes: 18 },
                            { id: '3', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&h=400&fit=crop', price: '$35', likes: 9 }
                          ].map((item) => (
                            <div key={item.id} className="relative group cursor-pointer">
                              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                                <img 
                                  src={item.image} 
                                  alt="Listing"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                <span className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                                  {item.price}
                                </span>
                                <div className="flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded">
                                  <Heart className="w-3 h-3" />
                                  <span className="text-sm">{item.likes}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm">
                          SHOP MYVINTAGEVANITY'S CLOSET
                        </button>
                      </div>
                    </div>

                    {/* alixbydesign shared listings */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-4">
                          <img 
                            src="https://images.unsplash.com/photo-1494790108755-2616b332c723?w=100&h=100&fit=crop&crop=face" 
                            alt="alixbydesign"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">
                              <span className="font-semibold">alixbydesign</span> shared 6 listings from their closet
                            </p>
                            <p className="text-sm text-gray-500">2 secs ago</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {[
                            { id: '1', image: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=300&h=400&fit=crop', price: '$75', likes: 14 },
                            { id: '2', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=400&fit=crop', price: '$95', likes: 28 },
                            { id: '3', image: 'https://images.unsplash.com/photo-1583743814966-8936f37cd379?w=300&h=400&fit=crop', price: '$42', likes: 11 },
                            { id: '4', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=400&fit=crop', price: '$68', likes: 19 }
                          ].map((item) => (
                            <div key={item.id} className="relative group cursor-pointer">
                              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                                <img 
                                  src={item.image} 
                                  alt="Listing"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                <span className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                                  {item.price}
                                </span>
                                <div className="flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded">
                                  <Heart className="w-3 h-3" />
                                  <span className="text-sm">{item.likes}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm">
                          SHOP ALIXBYDESIGN'S CLOSET
                        </button>
                      </div>
                    </div>

                    {/* heidismithaz shared listings */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <img 
                            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" 
                            alt="heidismithaz"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">
                              <span className="font-semibold">heidismithaz</span> shared 3 listings from their closet
                            </p>
                            <p className="text-sm text-gray-500">5 secs ago</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            { id: '1', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop', price: '$25', likes: 7 },
                            { id: '2', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=400&fit=crop', price: '$18', likes: 4 },
                            { id: '3', image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300&h=400&fit=crop', price: '$45', likes: 12 }
                          ].map((item) => (
                            <div key={item.id} className="relative group cursor-pointer">
                              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                                <img 
                                  src={item.image} 
                                  alt="Listing"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                <span className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                                  {item.price}
                                </span>
                                <div className="flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded">
                                  <Heart className="w-3 h-3" />
                                  <span className="text-sm">{item.likes}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm">
                          SHOP HEIDISMITHAZ'S CLOSET
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Empty state when no following users */}
                  {currentListings.length === 0 && (
                    <Card className="glass-card">
                      <CardContent className="p-8 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Follow People You Love
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Start following users to see their latest listings here
                        </p>
                        <Link href="/marketplace">
                          <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                            Discover Users
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
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
                {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'Today'}
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