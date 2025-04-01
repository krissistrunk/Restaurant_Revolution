import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@/types";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const FeaturedItems = () => {
  const { data: featuredItems, isLoading, error } = useQuery<MenuItem[]>({
    queryKey: ["/api/featured-items"],
  });

  const { addToCart } = useCart();
  const [showDetails, setShowDetails] = useState<MenuItem | null>(null);

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      menuItem: item,
      quantity: 1,
    });
  };

  const handleShowDetails = (item: MenuItem) => {
    setShowDetails(item);
  };

  const handleCloseModal = () => {
    setShowDetails(null);
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="font-heading font-bold text-xl mb-4">Featured Items</h2>
        <div className="flex overflow-x-auto py-2 space-x-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 h-64 rounded-lg overflow-hidden shadow-lg bg-gray-200 animate-pulse"
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
    <section className="mb-8">
      <h2 className="font-heading font-bold text-xl mb-4">Featured Items</h2>
      <div className="relative">
        <div className="flex overflow-x-auto py-2 no-scrollbar space-x-4">
          {featuredItems.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-64 rounded-lg overflow-hidden shadow-lg bg-white cursor-pointer"
              onClick={() => handleShowDetails(item)}
            >
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />
                {item.isPopular && (
                  <div className="absolute top-2 right-2 bg-accent text-dark text-xs font-bold px-2 py-1 rounded">
                    POPULAR
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-dark">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-accent font-semibold text-primary">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    className="bg-primary text-white rounded-full p-1"
                    onClick={() => handleAddToCart(item)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex items-center justify-between">
            <button 
              onClick={() => setShowDetails(null)}
              className="absolute left-4 top-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <DialogTitle className="text-xl ml-8">{showDetails?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <img
                src={showDetails?.imageUrl}
                alt={showDetails?.name}
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>
            
            <div className="w-full md:w-1/2 space-y-4">
              <div>
                <h3 className="font-medium text-lg">Description</h3>
                <p className="text-gray-600">{showDetails?.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Price</h3>
                <p className="text-xl font-accent text-primary">${showDetails?.price.toFixed(2)}</p>
              </div>
              
              {showDetails?.allergens && showDetails.allergens.length > 0 && (
                <div>
                  <h3 className="font-medium text-lg">Allergens</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {showDetails.allergens.map((allergen, index) => (
                      <span key={index} className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-lg">Dietary Information</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {showDetails?.isVegetarian && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Vegetarian
                    </span>
                  )}
                  {showDetails?.isGlutenFree && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                      Gluten Free
                    </span>
                  )}
                  {showDetails?.isSeafood && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      Contains Seafood
                    </span>
                  )}
                  {!showDetails?.isVegetarian && !showDetails?.isGlutenFree && !showDetails?.isSeafood && (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                      No specific dietary information
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowDetails(null)}>
              Close
            </Button>
            <Button onClick={() => handleAddToCart(showDetails!)}>
              Add to Cart - ${showDetails?.price.toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default FeaturedItems;