import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@/types";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Plus, Crown, ShoppingCart } from "lucide-react";

const FeaturedItems = () => {
  const { data: featuredItems, isLoading, error } = useQuery<MenuItem[]>({
    queryKey: ["/api/featured-items"],
  });

  const { addToCart } = useCart();
  const [showDetails, setShowDetails] = useState<MenuItem | null>(null);

  const handleAddToCart = (item: MenuItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    addToCart({
      menuItem: item,
      quantity: 1,
    });
  };

  const handleShowDetails = (item: MenuItem) => {
    setShowDetails(item);
  };

  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-2">Featured Selections</h2>
          <p className="text-text-muted">Discover our chef's recommendations</p>
        </div>
        <div className="flex overflow-x-auto py-4 space-x-6 scrollbar-modern">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 h-96 rounded-2xl overflow-hidden shadow-lg bg-gray-200 animate-pulse"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !featuredItems || featuredItems.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Crown className="h-4 w-4" />
          Chef's Recommendations
        </div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">Featured Selections</h2>
        <p className="text-text-muted max-w-xl mx-auto">
          Discover our most popular dishes, carefully crafted with premium ingredients and exceptional attention to detail.
        </p>
      </div>
      
      <div className="relative">
        <div className="flex overflow-x-auto py-4 space-x-6 scrollbar-modern">
          {featuredItems.map((item, index) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-80 card-interactive group relative overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleShowDetails(item)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {item.isFeatured && (
                    <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      FEATURED
                    </div>
                  )}
                  {item.isPopular && (
                    <div className="bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </div>
                  )}
                </div>

                {/* Quick Add Button */}
                <button
                  className="absolute bottom-4 right-4 w-12 h-12 bg-white text-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 flex items-center justify-center"
                  onClick={(e) => handleAddToCart(item, e)}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <div className="text-2xl font-bold text-primary">
                    ${item.price.toFixed(2)}
                  </div>
                </div>
                
                <p className="text-text-muted text-sm mb-4 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                
                {/* Dietary Info */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.isVegetarian && (
                    <span className="bg-status-success/10 text-status-success px-2 py-1 rounded-md text-xs font-medium">
                      Vegetarian
                    </span>
                  )}
                  {item.isGlutenFree && (
                    <span className="bg-status-warning/10 text-status-warning px-2 py-1 rounded-md text-xs font-medium">
                      Gluten Free
                    </span>
                  )}
                  {item.isSeafood && (
                    <span className="bg-status-info/10 text-status-info px-2 py-1 rounded-md text-xs font-medium">
                      Seafood
                    </span>
                  )}
                </div>
                
                <Button
                  className="w-full gradient-primary text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  onClick={(e) => handleAddToCart(item, e)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-3xl font-bold text-text-primary">{showDetails?.name}</DialogTitle>
            <p className="text-text-muted">Detailed information and ingredients</p>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={showDetails?.imageUrl}
                  alt={showDetails?.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {showDetails?.isFeatured && (
                    <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      FEATURED
                    </div>
                  )}
                  {showDetails?.isPopular && (
                    <div className="bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">Description</h3>
                <p className="text-text-muted leading-relaxed">{showDetails?.description}</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
                <span className="text-lg font-medium text-text-primary">Price</span>
                <span className="text-3xl font-bold text-primary">${showDetails?.price.toFixed(2)}</span>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">Dietary Information</h3>
                <div className="flex flex-wrap gap-2">
                  {showDetails?.isVegetarian && (
                    <span className="bg-status-success/10 text-status-success px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
                      ✓ Vegetarian
                    </span>
                  )}
                  {showDetails?.isGlutenFree && (
                    <span className="bg-status-warning/10 text-status-warning px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
                      ✓ Gluten Free
                    </span>
                  )}
                  {showDetails?.isSeafood && (
                    <span className="bg-status-info/10 text-status-info px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
                      🐟 Contains Seafood
                    </span>
                  )}
                </div>
              </div>
              
              {showDetails?.allergens && showDetails.allergens.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Allergen Information</h3>
                  <div className="flex flex-wrap gap-2">
                    {showDetails.allergens.map((allergen, index) => (
                      <span key={index} className="bg-status-error/10 text-status-error px-3 py-2 rounded-lg text-sm font-medium">
                        ⚠️ {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowDetails(null)}
              className="flex-1 border-border-DEFAULT hover:bg-background-alt transition-colors"
            >
              Continue Browsing
            </Button>
            <Button 
              onClick={() => handleAddToCart(showDetails!)}
              className="flex-1 gradient-primary text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart - ${showDetails?.price.toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default FeaturedItems;