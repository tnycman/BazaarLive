import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedIcon, UserPlusIcon, UserCheckIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface UserCardProps {
  user: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    bio?: string;
    isVerified?: boolean;
    followersCount?: number;
    followingCount?: number;
    listingsCount?: number;
    salesCount?: number;
  };
  showFollowButton?: boolean;
  compact?: boolean;
  'data-testid'?: string;
}

export function UserCard({ user, showFollowButton = false, compact = false, ...props }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.username || 'User';

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFollowing(!isFollowing);
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between" {...props}>
        <Link href={`/profile/${user.username || user.id}`} className="flex items-center space-x-3 flex-1">
          <Avatar className="w-10 h-10">
            <AvatarImage 
              src={user.profileImageUrl || undefined}
              alt={displayName}
              data-testid="img-user-avatar"
            />
            <AvatarFallback className="gradient-primary text-white font-semibold">
              {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <p className="text-sm font-medium text-gray-900 truncate" data-testid="text-user-name">
                {displayName}
              </p>
              {user.isVerified && (
                <VerifiedIcon className="w-4 h-4 text-blue-500 flex-shrink-0" data-testid="icon-verified" />
              )}
            </div>
            <p className="text-xs text-gray-500" data-testid="text-user-username">
              @{user.username || 'user'}
            </p>
          </div>
        </Link>
        
        {showFollowButton && (
          <Button
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            onClick={handleFollow}
            className={`ml-3 ${!isFollowing ? 'gradient-primary text-white border-0' : ''}`}
            data-testid="button-follow"
          >
            {isFollowing ? (
              <>
                <UserCheckIcon className="w-3 h-3 mr-1" />
                Following
              </>
            ) : (
              <>
                <UserPlusIcon className="w-3 h-3 mr-1" />
                Follow
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200" {...props}>
      <CardContent className="p-4">
        <Link href={`/profile/${user.username || user.id}`}>
          <div className="text-center space-y-3">
            {/* Avatar */}
            <Avatar className="w-16 h-16 mx-auto">
              <AvatarImage 
                src={user.profileImageUrl || undefined}
                alt={displayName}
                data-testid="img-user-avatar"
              />
              <AvatarFallback className="gradient-primary text-white font-bold text-lg">
                {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Name & Username */}
            <div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                <h3 className="font-semibold text-gray-900" data-testid="text-user-name">
                  {displayName}
                </h3>
                {user.isVerified && (
                  <VerifiedIcon className="w-4 h-4 text-blue-500" data-testid="icon-verified" />
                )}
              </div>
              <p className="text-sm text-gray-500" data-testid="text-user-username">
                @{user.username || 'user'}
              </p>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-gray-600 line-clamp-2" data-testid="text-user-bio">
                {user.bio}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div data-testid="stat-listings">
                <div className="text-lg font-bold text-gray-900" data-testid="text-listings-count">
                  {user.listingsCount || 0}
                </div>
                <div className="text-xs text-gray-500">Listings</div>
              </div>
              <div data-testid="stat-followers">
                <div className="text-lg font-bold text-gray-900" data-testid="text-followers-count">
                  {user.followersCount || 0}
                </div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
              <div data-testid="stat-sales">
                <div className="text-lg font-bold text-gray-900" data-testid="text-sales-count">
                  {user.salesCount || 0}
                </div>
                <div className="text-xs text-gray-500">Sales</div>
              </div>
            </div>

            {/* Follow Button */}
            {showFollowButton && (
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
                className={`w-full ${!isFollowing ? 'gradient-primary text-white border-0' : ''}`}
                data-testid="button-follow"
              >
                {isFollowing ? (
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
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
