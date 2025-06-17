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

export interface QueueEntry {
  id: number;
  userId: number;
  restaurantId: number;
  partySize: number;
  status: 'waiting' | 'ready' | 'completed' | 'cancelled';
  position: number;
  estimatedWaitTime: number;
  joinedAt: string;
  notes?: string | null;
  phone?: string | null;
  notificationSent?: boolean;
}

// Table Management Interfaces
export interface Table {
  id: number;
  number: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
  section: string;
  serverId?: number;
  x: number; // Position for floor plan
  y: number; // Position for floor plan
  width: number;
  height: number;
  shape: 'rectangle' | 'circle' | 'square';
  reservationId?: number;
  currentPartySize?: number;
  seatedAt?: string;
  estimatedTurnTime?: number;
  notes?: string;
  restaurantId: number;
}

export interface Server {
  id: number;
  name: string;
  email: string;
  phone?: string;
  section: string;
  status: 'active' | 'break' | 'offline';
  maxTables: number;
  currentTables: number;
  avgRating?: number;
  restaurantId: number;
}

export interface FloorPlan {
  id: number;
  name: string;
  width: number;
  height: number;
  isActive: boolean;
  restaurantId: number;
  tables: Table[];
  sections: Section[];
}

export interface Section {
  id: number;
  name: string;
  color: string;
  serverId?: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  floorPlanId: number;
}

export interface TableAssignment {
  id: number;
  tableId: number;
  queueEntryId?: number;
  reservationId?: number;
  partySize: number;
  assignedAt: string;
  seatedAt?: string;
  completedAt?: string;
  serverId?: number;
  estimatedDuration: number;
  actualDuration?: number;
  totalBill?: number;
  status: 'assigned' | 'seated' | 'completed' | 'cancelled';
}

export interface TableTurnTime {
  tableId: number;
  averageTurnTime: number;
  recentTurnTimes: number[];
  lastUpdated: string;
  peakHourAverage: number;
  offPeakAverage: number;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'table_assignment' | 'server_balance' | 'cleaning_priority' | 'reservation_spacing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  tableIds?: number[];
  serverIds?: number[];
  estimatedImpact: string;
  createdAt: string;
}
