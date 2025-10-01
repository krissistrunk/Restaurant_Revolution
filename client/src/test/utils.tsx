import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  }
}

// Mock user data for testing
export const mockUsers = {
  customer: {
    id: 1,
    username: 'testcustomer',
    name: 'Test Customer',
    email: 'customer@test.com',
    role: 'customer' as const,
    tier: 'regular' as const,
    loyaltyPoints: 250,
    preferences: {
      cuisine: ['Italian', 'Mexican'],
      spiceLevel: 2,
      priceRange: [10, 40] as [number, number],
      favoriteItems: [1, 3, 5],
      allergens: ['nuts']
    }
  },
  owner: {
    id: 2,
    username: 'testowner',
    name: 'Test Owner',
    email: 'owner@test.com',
    role: 'owner' as const,
  },
  vipCustomer: {
    id: 3,
    username: 'vipcustomer',
    name: 'VIP Customer',
    email: 'vip@test.com',
    role: 'customer' as const,
    tier: 'vip' as const,
    loyaltyPoints: 1250,
    preferences: {
      cuisine: ['French', 'Japanese'],
      spiceLevel: 3,
      priceRange: [20, 80] as [number, number],
      favoriteItems: [2, 4, 6],
      allergens: []
    }
  }
}

// Mock menu items for testing
export const mockMenuItems = [
  {
    id: 1,
    name: 'Truffle Pasta',
    description: 'Fresh pasta with truffle oil and parmesan',
    price: 28.99,
    originalPrice: 32.99,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
    preparationTime: 15,
    popularity: 92,
    availability: 'available' as const,
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isNew: false,
    isChefSpecial: true,
    dietaryTags: ['vegetarian'],
    allergens: ['dairy', 'gluten'],
    isPersonalized: true,
    personalizedScore: 94,
    inventory: 15,
    ingredients: ['pasta', 'truffle oil', 'parmesan cheese', 'black pepper', 'olive oil'],
    nutrition: {
      calories: 650,
      protein: 18,
      carbs: 75,
      fat: 28,
      fiber: 3,
      sodium: 890
    }
  },
  {
    id: 2,
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon herbs',
    price: 32.00,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    preparationTime: 20,
    popularity: 88,
    availability: 'available' as const,
    spiceLevel: 1,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isNew: true,
    isChefSpecial: false,
    dietaryTags: ['gluten-free'],
    allergens: ['fish'],
    isPersonalized: false,
    inventory: 8,
    ingredients: ['atlantic salmon', 'lemon', 'fresh herbs', 'olive oil', 'garlic'],
    nutrition: {
      calories: 420,
      protein: 45,
      carbs: 2,
      fat: 24,
      fiber: 0,
      sodium: 580
    }
  },
  {
    id: 3,
    name: 'Caesar Salad',
    description: 'Romaine lettuce with caesar dressing',
    price: 14.99,
    category: 'Appetizer',
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400',
    preparationTime: 8,
    popularity: 76,
    availability: 'limited' as const,
    spiceLevel: 0,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isNew: false,
    isChefSpecial: false,
    dietaryTags: ['vegetarian'],
    allergens: ['dairy', 'gluten'],
    isPersonalized: true,
    personalizedScore: 87,
    inventory: 3,
    ingredients: ['romaine lettuce', 'caesar dressing', 'parmesan', 'croutons', 'anchovy'],
    nutrition: {
      calories: 350,
      protein: 8,
      carbs: 22,
      fat: 25,
      fiber: 4,
      sodium: 650
    }
  }
]

// Mock promotions for testing
export const mockPromotions = [
  {
    id: 'promo1',
    name: 'Happy Hour Special',
    description: '20% off all appetizers',
    discount: 20,
    type: 'percentage' as const,
    startTime: new Date('2024-01-15T17:00:00'),
    endTime: new Date('2024-01-15T19:00:00'),
    isActive: true,
    applicableItems: [3]
  },
  {
    id: 'promo2',
    name: 'Weekend Flash Sale',
    description: '$5 off orders over $30',
    discount: 5,
    type: 'fixed' as const,
    minimumOrder: 30,
    startTime: new Date('2024-01-13T00:00:00'),
    endTime: new Date('2024-01-14T23:59:59'),
    isActive: true,
    applicableItems: []
  }
]

// Helper function to wait for loading states
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Helper function to mock fetch responses
export const mockFetch = (response: any, status = 200) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
    } as Response)
  )
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }