import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { UserCard } from "@/components/UserCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  EditIcon, 
  SettingsIcon, 
  UserPlusIcon, 
  UserCheckIcon,
  MapPinIcon,
  CalendarIcon,
  VerifiedIcon,
  HeartIcon,
  MessageCircleIcon,
  GridIcon,
  ListIcon,
  StarIcon,
  TrendingUpIcon
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
});

interface ProfileProps {
  params: {
    username?: string;
  };
}

export default function Profile({ params }: ProfileProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Determine if this is the current user's profile
  const isOwnProfile = !params.username || 
    params.username === currentUser?.username || 
    params.username === currentUser?.id;

  // Fetch profile user data
  const { data: profileUser, isLoading: loadingProfile } = useQuery({
    queryKey: params.username ? ["/api/users", params.username] : ["/api/auth/user"],
    enabled: true,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Fetch user's listings
  const { data: listings, isLoading: loadingListings } = useQuery({
    queryKey: ["/api/listings", { sellerId: profileUser?.id }],
    enabled: !!profileUser?.id,
  });

  // Fetch liked listings (only for own profile)
  const { data: likedListings, isLoading: loadingLiked } = useQuery({
    queryKey: ["/api/users", profileUser?.id, "liked-listings"],
    enabled: !!profileUser?.id && isOwnProfile,
  });

  // Fetch followers
  const { data: followers, isLoading: loadingFollowers } = useQuery({
    queryKey: ["/api/users", profileUser?.id, "followers"],
    enabled: !!profileUser?.id,
  });

  // Fetch following
  const { data: following, isLoading: loadingFollowing } = useQuery({
    queryKey: ["/api/users", profileUser?.id, "following"],
    enabled: !!profileUser?.id,
  });

  // Check follow status (for other users' profiles)
  const { data: followStatus } = useQuery({
    queryKey: ["/api/follow/status", profileUser?.id],
    enabled: !!profileUser?.id && !isOwnProfile,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      return await apiRequest('PUT', '/api/users/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Follow/unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (followStatus?.isFollowing) {
        return await apiRequest('DELETE', `/api/follow/${profileUser?.id}`);
      } else {
        return await apiRequest('POST', '/api/follow', { followingId: profileUser?.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow/status", profileUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileUser?.id, "followers"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: currentUser?.username || '',
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      bio: currentUser?.bio || '',
    },
  });

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User not found</h3>
              <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const displayName = profileUser.firstName && profileUser.lastName 
    ? `${profileUser.firstName} ${profileUser.lastName}`
    : profileUser.username || 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden" data-testid="card-profile-header">
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
              {/* Avatar */}
              <div className="relative -mt-16 mb-4 md:mb-0">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={profileUser.profileImageUrl || undefined}
                    alt={displayName}
                    data-testid="img-profile-avatar"
                  />
                  <AvatarFallback className="gradient-primary text-white font-bold text-3xl">
                    {(profileUser.firstName?.[0] || profileUser.username?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900" data-testid="text-profile-name">
                        {displayName}
                      </h1>
                      {profileUser.isVerified && (
                        <VerifiedIcon className="w-6 h-6 text-blue-500" data-testid="icon-verified" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-2" data-testid="text-profile-username">
                      @{profileUser.username}
                    </p>
                    {profileUser.bio && (
                      <p className="text-gray-700 mb-4 max-w-2xl" data-testid="text-profile-bio">
                        {profileUser.bio}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1" data-testid="stat-join-date">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Joined {new Date(profileUser.createdAt!).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    {isOwnProfile ? (
                      <>
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              data-testid="button-edit-profile"
                            >
                              <EditIcon className="w-4 h-4 mr-2" />
                              Edit Profile
                            </Button>
                          </DialogTrigger>
                          <DialogContent data-testid="dialog-edit-profile">
                            <DialogHeader>
                              <DialogTitle>Edit Profile</DialogTitle>
                              <DialogDescription>
                                Update your profile information
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="username"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Username</FormLabel>
                                      <FormControl>
                                        <Input {...field} data-testid="input-edit-username" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                          <Input {...field} data-testid="input-edit-first-name" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                          <Input {...field} data-testid="input-edit-last-name" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <FormField
                                  control={form.control}
                                  name="bio"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Bio</FormLabel>
                                      <FormControl>
                                        <Textarea {...field} data-testid="textarea-edit-bio" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(false)}
                                    data-testid="button-cancel-edit"
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                    data-testid="button-save-profile"
                                  >
                                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline"
                          data-testid="button-settings"
                        >
                          <SettingsIcon className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline"
                          data-testid="button-message"
                        >
                          <MessageCircleIcon className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button
                          onClick={() => followMutation.mutate()}
                          disabled={followMutation.isPending}
                          variant={followStatus?.isFollowing ? "outline" : "default"}
                          className={!followStatus?.isFollowing ? 'gradient-primary text-white border-0' : ''}
                          data-testid="button-follow"
                        >
                          {followStatus?.isFollowing ? (
                            <>
                              <UserCheckIcon className="w-4 h-4 mr-2" />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlusIcon className="w-4 h-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card data-testid="card-stat-listings">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1" data-testid="text-stat-listings">
                {profileUser.listingsCount || 0}
              </div>
              <div className="text-sm text-gray-600">Listings</div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-sales">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1" data-testid="text-stat-sales">
                {profileUser.salesCount || 0}
              </div>
              <div className="text-sm text-gray-600">Sales</div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-followers">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1" data-testid="text-stat-followers">
                {profileUser.followersCount || 0}
              </div>
              <div className="text-sm text-gray-600">Followers</div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-following">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1" data-testid="text-stat-following">
                {profileUser.followingCount || 0}
              </div>
              <div className="text-sm text-gray-600">Following</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-4" data-testid="tabs-list">
              <TabsTrigger value="listings" data-testid="tab-listings">
                Listings ({listings?.length || 0})
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger value="liked" data-testid="tab-liked">
                  Liked ({likedListings?.length || 0})
                </TabsTrigger>
              )}
              <TabsTrigger value="followers" data-testid="tab-followers">
                Followers
              </TabsTrigger>
              <TabsTrigger value="following" data-testid="tab-following">
                Following
              </TabsTrigger>
            </TabsList>

            {(activeTab === 'listings' || activeTab === 'liked') && (
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  data-testid="button-grid-view"
                >
                  <GridIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  data-testid="button-list-view"
                >
                  <ListIcon className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="listings" data-testid="content-listings">
            {loadingListings ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
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
            ) : listings?.length === 0 ? (
              <Card className="text-center py-12" data-testid="card-no-listings">
                <CardContent>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile 
                      ? "Start selling by creating your first listing!"
                      : "This user hasn't listed any items yet."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {listings?.map((listing: any) => (
                  <ListingCard 
                    key={listing.id}
                    listing={listing}
                    data-testid={`card-listing-${listing.id}`}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="liked" data-testid="content-liked">
              {loadingLiked ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
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
              ) : likedListings?.length === 0 ? (
                <Card className="text-center py-12" data-testid="card-no-liked">
                  <CardContent>
                    <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No liked items yet</h3>
                    <p className="text-gray-600">Items you like will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {likedListings?.map((listing: any) => (
                    <ListingCard 
                      key={listing.id}
                      listing={listing}
                      data-testid={`card-liked-listing-${listing.id}`}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="followers" data-testid="content-followers">
            {loadingFollowers ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : followers?.length === 0 ? (
              <Card className="text-center py-12" data-testid="card-no-followers">
                <CardContent>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No followers yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile 
                      ? "People who follow you will appear here"
                      : "This user doesn't have any followers yet"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {followers?.map((follower: any) => (
                  <UserCard
                    key={follower.id}
                    user={follower}
                    showFollowButton={!isOwnProfile}
                    compact
                    data-testid={`card-follower-${follower.id}`}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" data-testid="content-following">
            {loadingFollowing ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : following?.length === 0 ? (
              <Card className="text-center py-12" data-testid="card-no-following">
                <CardContent>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Not following anyone yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile 
                      ? "Discover and follow interesting sellers"
                      : "This user isn't following anyone yet"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {following?.map((followedUser: any) => (
                  <UserCard
                    key={followedUser.id}
                    user={followedUser}
                    showFollowButton={!isOwnProfile}
                    compact
                    data-testid={`card-following-${followedUser.id}`}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
