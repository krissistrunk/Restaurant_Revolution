export interface Category {
  id: number;
  name: string;
  displayOrder: number;
  restaurantId: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  isAvailable: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isSeafood?: boolean;
  nutritionInfo?: Record<string, any>;
  allergens?: string[];
  restaurantId: number;
  modifiers?: Modifier[];
}

export interface Modifier {
  id: number;
  name: string;
  price: number;
  menuItemId: number;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  openingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  latitude: number;
  longitude: number;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  loyaltyPoints: number;
  dietaryPreferences?: Record<string, boolean>;
}

export interface Reservation {
  id: number;
  userId: number;
  date: string;
  time: string;
  partySize: number;
  status: string;
  notes?: string;
  restaurantId: number;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  price: number;
  notes?: string;
  modifiers?: Record<string, any>;
  menuItem?: MenuItem;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  totalPrice: number;
  pickupTime?: string;
  restaurantId: number;
  orderDate: string;
  items?: OrderItem[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  selectedModifiers?: Record<string, boolean>;
}

export interface LoyaltyReward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  isActive: boolean;
  restaurantId: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  register: (userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    phone?: string;
  }) => Promise<User>;
  isAuthenticated: boolean;
  isLoading: boolean;
  showWelcomeAnimation: boolean;
  hideWelcomeAnimation: () => void;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export interface RestaurantContextType {
  restaurant: Restaurant | null;
  isLoading: boolean;
}
