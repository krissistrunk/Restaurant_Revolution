import { create } from 'zustand';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // For dynamic pricing
  category: string;
  image?: string;
  ingredients: string[];
  allergens: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  dietaryTags: string[]; // vegetarian, vegan, gluten-free, etc.
  spiceLevel: number; // 0-5
  preparationTime: number; // minutes
  popularity: number; // 0-100
  availability: 'available' | 'limited' | 'sold-out';
  inventory?: number;
  lastOrdered?: Date;
  isPersonalized?: boolean; // AI recommendation
  personalizedScore?: number; // 0-100
  isNew?: boolean;
  isChefSpecial?: boolean;
  discountPercentage?: number;
  flashSaleEndTime?: Date;
}

export interface MenuCategory {
  id: number;
  name: string;
  description: string;
  items: MenuItem[];
  isActive: boolean;
  sortOrder: number;
}

export interface PersonalizationSettings {
  showPersonalized: boolean;
  hideAllergens: boolean;
  preferredSpiceLevel: number;
  preferredPriceRange: [number, number];
  sortBy: 'popularity' | 'price' | 'personalized' | 'new';
  viewMode: 'grid' | 'list';
}

interface MenuState {
  categories: MenuCategory[];
  personalizedItems: MenuItem[];
  currentDeals: MenuItem[];
  flashSales: MenuItem[];
  personalization: PersonalizationSettings;
  isLoading: boolean;
  weatherContext: {
    temperature: number;
    condition: string;
    recommendations: string[];
  };
  timeContext: {
    period: 'breakfast' | 'lunch' | 'dinner' | 'late-night';
    recommendations: string[];
  };

  // Actions
  loadMenu: () => Promise<void>;
  updatePersonalization: (settings: Partial<PersonalizationSettings>) => void;
  getPersonalizedMenu: (userId: number) => MenuItem[];
  getCurrentDeals: () => MenuItem[];
  getFlashSales: () => MenuItem[];
  updateInventory: (itemId: number, quantity: number) => void;
  addToFavorites: (itemId: number, userId: number) => void;
  removeFromFavorites: (itemId: number, userId: number) => void;
  
  // Mock AI functions
  mockPersonalizeMenu: (preferences: any) => void;
  mockWeatherRecommendations: () => void;
  mockTimeBasedRecommendations: () => void;
}

// Mock menu data
const mockMenuData: MenuCategory[] = [
  {
    id: 1,
    name: 'Appetizers',
    description: 'Start your meal with our delicious appetizers',
    isActive: true,
    sortOrder: 1,
    items: [
      {
        id: 1,
        name: 'Truffle Arancini',
        description: 'Crispy risotto balls with truffle oil and parmesan',
        price: 14,
        originalPrice: 16,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        ingredients: ['Arborio rice', 'Truffle oil', 'Parmesan', 'Breadcrumbs'],
        allergens: ['Dairy', 'Gluten'],
        nutrition: { calories: 320, protein: 12, carbs: 45, fat: 18 },
        dietaryTags: ['Vegetarian'],
        spiceLevel: 0,
        preparationTime: 15,
        popularity: 85,
        availability: 'available',
        inventory: 25,
        isPersonalized: true,
        personalizedScore: 92,
        discountPercentage: 12
      },
      {
        id: 2,
        name: 'Spicy Tuna Tartare',
        description: 'Fresh tuna with avocado, citrus, and crispy wonton',
        price: 18,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        ingredients: ['Fresh tuna', 'Avocado', 'Citrus', 'Wonton crisps'],
        allergens: ['Fish', 'Gluten'],
        nutrition: { calories: 280, protein: 24, carbs: 12, fat: 16 },
        dietaryTags: ['Gluten-Free available'],
        spiceLevel: 3,
        preparationTime: 10,
        popularity: 78,
        availability: 'available',
        inventory: 15,
        isNew: true
      }
    ]
  },
  {
    id: 2,
    name: 'Main Courses',
    description: 'Our signature main dishes',
    isActive: true,
    sortOrder: 2,
    items: [
      {
        id: 3,
        name: 'Wagyu Beef Tenderloin',
        description: 'Grade A5 Wagyu with seasonal vegetables and red wine jus',
        price: 68,
        category: 'Main Courses',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        ingredients: ['Wagyu beef', 'Seasonal vegetables', 'Red wine jus'],
        allergens: ['None'],
        nutrition: { calories: 520, protein: 45, carbs: 8, fat: 32 },
        dietaryTags: ['Gluten-Free'],
        spiceLevel: 1,
        preparationTime: 25,
        popularity: 95,
        availability: 'limited',
        inventory: 5,
        isChefSpecial: true,
        personalizedScore: 88
      },
      {
        id: 4,
        name: 'Wild Salmon',
        description: 'Pan-seared salmon with quinoa pilaf and lemon herb sauce',
        price: 32,
        originalPrice: 38,
        category: 'Main Courses',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        ingredients: ['Wild salmon', 'Quinoa', 'Lemon', 'Fresh herbs'],
        allergens: ['Fish'],
        nutrition: { calories: 420, protein: 38, carbs: 22, fat: 18 },
        dietaryTags: ['Gluten-Free', 'Healthy Choice'],
        spiceLevel: 0,
        preparationTime: 18,
        popularity: 82,
        availability: 'available',
        inventory: 20,
        flashSaleEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        discountPercentage: 15
      }
    ]
  }
];

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  personalizedItems: [],
  currentDeals: [],
  flashSales: [],
  isLoading: false,
  personalization: {
    showPersonalized: true,
    hideAllergens: false,
    preferredSpiceLevel: 2,
    preferredPriceRange: [10, 60],
    sortBy: 'personalized',
    viewMode: 'grid'
  },
  weatherContext: {
    temperature: 72,
    condition: 'sunny',
    recommendations: ['Fresh salads', 'Cold appetizers', 'Light wines']
  },
  timeContext: {
    period: 'dinner',
    recommendations: ['Main courses', 'Wine pairings', 'Desserts']
  },

  loadMenu: async () => {
    set({ isLoading: true });
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    set({ 
      categories: mockMenuData,
      isLoading: false 
    });
    
    // Trigger personalization after loading
    get().mockPersonalizeMenu({});
    get().mockWeatherRecommendations();
    get().mockTimeBasedRecommendations();
  },

  updatePersonalization: (settings: Partial<PersonalizationSettings>) => {
    set(state => ({
      personalization: { ...state.personalization, ...settings }
    }));
  },

  getPersonalizedMenu: (userId: number) => {
    const { categories } = get();
    return categories
      .flatMap(cat => cat.items)
      .filter(item => item.isPersonalized)
      .sort((a, b) => (b.personalizedScore || 0) - (a.personalizedScore || 0));
  },

  getCurrentDeals: () => {
    const { categories } = get();
    return categories
      .flatMap(cat => cat.items)
      .filter(item => item.discountPercentage && item.discountPercentage > 0);
  },

  getFlashSales: () => {
    const { categories } = get();
    const now = new Date();
    return categories
      .flatMap(cat => cat.items)
      .filter(item => item.flashSaleEndTime && item.flashSaleEndTime > now);
  },

  updateInventory: (itemId: number, quantity: number) => {
    set(state => ({
      categories: state.categories.map(cat => ({
        ...cat,
        items: cat.items.map(item => 
          item.id === itemId 
            ? { 
                ...item, 
                inventory: (item.inventory || 0) + quantity,
                availability: quantity <= 0 ? 'sold-out' : 
                            quantity < 5 ? 'limited' : 'available'
              }
            : item
        )
      }))
    }));
  },

  addToFavorites: (itemId: number, userId: number) => {
    // Mock implementation - would sync with backend
    console.log(`Added item ${itemId} to favorites for user ${userId}`);
  },

  removeFromFavorites: (itemId: number, userId: number) => {
    // Mock implementation - would sync with backend
    console.log(`Removed item ${itemId} from favorites for user ${userId}`);
  },

  mockPersonalizeMenu: (preferences: any) => {
    const { categories } = get();
    const personalizedItems = categories
      .flatMap(cat => cat.items)
      .map(item => ({
        ...item,
        isPersonalized: Math.random() > 0.4, // 60% chance of being personalized
        personalizedScore: Math.floor(Math.random() * 40) + 60 // 60-100 score
      }));

    set(state => ({
      categories: state.categories.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          const personalized = personalizedItems.find(p => p.id === item.id);
          return personalized || item;
        })
      })),
      personalizedItems: personalizedItems.filter(item => item.isPersonalized)
    }));
  },

  mockWeatherRecommendations: () => {
    const temp = Math.floor(Math.random() * 40) + 50; // 50-90°F
    const conditions = ['sunny', 'cloudy', 'rainy', 'cold'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    let recommendations: string[] = [];
    if (temp > 75) {
      recommendations = ['Cold appetizers', 'Fresh salads', 'Iced beverages'];
    } else if (temp < 60) {
      recommendations = ['Hot soups', 'Warm entrees', 'Hot beverages'];
    } else {
      recommendations = ['Seasonal specials', 'Fresh ingredients', 'Balanced meals'];
    }

    set({
      weatherContext: {
        temperature: temp,
        condition,
        recommendations
      }
    });
  },

  mockTimeBasedRecommendations: () => {
    const hour = new Date().getHours();
    let period: 'breakfast' | 'lunch' | 'dinner' | 'late-night';
    let recommendations: string[] = [];

    if (hour < 11) {
      period = 'breakfast';
      recommendations = ['Light appetizers', 'Fresh options', 'Coffee pairings'];
    } else if (hour < 16) {
      period = 'lunch';
      recommendations = ['Quick options', 'Light mains', 'Business lunch specials'];
    } else if (hour < 22) {
      period = 'dinner';
      recommendations = ['Full courses', 'Wine pairings', 'Chef specials'];
    } else {
      period = 'late-night';
      recommendations = ['Light bites', 'Comfort food', 'Late night specials'];
    }

    set({
      timeContext: {
        period,
        recommendations
      }
    });
  }
}));