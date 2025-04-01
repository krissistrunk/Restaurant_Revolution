import { useState } from "react";
import FeaturedItems from "@/components/menu/FeaturedItems";
import MenuCategories from "@/components/menu/MenuCategories";
import MenuItems from "@/components/menu/MenuItems";

const MenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <FeaturedItems />
      <MenuCategories
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <MenuItems selectedCategory={selectedCategory} />
    </main>
  );
};

export default MenuPage;
