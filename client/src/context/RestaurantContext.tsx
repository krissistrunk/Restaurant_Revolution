import { createContext, useState, useEffect, ReactNode } from "react";
import { Restaurant, RestaurantContextType } from "@/types";
import { apiRequest } from "@/lib/queryClient";

export const RestaurantContext = createContext<RestaurantContextType | null>(null);

interface RestaurantProviderProps {
  children: ReactNode;
}

export const RestaurantProvider = ({ children }: RestaurantProviderProps) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await apiRequest("GET", "/api/restaurant", undefined);
        const restaurantData = await response.json();
        setRestaurant(restaurantData);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRestaurant();
  }, []);
  
  const value: RestaurantContextType = {
    restaurant,
    isLoading,
  };
  
  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
};
