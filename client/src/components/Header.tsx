import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  PlusIcon, 
  SearchIcon, 
  BellIcon, 
  MessageCircleIcon,
  UserIcon,
  LogOutIcon,
  SettingsIcon,
  HeartIcon,
  BriefcaseIcon,
  HomeIcon,
  CarIcon,
  AnchorIcon,
  WrenchIcon,
  BarChart3Icon,
  Bot
} from "lucide-react";
import { Link } from "wouter";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="glass-morphism border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="text-2xl font-bold text-gradient cursor-pointer" data-testid="logo-header">
                  BazaarLive
                </div>
              </Link>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search Listings"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  data-testid="search-input"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4"
                  data-testid="search-button"
                >
                  <SearchIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Vertical Categories */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/marketplace/jobs">
                <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-purple-600" data-testid="header-jobs">
                  <BriefcaseIcon className="w-4 h-4" />
                  Jobs
                </Button>
              </Link>
              <Link href="/marketplace/real-estate">
                <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-purple-600" data-testid="header-real-estate">
                  <HomeIcon className="w-4 h-4" />
                  Real Estate
                </Button>
              </Link>
              <Link href="/marketplace/cars">
                <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-purple-600" data-testid="header-cars">
                  <CarIcon className="w-4 h-4" />
                  Cars
                </Button>
              </Link>
              <Link href="/marketplace/boats">
                <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-purple-600" data-testid="header-boats">
                  <AnchorIcon className="w-4 h-4" />
                  Boats
                </Button>
              </Link>
              <Link href="/marketplace/services">
                <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-purple-600" data-testid="header-services">
                  <WrenchIcon className="w-4 h-4" />
                  Services
                </Button>
              </Link>

            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
            {/* Create Listing Button */}
            <Button 
              className="gradient-primary text-white font-medium rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 hidden sm:flex"
              asChild
              data-testid="button-create-listing-header"
            >
              <Link href="/create-listing">
                <PlusIcon className="w-4 h-4 mr-2" />
                List Item
              </Link>
            </Button>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon"
              className="relative"
              data-testid="button-notifications"
            >
              <BellIcon className="w-5 h-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                data-testid="badge-notifications"
              >
                3
              </Badge>
            </Button>

            {/* Messages */}
            <Button 
              variant="ghost" 
              size="icon"
              className="relative"
              data-testid="button-messages"
            >
              <MessageCircleIcon className="w-5 h-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                data-testid="badge-messages"
              >
                2
              </Badge>
            </Button>

            {/* AI Assistant */}
            <Button 
              variant="ghost" 
              size="icon"
              className="relative"
              asChild
              data-testid="button-ai-assistant"
            >
              <Link href="/ai-assistant">
                <Bot className="w-5 h-5" />
              </Link>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full p-0"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={(user as any)?.profileImageUrl || undefined} 
                      alt={(user as any)?.firstName || (user as any)?.username || 'User'}
                      data-testid="img-user-avatar"
                    />
                    <AvatarFallback className="gradient-primary text-white font-semibold" data-testid="avatar-fallback">
                      {((user as any)?.firstName?.[0] || (user as any)?.username?.[0] || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-morphism" align="end" data-testid="menu-user">
                <DropdownMenuLabel data-testid="label-user-info">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none" data-testid="text-user-name">
                      {(user as any)?.firstName && (user as any)?.lastName 
                        ? `${(user as any).firstName} ${(user as any).lastName}`
                        : (user as any)?.username || 'User'
                      }
                    </p>
                    <p className="text-xs leading-none text-muted-foreground" data-testid="text-user-email">
                      {(user as any)?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild data-testid="menu-item-profile">
                  <Link href={`/profile/${(user as any)?.username || (user as any)?.id}`} className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-item-liked">
                  <HeartIcon className="mr-2 h-4 w-4" />
                  <span>Liked Items</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild data-testid="menu-item-analytics">
                  <Link href="/analytics" className="cursor-pointer">
                    <BarChart3Icon className="mr-2 h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-item-settings">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-red-600 focus:text-red-600"
                  data-testid="menu-item-logout"
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
  );
}
