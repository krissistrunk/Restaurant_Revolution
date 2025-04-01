import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@/types";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

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
      {showDetails && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded shadow p-6 w-96">
            <h2 className="text-xl font-bold mb-2">{showDetails.name}</h2>
            <p>{showDetails.description}</p>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedItems;