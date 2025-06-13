import { useContext } from "react";
import { RestaurantContext } from "@/context/RestaurantContext";
import { RestaurantContextType } from "@/types";

export const useRestaurant = (): RestaurantContextType => {
  const context = useContext(RestaurantContext);
  
  if (!context) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }
  
  return context;
};
