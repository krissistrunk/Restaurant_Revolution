import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuItem, Category } from "@/types";
import MenuItemCard from "@/components/menu/MenuItemCard";
import DietaryFilters from "@/components/menu/DietaryFilters";
import { Button } from "@/components/ui/button";

interface MenuItemsProps {
  selectedCategory: number | null;
}

const MenuItems = ({ selectedCategory }: MenuItemsProps) => {
  const [dietaryFilters, setDietaryFilters] = useState({
    isVegetarian: false,
    isGlutenFree: false,
    isSeafood: false
  });
  
  const handleFilterChange = (filter: keyof typeof dietaryFilters, value: boolean) => {
    setDietaryFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };
  
  const { data: menuItems, isLoading: loadingItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items", selectedCategory ? selectedCategory.toString() : "all"],
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (loadingItems || loadingCategories) {
    return (
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">Menu</h2>
        <div className="space-y-6">
          {[1, 2].map((categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <h3 className="font-heading font-semibold text-lg mb-3 bg-gray-200 h-6 w-40 animate-pulse"></h3>
              <div className="space-y-4">
                {[1, 2, 3].map((itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-gray-200 h-32 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!menuItems || !categories) {
    return <p>No menu items available.</p>;
  }

  // Group menu items by category
  const menuItemsByCategory: Record<number, MenuItem[]> = {};
  
  if (selectedCategory) {
    menuItemsByCategory[selectedCategory] = menuItems.filter(
      (item) => item.categoryId === selectedCategory
    );
  } else {
    menuItems.forEach((item) => {
      if (!menuItemsByCategory[item.categoryId]) {
        menuItemsByCategory[item.categoryId] = [];
      }
      menuItemsByCategory[item.categoryId].push(item);
    });
  }

  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {} as Record<number, Category>);

  // Apply dietary filters
  const filterMenuItems = (items: MenuItem[]) => {
    return items.filter(item => {
      // If no filters are active, show all items
      if (!dietaryFilters.isVegetarian && !dietaryFilters.isGlutenFree && !dietaryFilters.isSeafood) {
        return true;
      }
      
      // Apply vegetarian filter
      if (dietaryFilters.isVegetarian && !item.isVegetarian) {
        return false;
      }
      
      // Apply gluten-free filter
      if (dietaryFilters.isGlutenFree && !item.isGlutenFree) {
        return false;
      }
      
      // Apply seafood filter
      if (dietaryFilters.isSeafood && !item.isSeafood) {
        return false;
      }
      
      return true;
    });
  };
  
  // Filter and reorganize items by category
  const filteredMenuItemsByCategory: Record<number, MenuItem[]> = {};
  
  Object.keys(menuItemsByCategory).forEach(categoryId => {
    const numCategoryId = parseInt(categoryId);
    const filtered = filterMenuItems(menuItemsByCategory[numCategoryId]);
    
    if (filtered.length > 0) {
      filteredMenuItemsByCategory[numCategoryId] = filtered;
    }
  });

  return (
    <section>
      <h2 className="font-heading font-bold text-xl mb-4">Menu</h2>
      
      <DietaryFilters 
        activeFilters={dietaryFilters} 
        onFilterChange={handleFilterChange} 
      />
      
      {Object.keys(filteredMenuItemsByCategory).length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No menu items match your current filters.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              setDietaryFilters({
                isVegetarian: false,
                isGlutenFree: false,
                isSeafood: false
              });
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
      
      {Object.keys(filteredMenuItemsByCategory).map((categoryId) => {
        const category = categoryMap[parseInt(categoryId)];
        const items = filteredMenuItemsByCategory[parseInt(categoryId)];
        
        if (!category || items.length === 0) return null;
        
        return (
          <div key={categoryId} className="mb-8" data-category={category.name.toLowerCase()}>
            <h3 className="font-heading font-semibold text-lg mb-3">{category.name}</h3>
            
            <div className="space-y-4">
              {items.map((item) => (
                <MenuItemCard key={item.id} menuItem={item} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default MenuItems;
