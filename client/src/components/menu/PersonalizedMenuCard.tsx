import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useMenuStore, MenuItem } from '@/stores/menuStore';
import { Heart, Clock, Flame, Star, Plus, Sparkles, TrendingUp } from 'lucide-react';

interface PersonalizedMenuCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  className?: string;
}

export const PersonalizedMenuCard: React.FC<PersonalizedMenuCardProps> = ({
  item,
  onAddToCart,
  className = ''
}) => {
  const { user } = useAuthStore();
  const { addToFavorites, removeFromFavorites } = useMenuStore();

  const isFavorite = user?.preferences?.favoriteItems?.includes(item.id) || false;

  const handleToggleFavorite = () => {
    if (!user) return;
    
    if (isFavorite) {
      removeFromFavorites(item.id, user.id);
    } else {
      addToFavorites(item.id, user.id);
    }
  };

  const getPersonalizationReason = () => {
    if (!item.isPersonalized) return null;
    
    const reasons = [];
    
    if (item.personalizedScore && item.personalizedScore > 85) {
      reasons.push('Perfect match for your taste');
    }
    if (item.dietaryTags.some(tag => user?.preferences?.allergens?.includes(tag))) {
      reasons.push('Matches your dietary preferences');
    }
    if (item.spiceLevel === user?.preferences?.spiceLevel) {
      reasons.push('Your preferred spice level');
    }
    if (item.lastOrdered) {
      reasons.push('You loved this before');
    }
    
    return reasons[0] || 'Recommended for you';
  };

  const formatPrice = (price: number, originalPrice?: number) => {
    if (originalPrice && originalPrice > price) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">${price}</span>
          <span className="text-sm text-gray-500 line-through">${originalPrice}</span>
          <Badge variant="secondary" className="text-xs">
            {Math.round(((originalPrice - price) / originalPrice) * 100)}% off
          </Badge>
        </div>
      );
    }
    return <span className="text-lg font-bold text-primary">${price}</span>;
  };

  return (
    <Card className={`card-interactive group relative overflow-hidden ${className}`}>
      {/* Personalization Badge */}
      {item.isPersonalized && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Pick
          </Badge>
        </div>
      )}

      {/* Flash Sale Badge */}
      {item.flashSaleEndTime && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="destructive" className="animate-pulse">
            <Flame className="h-3 w-3 mr-1" />
            Flash Sale
          </Badge>
        </div>
      )}

      {/* Favorite Button */}
      {user && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 z-10 w-8 h-8 p-0 bg-white/80 hover:bg-white"
          onClick={handleToggleFavorite}
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </Button>
      )}

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Availability Overlay */}
        {item.availability === 'sold-out' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm px-3 py-1">
              Sold Out
            </Badge>
          </div>
        )}
        
        {item.availability === 'limited' && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
              Only {item.inventory} left
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {item.name}
            </CardTitle>
            
            {/* Personalization Reason */}
            {item.isPersonalized && (
              <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                <TrendingUp className="h-3 w-3" />
                <span>{getPersonalizationReason()}</span>
              </div>
            )}
          </div>
          
          {/* Price */}
          <div className="text-right">
            {formatPrice(item.price, item.originalPrice)}
          </div>
        </div>

        <CardDescription className="text-sm line-clamp-2">
          {item.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Tags and Info */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.isNew && (
            <Badge variant="outline" className="text-xs">
              New
            </Badge>
          )}
          {item.isChefSpecial && (
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
              Chef's Special
            </Badge>
          )}
          {item.dietaryTags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{item.preparationTime}min</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-yellow-400" />
              <span>{item.popularity}%</span>
            </div>
            
            {item.spiceLevel > 0 && (
              <div className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span>{'🌶️'.repeat(item.spiceLevel)}</span>
              </div>
            )}
          </div>

          {/* Personalization Score */}
          {item.isPersonalized && item.personalizedScore && (
            <div className="flex items-center gap-1 text-primary">
              <Sparkles className="h-3 w-3" />
              <span className="font-medium">{item.personalizedScore}% match</span>
            </div>
          )}
        </div>

        {/* Flash Sale Timer */}
        {item.flashSaleEndTime && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-700 font-medium">Flash Sale Ends:</span>
              <FlashSaleTimer endTime={item.flashSaleEndTime} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => onAddToCart?.(item)}
            disabled={item.availability === 'sold-out'}
            className="flex-1"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            {item.availability === 'sold-out' ? 'Sold Out' : 'Add to Cart'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="px-3"
            onClick={() => {
              // Mock: Show item details
              console.log('Show details for:', item.name);
            }}
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Flash Sale Timer Component
const FlashSaleTimer: React.FC<{ endTime: Date }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('Expired');
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <span className="text-red-700 font-mono font-bold">
      {timeLeft}
    </span>
  );
};

export default PersonalizedMenuCard;