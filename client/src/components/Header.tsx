import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  HeartIcon
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
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/marketplace">
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-primary font-medium transition-colors duration-200"
                data-testid="nav-marketplace"
              >
                Marketplace
              </Button>
            </Link>
            <Link href="/create-listing">
              <Button 
                variant="ghost"
                className="text-gray-700 hover:text-primary font-medium transition-colors duration-200"
                data-testid="nav-create-listing"
              >
                Sell
              </Button>
            </Link>
            <Link href={`/profile/${user?.username || user?.id}`}>
              <Button 
                variant="ghost"
                className="text-gray-700 hover:text-primary font-medium transition-colors duration-200"
                data-testid="nav-profile"
              >
                My Closet
              </Button>
            </Link>
          </nav>

          {/* Actions */}
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
                      src={user?.profileImageUrl || undefined} 
                      alt={user?.firstName || user?.username || 'User'}
                      data-testid="img-user-avatar"
                    />
                    <AvatarFallback className="gradient-primary text-white font-semibold" data-testid="avatar-fallback">
                      {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-morphism" align="end" data-testid="menu-user">
                <DropdownMenuLabel data-testid="label-user-info">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none" data-testid="text-user-name">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.username || 'User'
                      }
                    </p>
                    <p className="text-xs leading-none text-muted-foreground" data-testid="text-user-email">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild data-testid="menu-item-profile">
                  <Link href={`/profile/${user?.username || user?.id}`} className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-item-liked">
                  <HeartIcon className="mr-2 h-4 w-4" />
                  <span>Liked Items</span>
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
