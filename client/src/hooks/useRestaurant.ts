import { useContext } from "react";
import { RestaurantContext, RestaurantContextType } from "@/context/RestaurantContext";

export const useRestaurant = (): RestaurantContextType => {
  const context = useContext(RestaurantContext);
  
  if (!context) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }
  
  return context;
};
