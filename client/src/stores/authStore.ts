import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'customer' | 'owner' | 'staff';
  tier?: 'regular' | 'vip' | 'premium';
  loyaltyPoints?: number;
  phone?: string;
  dietaryPreferences?: string[];
  preferences?: {
    cuisine: string[];
    spiceLevel: number;
    priceRange: [number, number];
    favoriteItems: number[];
    allergens: string[];
  };
  socialLogins?: {
    google?: string;
    facebook?: string;
    apple?: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setBiometric: (enabled: boolean) => void;
  
  // Mock social login
  mockSocialLogin: (provider: 'google' | 'facebook' | 'apple', userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      biometricEnabled: false,

      login: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true,
          isLoading: false 
        });
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...updates } 
          });
        }
      },

      setBiometric: (enabled: boolean) => {
        set({ biometricEnabled: enabled });
      },

      mockSocialLogin: async (provider: 'google' | 'facebook' | 'apple', userData: Partial<User>) => {
        set({ isLoading: true });
        
        // Mock API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser: User = {
          id: Math.floor(Math.random() * 10000),
          username: userData.email?.split('@')[0] || 'user',
          name: userData.name || 'Social User',
          email: userData.email || `${provider}user@example.com`,
          role: 'customer',
          tier: 'regular',
          loyaltyPoints: 0,
          socialLogins: {
            [provider]: userData.email || `${provider}_id_${Date.now()}`
          },
          preferences: {
            cuisine: [],
            spiceLevel: 2,
            priceRange: [10, 50],
            favoriteItems: [],
            allergens: []
          },
          ...userData
        };

        set({ 
          user: mockUser, 
          isAuthenticated: true,
          isLoading: false 
        });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        biometricEnabled: state.biometricEnabled 
      }),
    }
  )
);