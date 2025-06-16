import { create } from 'zustand';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'bogo' | 'free-item' | 'percentage' | 'lightning-deal';
  value: number; // percentage or dollar amount
  code?: string;
  qrCode?: string;
  conditions: {
    minOrderAmount?: number;
    maxUses?: number;
    currentUses?: number;
    validFrom: Date;
    validUntil: Date;
    validDays?: string[]; // days of week
    validHours?: [number, number]; // hour range
    userTiers?: string[]; // customer tiers
    firstTimeOnly?: boolean;
    applicableItems?: number[]; // menu item IDs
    excludeItems?: number[];
  };
  geofencing?: {
    enabled: boolean;
    latitude: number;
    longitude: number;
    radius: number; // meters
  };
  weatherTrigger?: {
    enabled: boolean;
    conditions: string[]; // 'rainy', 'cold', 'hot'
  };
  behaviorTrigger?: {
    enabled: boolean;
    trigger: 'long-absence' | 'high-spender' | 'birthday' | 'anniversary';
    daysThreshold?: number;
  };
  isActive: boolean;
  isFlashSale: boolean;
  priority: number; // for display order
  image?: string;
  shareBonus?: number; // extra discount for sharing
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'free-item' | 'upgrade' | 'experience';
  value: number;
  qrCode: string;
  tier: 'regular' | 'vip' | 'premium';
  isLimitedTime?: boolean;
  validUntil?: Date;
  isRedeemed: boolean;
  redeemedAt?: Date;
}

export interface GameElement {
  id: string;
  type: 'badge' | 'challenge' | 'level' | 'streak';
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: {
    points: number;
    badge?: string;
    promotion?: string;
  };
  isCompleted: boolean;
  completedAt?: Date;
  icon: string;
}

interface PromotionState {
  activePromotions: Promotion[];
  availableRewards: LoyaltyReward[];
  gameElements: GameElement[];
  userPromotions: Promotion[]; // personalized for current user
  flashSales: Promotion[];
  isLoading: boolean;
  
  // User-specific data
  loyaltyPoints: number;
  currentTier: string;
  streakDays: number;
  totalVisits: number;
  lifetimeSpend: number;

  // Actions
  loadPromotions: () => Promise<void>;
  applyPromotion: (promotionId: string) => Promise<boolean>;
  generateQRCode: (promotionId: string) => Promise<string>;
  sharePromotion: (promotionId: string, platform: string) => Promise<boolean>;
  redeemLoyaltyReward: (rewardId: string) => Promise<boolean>;
  checkGeofencingPromotions: (lat: number, lng: number) => Promotion[];
  triggerBehaviorPromotions: (behavior: string) => Promotion[];
  updateGameProgress: (action: string, value: number) => void;
  
  // Mock functions
  mockLocationBasedPromotions: (lat: number, lng: number) => void;
  mockWeatherPromotions: (weather: string) => void;
  mockBehaviorPromotions: (userId: number) => void;
}

// Mock promotion data
const mockPromotions: Promotion[] = [
  {
    id: 'flash-001',
    title: '⚡ Flash Sale: 25% Off Appetizers',
    description: 'Limited time offer - only for the next 2 hours!',
    type: 'lightning-deal',
    value: 25,
    conditions: {
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      maxUses: 50,
      currentUses: 23,
      applicableItems: [1, 2] // appetizer IDs
    },
    isActive: true,
    isFlashSale: true,
    priority: 1,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
  },
  {
    id: 'weather-001',
    title: '🌧️ Rainy Day Special',
    description: 'Free hot soup with any main course on rainy days',
    type: 'free-item',
    value: 0,
    conditions: {
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      minOrderAmount: 25
    },
    weatherTrigger: {
      enabled: true,
      conditions: ['rainy', 'cold']
    },
    isActive: true,
    isFlashSale: false,
    priority: 2,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400'
  },
  {
    id: 'loyalty-qr-001',
    title: 'VIP Member Exclusive',
    description: 'Scan QR code for 20% off your entire order',
    type: 'percentage',
    value: 20,
    qrCode: 'VIP20-QR-CODE-12345',
    conditions: {
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userTiers: ['vip', 'premium']
    },
    isActive: true,
    isFlashSale: false,
    priority: 3,
    shareBonus: 5 // extra 5% for sharing
  },
  {
    id: 'geo-001',
    title: 'Welcome Back!',
    description: 'You\'re near our restaurant - enjoy 15% off your order!',
    type: 'percentage',
    value: 15,
    conditions: {
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      maxUses: 1
    },
    geofencing: {
      enabled: true,
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 500 // 500 meters
    },
    isActive: true,
    isFlashSale: false,
    priority: 4
  }
];

const mockLoyaltyRewards: LoyaltyReward[] = [
  {
    id: 'reward-001',
    title: 'Free Appetizer',
    description: 'Redeem for any appetizer on our menu',
    pointsCost: 500,
    type: 'free-item',
    value: 0,
    qrCode: 'FREE-APP-QR-001',
    tier: 'regular',
    isRedeemed: false
  },
  {
    id: 'reward-002',
    title: '20% Off Next Visit',
    description: 'Get 20% off your entire next order',
    pointsCost: 750,
    type: 'discount',
    value: 20,
    qrCode: 'DISCOUNT-20-QR-002',
    tier: 'regular',
    isRedeemed: false
  },
  {
    id: 'reward-003',
    title: 'VIP Table Upgrade',
    description: 'Priority seating and premium table location',
    pointsCost: 1000,
    type: 'upgrade',
    value: 0,
    qrCode: 'VIP-TABLE-QR-003',
    tier: 'vip',
    isRedeemed: false
  }
];

const mockGameElements: GameElement[] = [
  {
    id: 'badge-001',
    type: 'badge',
    title: 'First Timer',
    description: 'Complete your first order',
    progress: 1,
    target: 1,
    reward: { points: 100, badge: '🥇' },
    isCompleted: true,
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    icon: '🥇'
  },
  {
    id: 'challenge-001',
    type: 'challenge',
    title: 'Weekly Regular',
    description: 'Visit 3 times this week',
    progress: 2,
    target: 3,
    reward: { points: 300, promotion: 'free-dessert' },
    isCompleted: false,
    icon: '📅'
  },
  {
    id: 'streak-001',
    type: 'streak',
    title: 'Consistency Champion',
    description: 'Order 5 days in a row',
    progress: 3,
    target: 5,
    reward: { points: 500, badge: '🔥' },
    isCompleted: false,
    icon: '🔥'
  }
];

export const usePromotionStore = create<PromotionState>((set, get) => ({
  activePromotions: [],
  availableRewards: [],
  gameElements: [],
  userPromotions: [],
  flashSales: [],
  isLoading: false,
  loyaltyPoints: 1250,
  currentTier: 'vip',
  streakDays: 3,
  totalVisits: 47,
  lifetimeSpend: 2340,

  loadPromotions: async () => {
    set({ isLoading: true });
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    set({
      activePromotions: mockPromotions,
      availableRewards: mockLoyaltyRewards,
      gameElements: mockGameElements,
      flashSales: mockPromotions.filter(p => p.isFlashSale),
      isLoading: false
    });
    
    // Trigger location and behavior checks
    get().mockLocationBasedPromotions(40.7128, -74.0060);
    get().mockBehaviorPromotions(1);
  },

  applyPromotion: async (promotionId: string) => {
    // Mock application logic
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const promotion = get().activePromotions.find(p => p.id === promotionId);
    if (promotion && promotion.conditions.maxUses) {
      // Update usage count
      set(state => ({
        activePromotions: state.activePromotions.map(p =>
          p.id === promotionId
            ? {
                ...p,
                conditions: {
                  ...p.conditions,
                  currentUses: (p.conditions.currentUses || 0) + 1
                }
              }
            : p
        )
      }));
    }
    
    return true;
  },

  generateQRCode: async (promotionId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const promotion = get().activePromotions.find(p => p.id === promotionId);
    if (promotion) {
      // Generate unique QR code for this user/promotion combo
      const qrCode = `${promotionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Update promotion with QR code
      set(state => ({
        activePromotions: state.activePromotions.map(p =>
          p.id === promotionId ? { ...p, qrCode } : p
        )
      }));
      
      return qrCode;
    }
    
    throw new Error('Promotion not found');
  },

  sharePromotion: async (promotionId: string, platform: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock sharing logic
    console.log(`Shared promotion ${promotionId} on ${platform}`);
    
    // Award share bonus
    const promotion = get().activePromotions.find(p => p.id === promotionId);
    if (promotion?.shareBonus) {
      set(state => ({
        loyaltyPoints: state.loyaltyPoints + 50 // Bonus points for sharing
      }));
    }
    
    return true;
  },

  redeemLoyaltyReward: async (rewardId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const reward = get().availableRewards.find(r => r.id === rewardId);
    if (reward && get().loyaltyPoints >= reward.pointsCost) {
      // Deduct points and mark as redeemed
      set(state => ({
        loyaltyPoints: state.loyaltyPoints - reward.pointsCost,
        availableRewards: state.availableRewards.map(r =>
          r.id === rewardId
            ? { ...r, isRedeemed: true, redeemedAt: new Date() }
            : r
        )
      }));
      
      return true;
    }
    
    return false;
  },

  checkGeofencingPromotions: (lat: number, lng: number) => {
    const { activePromotions } = get();
    return activePromotions.filter(promo => {
      if (!promo.geofencing?.enabled) return false;
      
      // Simple distance calculation (mock)
      const distance = Math.sqrt(
        Math.pow(lat - promo.geofencing.latitude, 2) +
        Math.pow(lng - promo.geofencing.longitude, 2)
      ) * 111000; // Convert to meters (approximate)
      
      return distance <= promo.geofencing.radius;
    });
  },

  triggerBehaviorPromotions: (behavior: string) => {
    // Mock behavior-based promotion triggering
    const mockPromotions: Promotion[] = [];
    
    if (behavior === 'long-absence') {
      mockPromotions.push({
        id: 'behavior-comeback',
        title: 'Welcome Back! We Missed You',
        description: '25% off your return visit',
        type: 'percentage',
        value: 25,
        conditions: {
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
          maxUses: 1
        },
        isActive: true,
        isFlashSale: false,
        priority: 1
      });
    }
    
    return mockPromotions;
  },

  updateGameProgress: (action: string, value: number) => {
    set(state => {
      const updatedGameElements = state.gameElements.map(element => {
        let newProgress = element.progress;
        
        // Update progress based on action
        if (action === 'order' && element.type === 'challenge') {
          newProgress = Math.min(element.target, element.progress + 1);
        } else if (action === 'visit' && element.type === 'streak') {
          newProgress = Math.min(element.target, element.progress + 1);
        }
        
        const isCompleted = newProgress >= element.target;
        
        // Award points if just completed
        if (isCompleted && !element.isCompleted) {
          state.loyaltyPoints += element.reward.points;
        }
        
        return {
          ...element,
          progress: newProgress,
          isCompleted,
          completedAt: isCompleted && !element.isCompleted ? new Date() : element.completedAt
        };
      });
      
      return { gameElements: updatedGameElements };
    });
  },

  mockLocationBasedPromotions: (lat: number, lng: number) => {
    const geoPromotions = get().checkGeofencingPromotions(lat, lng);
    if (geoPromotions.length > 0) {
      set(state => ({
        userPromotions: [...state.userPromotions, ...geoPromotions]
      }));
    }
  },

  mockWeatherPromotions: (weather: string) => {
    const { activePromotions } = get();
    const weatherPromotions = activePromotions.filter(promo => 
      promo.weatherTrigger?.enabled && 
      promo.weatherTrigger.conditions.includes(weather)
    );
    
    if (weatherPromotions.length > 0) {
      set(state => ({
        userPromotions: [...state.userPromotions, ...weatherPromotions]
      }));
    }
  },

  mockBehaviorPromotions: (userId: number) => {
    // Mock: Check if user hasn't visited in 7+ days
    const lastVisit = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    const daysSinceLastVisit = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastVisit >= 7) {
      const behaviorPromotions = get().triggerBehaviorPromotions('long-absence');
      set(state => ({
        userPromotions: [...state.userPromotions, ...behaviorPromotions]
      }));
    }
  }
}));