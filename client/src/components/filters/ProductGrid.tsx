import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GridIcon,
  ListIcon,
  HeartIcon,
  MessageCircleIcon,
  ShareIcon,
  MoreHorizontalIcon
} from 'lucide-react';
import { FILTER_OPTIONS } from '@/services/filtering/FilterConstants';

interface ProductGridProps {
  listings: any[];
  isLoading: boolean;
  appliedFiltersCount: number;
  onSortChange: (sortBy: string) => void;
  currentSort: string;
  category?: string;
}

interface ListingCardProps {
  listing: any;
  viewMode: 'grid' | 'list';
}

function ListingCard({ listing, viewMode }: ListingCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  
  if (viewMode === 'list') {
    return (
      <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
          {listing.images?.[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <GridIcon className="w-8 h-8" />
            </div>
          )}
        </div>
        
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {listing.title || 'Untitled Item'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Size: {listing.size || 'N/A'} • {listing.brand || 'Unknown Brand'}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ${listing.price || '0'}
                </span>
                {listing.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${listing.originalPrice}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsLiked(!isLiked)}
                className="h-8 w-8 p-0"
                data-testid={`button-like-${listing.id}`}
              >
                <HeartIcon className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                data-testid={`button-share-${listing.id}`}
              >
                <ShareIcon className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
              <span className="text-xs text-gray-600">@{listing.seller || 'seller'}</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <HeartIcon className="w-3 h-3" />
                {listing.likesCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircleIcon className="w-3 h-3" />
                {listing.commentsCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative group">
        {listing.images?.[0] ? (
          <img 
            src={listing.images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <GridIcon className="w-12 h-12" />
          </div>
        )}
        
        {/* Hover Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsLiked(!isLiked)}
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            data-testid={`button-like-${listing.id}`}
          >
            <HeartIcon className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
        </div>
        
        {/* Price Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white">
            ${listing.price || '0'}
          </Badge>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
          {listing.title || 'Untitled Item'}
        </h3>
        
        <div className="text-xs text-gray-500 mb-2">
          <span>Size: {listing.size || 'N/A'}</span>
          <span className="mx-2">•</span>
          <span className="text-purple-600 font-medium">{listing.brand || 'Unknown Brand'}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-gray-600">@{listing.seller || 'seller'}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <HeartIcon className="w-3 h-3" />
              {listing.likesCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircleIcon className="w-3 h-3" />
              {listing.commentsCount || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ 
  listings, 
  isLoading, 
  appliedFiltersCount, 
  onSortChange, 
  currentSort,
  category = 'women'
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const handleSortChange = (value: string) => {
    onSortChange(value);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  // Category-specific styling and content
  const getCategoryConfig = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'men':
        return {
          title: 'Men',
          subtitle: 'Discover your style',
          gradient: 'from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
          colors: ['from-blue-200 to-indigo-200', 'from-slate-200 to-gray-200', 'from-green-200 to-emerald-200']
        };
      case 'kids':
        return {
          title: 'Kids',
          subtitle: 'Fun fashion for little ones',
          gradient: 'from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20',
          colors: ['from-yellow-200 to-orange-200', 'from-green-200 to-lime-200', 'from-cyan-200 to-blue-200']
        };
      case 'women':
      default:
        return {
          title: 'Women',
          subtitle: 'Discover your style',
          gradient: 'from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20',
          colors: ['from-pink-200 to-purple-200', 'from-blue-200 to-indigo-200', 'from-amber-200 to-orange-200']
        };
    }
  };

  const categoryConfig = getCategoryConfig(category);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Banner - Dynamic Category */}
      <div className={`relative h-32 bg-gradient-to-r ${categoryConfig.gradient} mb-6`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{categoryConfig.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{categoryConfig.subtitle}</p>
          </div>
        </div>
        
        {/* Sample product images overlay */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 hidden lg:flex space-x-2">
          {categoryConfig.colors.map((color, index) => (
            <div key={index} className="w-16 h-16 bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`w-full h-full bg-gradient-to-br ${color}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between px-6 pb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {listings.length.toLocaleString()} items
            {appliedFiltersCount > 0 && (
              <span className="ml-2">
                • {appliedFiltersCount} filter{appliedFiltersCount !== 1 ? 's' : ''} applied
              </span>
            )}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40 h-8" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.sortOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="h-8 px-3 rounded-r-none"
              data-testid="button-view-grid"
            >
              <GridIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="h-8 px-3 rounded-l-none border-l"
              data-testid="button-view-list"
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="flex-1 px-6 pb-6">
        {listings.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <GridIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No items found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your filters or search terms
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Check your spelling</p>
                <p>• Try broader search terms</p>
                <p>• Remove some filters</p>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'
                : 'space-y-4'
            }
            data-testid="product-grid"
          >
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Load More Button */}
      {listings.length > 0 && (
        <div className="flex justify-center py-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            size="lg"
            className="px-8"
            data-testid="button-load-more"
          >
            Load More Items
          </Button>
        </div>
      )}
    </div>
  );
}