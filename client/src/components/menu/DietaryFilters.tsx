import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Leaf, Wheat, Fish } from "lucide-react";

interface DietaryFiltersProps {
  activeFilters: {
    isVegetarian: boolean;
    isGlutenFree: boolean;
    isSeafood: boolean;
  };
  onFilterChange: (filter: 'isVegetarian' | 'isGlutenFree' | 'isSeafood', value: boolean) => void;
}

const DietaryFilters = ({ activeFilters, onFilterChange }: DietaryFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Badge 
        variant={activeFilters.isVegetarian ? "default" : "outline"}
        className={`cursor-pointer flex items-center gap-1 px-3 py-1 ${activeFilters.isVegetarian ? 'bg-green-600 hover:bg-green-700' : ''}`}
        onClick={() => onFilterChange('isVegetarian', !activeFilters.isVegetarian)}
      >
        <Leaf className="h-3 w-3" />
        Vegetarian
        {activeFilters.isVegetarian && <Check className="h-3 w-3 ml-1" />}
      </Badge>
      
      <Badge 
        variant={activeFilters.isGlutenFree ? "default" : "outline"}
        className={`cursor-pointer flex items-center gap-1 px-3 py-1 ${activeFilters.isGlutenFree ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
        onClick={() => onFilterChange('isGlutenFree', !activeFilters.isGlutenFree)}
      >
        <Wheat className="h-3 w-3" />
        Gluten Free
        {activeFilters.isGlutenFree && <Check className="h-3 w-3 ml-1" />}
      </Badge>
      
      <Badge 
        variant={activeFilters.isSeafood ? "default" : "outline"}
        className={`cursor-pointer flex items-center gap-1 px-3 py-1 ${activeFilters.isSeafood ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
        onClick={() => onFilterChange('isSeafood', !activeFilters.isSeafood)}
      >
        <Fish className="h-3 w-3" />
        Seafood
        {activeFilters.isSeafood && <Check className="h-3 w-3 ml-1" />}
      </Badge>
      
      {(activeFilters.isVegetarian || activeFilters.isGlutenFree || activeFilters.isSeafood) && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs ml-2"
          onClick={() => {
            onFilterChange('isVegetarian', false);
            onFilterChange('isGlutenFree', false);
            onFilterChange('isSeafood', false);
          }}
        >
          Clear all
        </Button>
      )}
    </div>
  );
};

export default DietaryFilters;