import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Star, Crown } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const { restaurant } = useRestaurant();

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Professional Logo & Brand */}
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="relative">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                <Star className="h-2.5 w-2.5 text-white fill-current" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gradient leading-tight">
                {restaurant?.name || "RestaurantRush"}
              </h1>
              <p className="text-sm text-text-muted font-medium">
                {restaurant?.description || "Premium Dining Experience"}
              </p>
            </div>
          </Link>

          {/* Mobile Logo */}
          <Link href="/" className="sm:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-md">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient">
                {restaurant?.name || "RestaurantRush"}
              </span>
            </div>
          </Link>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Loyalty Points Display */}
                {user.loyaltyPoints !== undefined && (
                  <div className="hidden md:flex items-center space-x-2 bg-secondary/10 px-3 py-2 rounded-lg">
                    <Star className="h-4 w-4 text-secondary fill-current" />
                    <span className="text-sm font-semibold text-secondary">
                      {user.loyaltyPoints} pts
                    </span>
                  </div>
                )}
                
                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                    <AvatarFallback className="bg-primary text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-text-primary">
                      {user.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      Welcome back
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-text-muted hover:text-primary hover:bg-primary/5 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-text-secondary hover:text-primary hover:bg-primary/5 font-medium transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm" 
                    className="gradient-primary text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="hidden sm:inline">Sign Up</span>
                    <span className="sm:hidden">Join</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}