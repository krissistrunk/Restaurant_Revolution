import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useMenuStore } from '@/stores/menuStore';
import PersonalizedMenuCard from './PersonalizedMenuCard';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Thermometer, 
  Brain,
  Settings,
  RefreshCw,
  Heart,
  Star,
  Zap
} from 'lucide-react';

export const PersonalizedDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    personalizedItems, 
    currentDeals, 
    flashSales,
    weatherContext,
    timeContext,
    personalization,
    updatePersonalization,
    getPersonalizedMenu,
    getCurrentDeals,
    getFlashSales,
    mockPersonalizeMenu,
    mockWeatherRecommendations,
    mockTimeBasedRecommendations,
    isLoading
  } = useMenuStore();

  useEffect(() => {
    if (user) {
      // Trigger AI personalization when user is available
      mockPersonalizeMenu(user.preferences);
      mockWeatherRecommendations();
      mockTimeBasedRecommendations();
    }
  }, [user, mockPersonalizeMenu, mockWeatherRecommendations, mockTimeBasedRecommendations]);

  const handleRefreshRecommendations = () => {
    if (user) {
      mockPersonalizeMenu(user.preferences);
      mockWeatherRecommendations();
      mockTimeBasedRecommendations();
    }
  };

  const handleAddToCart = (item: any) => {
    // Mock add to cart functionality
    console.log('Added to cart:', item.name);
  };

  if (!user) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <Brain className="h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sign in for Personalized Recommendations</h3>
              <p className="text-gray-600">Get AI-powered menu suggestions tailored just for you</p>
            </div>
            <Button>Sign In</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalization Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Welcome back, {user.name}!
                </CardTitle>
                <CardDescription className="text-base">
                  Your personalized dining experience powered by AI
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshRecommendations}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Context Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Thermometer className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-sm">Weather Context</div>
                <div className="text-xs text-gray-600">
                  {weatherContext.temperature}°F, {weatherContext.condition}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-sm">Time Context</div>
                <div className="text-xs text-gray-600 capitalize">
                  {timeContext.period} dining
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium text-sm">AI Confidence</div>
                <div className="text-xs text-gray-600">
                  92% accuracy match
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flash Sales */}
      {flashSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500" />
              ⚡ Flash Sales - Limited Time!
            </CardTitle>
            <CardDescription>
              Don't miss these lightning deals ending soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashSales.slice(0, 3).map((item) => (
                <PersonalizedMenuCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                  className="border-red-200"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Perfect Matches for You
          </CardTitle>
          <CardDescription>
            AI-curated selections based on your preferences and dining history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personalizedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalizedItems.slice(0, 6).map((item) => (
                <PersonalizedMenuCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Learning Your Preferences
              </h3>
              <p className="text-gray-600 mb-4">
                Order a few items to help our AI understand your taste better
              </p>
              <Button onClick={handleRefreshRecommendations}>
                Get Recommendations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Deals */}
      {currentDeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-secondary" />
              Today's Special Deals
            </CardTitle>
            <CardDescription>
              Great savings on popular items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentDeals.slice(0, 3).map((item) => (
                <PersonalizedMenuCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                  className="border-secondary/30"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Recommendations */}
      {weatherContext.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-500" />
              Perfect for Today's Weather
            </CardTitle>
            <CardDescription>
              Recommendations based on {weatherContext.temperature}°F and {weatherContext.condition} conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {weatherContext.recommendations.map((rec, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                  {rec}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time-Based Recommendations */}
      {timeContext.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Perfect for {timeContext.period.charAt(0).toUpperCase() + timeContext.period.slice(1)}
            </CardTitle>
            <CardDescription>
              Curated selections for your current dining time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {timeContext.recommendations.map((rec, index) => (
                <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700">
                  {rec}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Preferences Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Your Taste Profile
          </CardTitle>
          <CardDescription>
            What we've learned about your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Favorite Cuisines</h4>
              <div className="flex flex-wrap gap-1">
                {user.preferences?.cuisine.length ? (
                  user.preferences.cuisine.map((cuisine, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {cuisine}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Order more to learn your preferences</span>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Spice Preference</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">{'🌶️'.repeat(user.preferences?.spiceLevel || 0)}</span>
                <span className="text-gray-600 text-sm">
                  Level {user.preferences?.spiceLevel || 0}/5
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Price Range</h4>
              <div className="text-sm text-gray-600">
                ${user.preferences?.priceRange?.[0] || 0} - ${user.preferences?.priceRange?.[1] || 50}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Allergens to Avoid</h4>
              <div className="flex flex-wrap gap-1">
                {user.preferences?.allergens?.length ? (
                  user.preferences.allergens.map((allergen, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {allergen}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">None specified</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedDashboard;