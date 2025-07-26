import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  HeartIcon, 
  MessageCircleIcon, 
  EyeIcon, 
  ShareIcon,
  VerifiedIcon
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description?: string;
    price: string;
    originalPrice?: string;
    images: string[];
    brand?: string;
    size?: string;
    condition?: string;
    category: string;
    likesCount: number;
    viewsCount: number;
    commentsCount: number;
    seller?: {
      id: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
      isVerified?: boolean;
    };
  };
  'data-testid'?: string;
}

export function ListingCard({ listing, ...props }: ListingCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categoryColors: Record<string, string> = {
    fashion: "bg-pink-100 text-pink-800",
    jobs: "bg-blue-100 text-blue-800",
    real_estate: "bg-green-100 text-green-800",
    cars: "bg-orange-100 text-orange-800",
    boats: "bg-cyan-100 text-cyan-800",
    services: "bg-purple-100 text-purple-800",
  };

  const conditionColors: Record<string, string> = {
    new_with_tags: "bg-green-100 text-green-800",
    new_without_tags: "bg-green-100 text-green-800",
    excellent: "bg-blue-100 text-blue-800",
    good: "bg-yellow-100 text-yellow-800",
    fair: "bg-orange-100 text-orange-800",
    poor: "bg-red-100 text-red-800",
  };

  const formatCondition = (condition: string) => {
    return condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (listing.images.length > 1) {
      setCurrentImageIndex((prev) => prev === 0 ? listing.images.length - 1 : prev - 1);
    }
  };

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card 
        className="group hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
        {...props}
      >
        <CardContent className="p-0">
          {/* Image Section */}
          <div className="relative">
            <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-gray-100">
              {listing.images && listing.images.length > 0 ? (
                <>
                  <img 
                    src={listing.images[currentImageIndex]} 
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    data-testid="img-listing"
                  />
                  
                  {/* Image Navigation */}
                  {listing.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        data-testid="button-prev-image"
                      >
                        ←
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        data-testid="button-next-image"
                      >
                        →
                      </button>
                      
                      {/* Image Indicators */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {listing.images.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                            data-testid={`indicator-${index}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-sm">No image</div>
                </div>
              )}
            </div>

            {/* Category Badge */}
            <Badge 
              className={`absolute top-2 left-2 text-xs ${categoryColors[listing.category] || 'bg-gray-100 text-gray-800'}`}
              data-testid="badge-category"
            >
              {listing.category.replace('_', ' ')}
            </Badge>

            {/* Like Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full ${
                isLiked 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-white/80 hover:bg-white/90'
              }`}
              data-testid="button-like"
            >
              <HeartIcon 
                className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} 
              />
            </Button>
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-3">
            {/* Seller Info */}
            {listing.seller && (
              <div className="flex items-center space-x-2" data-testid="seller-info">
                <Avatar className="w-6 h-6">
                  <AvatarImage 
                    src={listing.seller.profileImageUrl || undefined}
                    alt={listing.seller.username || 'Seller'}
                  />
                  <AvatarFallback className="text-xs">
                    {(listing.seller.firstName?.[0] || listing.seller.username?.[0] || 'S').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-600" data-testid="text-seller-name">
                    @{listing.seller.username || 'seller'}
                  </span>
                  {listing.seller.isVerified && (
                    <VerifiedIcon className="w-3 h-3 text-blue-500" data-testid="icon-verified" />
                  )}
                </div>
              </div>
            )}

            {/* Title & Brand */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1" data-testid="text-listing-title">
                  {listing.title}
                </h3>
                {listing.brand && (
                  <Badge variant="outline" className="text-xs" data-testid="badge-brand">
                    {listing.brand}
                  </Badge>
                )}
              </div>
              
              {/* Size & Condition */}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {listing.size && (
                  <span data-testid="text-size">Size {listing.size}</span>
                )}
                {listing.size && listing.condition && <span>•</span>}
                {listing.condition && (
                  <Badge 
                    className={`text-xs ${conditionColors[listing.condition] || 'bg-gray-100 text-gray-800'}`}
                    data-testid="badge-condition"
                  >
                    {formatCondition(listing.condition)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900" data-testid="text-price">
                  ${listing.price}
                </span>
                {listing.originalPrice && (
                  <span className="text-sm text-gray-500 line-through" data-testid="text-original-price">
                    ${listing.originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1" data-testid="stat-likes">
                  <HeartIcon className="w-3 h-3" />
                  <span>{listing.likesCount || 0}</span>
                </div>
                <div className="flex items-center space-x-1" data-testid="stat-views">
                  <EyeIcon className="w-3 h-3" />
                  <span>{listing.viewsCount || 0}</span>
                </div>
                <div className="flex items-center space-x-1" data-testid="stat-comments">
                  <MessageCircleIcon className="w-3 h-3" />
                  <span>{listing.commentsCount || 0}</span>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="w-6 h-6 text-gray-400 hover:text-gray-600"
                data-testid="button-share"
              >
                <ShareIcon className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
