import { useQuery } from "@tanstack/react-query";
import { Category } from "@/types";

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
      <section className="mb-6">
        <div className="flex overflow-x-auto py-2 space-x-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-gray-200 h-10 w-24 rounded-full animate-pulse"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="mb-6">
      <div className="flex overflow-x-auto py-2 no-scrollbar space-x-3">
        <button
          onClick={() => onSelectCategory(null)}
          className={`${
            selectedCategory === null
              ? "bg-primary text-white"
              : "bg-white text-dark border border-gray-200"
          } px-4 py-2 rounded-full text-sm font-medium flex-shrink-0`}
        >
          All
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`${
              selectedCategory === category.id
                ? "bg-primary text-white"
                : "bg-white text-dark border border-gray-200"
            } px-4 py-2 rounded-full text-sm font-medium flex-shrink-0`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  );
};

export default MenuCategories;
