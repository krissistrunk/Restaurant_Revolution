import PlaceholderPage from '@/components/PlaceholderPage';
import { Heart } from 'lucide-react';

const NutritionPage = () => {
  return (
    <PlaceholderPage
      title="Nutrition Information"
      description="Detailed nutritional information and allergen details for all our dishes."
      comingSoonMessage="We're compiling comprehensive nutrition data for all menu items. This will include calorie counts, allergen information, and dietary accommodations."
      icon={Heart}
    />
  );
};

export default NutritionPage;