import { useQuery } from "@tanstack/react-query";
import { Category } from "@/types";
import { Filter } from "lucide-react";

interface MenuCategoriesProps {
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

const MenuCategories = ({ selectedCategory, onSelectCategory }: MenuCategoriesProps) => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-2">Browse Menu</h2>
          <p className="text-text-muted">Loading categories...</p>
        </div>
        <div className="flex justify-center">
          <div className="flex overflow-x-auto py-4 space-x-4 scrollbar-modern">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-gray-200 h-12 w-28 rounded-xl animate-pulse flex-shrink-0"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Filter className="h-4 w-4" />
          Browse by Category
        </div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">Our Menu</h2>
        <p className="text-text-muted max-w-xl mx-auto">
          Explore our carefully curated selection of dishes, each crafted with the finest ingredients.
        </p>
      </div>
      
      <div className="flex justify-center">
        <div className="flex overflow-x-auto py-4 space-x-4 scrollbar-modern max-w-4xl">
          <button
            onClick={() => onSelectCategory(null)}
            className={`${
              selectedCategory === null
                ? "gradient-primary text-white shadow-lg scale-105"
                : "bg-white text-text-primary border-2 border-border-DEFAULT hover:border-primary hover:text-primary"
            } px-6 py-3 rounded-xl text-sm font-semibold flex-shrink-0 transition-all duration-300 transform hover:scale-105 hover:shadow-md`}
          >
            All Items
          </button>
          
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`${
                selectedCategory === category.id
                  ? "gradient-primary text-white shadow-lg scale-105"
                  : "bg-white text-text-primary border-2 border-border-DEFAULT hover:border-primary hover:text-primary"
              } px-6 py-3 rounded-xl text-sm font-semibold flex-shrink-0 transition-all duration-300 transform hover:scale-105 hover:shadow-md animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuCategories;
