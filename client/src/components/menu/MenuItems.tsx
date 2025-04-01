import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuItem, Category } from "@/types";
import MenuItemCard from "@/components/menu/MenuItemCard";

interface MenuItemsProps {
  selectedCategory: number | null;
}

const MenuItems = ({ selectedCategory }: MenuItemsProps) => {
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

  return (
    <section>
      <h2 className="font-heading font-bold text-xl mb-4">Menu</h2>
      
      {Object.keys(menuItemsByCategory).map((categoryId) => {
        const category = categoryMap[parseInt(categoryId)];
        const items = menuItemsByCategory[parseInt(categoryId)];
        
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
