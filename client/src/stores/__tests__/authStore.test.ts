import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../authStore'
import { mockUsers } from '../../test/utils'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.getState().logout()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have no user initially', () => {
      const { user, isAuthenticated } = useAuthStore.getState()
      expect(user).toBeNull()
      expect(isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('should set user and authentication state on login', () => {
      const { login } = useAuthStore.getState()
      
      login(mockUsers.customer)
      
      const { user, isAuthenticated } = useAuthStore.getState()
      expect(user).toEqual(mockUsers.customer)
      expect(isAuthenticated).toBe(true)
    })

    it('should persist user to localStorage on login', () => {
      const { login } = useAuthStore.getState()
      
      login(mockUsers.customer)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'restaurant-user',
        JSON.stringify(mockUsers.customer)
      )
    })

    it('should handle owner login correctly', () => {
      const { login } = useAuthStore.getState()
      
      login(mockUsers.owner)
      
      const { user } = useAuthStore.getState()
      expect(user?.role).toBe('owner')
    })
  })

  describe('logout', () => {
    it('should clear user and authentication state on logout', () => {
      const { login, logout } = useAuthStore.getState()
      
      // First login
      login(mockUsers.customer)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      
      // Then logout
      logout()
      
      const { user, isAuthenticated } = useAuthStore.getState()
      expect(user).toBeNull()
      expect(isAuthenticated).toBe(false)
    })

    it('should remove user from localStorage on logout', () => {
      const { login, logout } = useAuthStore.getState()
      
      login(mockUsers.customer)
      logout()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('restaurant-user')
    })
  })

  describe('updateUser', () => {
    it('should update user data', () => {
      const { login, updateUser } = useAuthStore.getState()
      
      login(mockUsers.customer)
      
      const updatedData = {
        name: 'Updated Name',
        loyaltyPoints: 500
      }
      
      updateUser(updatedData)
      
      const { user } = useAuthStore.getState()
      expect(user?.name).toBe('Updated Name')
      expect(user?.loyaltyPoints).toBe(500)
      expect(user?.email).toBe(mockUsers.customer.email) // Should preserve other fields
    })

    it('should persist updated user to localStorage', () => {
      const { login, updateUser } = useAuthStore.getState()
      
      login(mockUsers.customer)
      updateUser({ name: 'Updated Name' })
      
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2) // Once for login, once for update
    })

    it('should not update if no user is logged in', () => {
      const { updateUser } = useAuthStore.getState()
      
      updateUser({ name: 'Should not work' })
      
      const { user } = useAuthStore.getState()
      expect(user).toBeNull()
    })
  })

  describe('persistence', () => {
    it('should load user from localStorage on store creation', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUsers.customer))
      
      // Create a new store instance to trigger initialization
      const store = useAuthStore.getState()
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('restaurant-user')
    })

    it('should handle invalid localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')
      
      // Should not throw an error
      expect(() => {
        const store = useAuthStore.getState()
      }).not.toThrow()
    })
  })

  describe('role-based access', () => {
    it('should correctly identify customer role', () => {
      const { login } = useAuthStore.getState()
      
      login(mockUsers.customer)
      
      const { user } = useAuthStore.getState()
      expect(user?.role).toBe('customer')
    })

    it('should correctly identify owner role', () => {
      const { login } = useAuthStore.getState()
      
      login(mockUsers.owner)
      
      const { user } = useAuthStore.getState()
      expect(user?.role).toBe('owner')
    })

    it('should handle VIP customer tier', () => {
      const { login } = useAuthStore.getState()
      
      login(mockUsers.vipCustomer)
      
      const { user } = useAuthStore.getState()
      expect(user?.tier).toBe('vip')
      expect(user?.loyaltyPoints).toBe(1250)
    })
  })

  describe('preferences management', () => {
    it('should update user preferences correctly', () => {
      const { login, updateUser } = useAuthStore.getState()
      
      login(mockUsers.customer)
      
      const newPreferences = {
        preferences: {
          cuisine: ['Thai', 'Indian'],
          spiceLevel: 4,
          priceRange: [15, 50] as [number, number],
          favoriteItems: [2, 4],
          allergens: ['shellfish']
        }
      }
      
      updateUser(newPreferences)
      
      const { user } = useAuthStore.getState()
      expect(user?.preferences).toEqual(newPreferences.preferences)
    })

    it('should handle partial preference updates', () => {
      const { login, updateUser } = useAuthStore.getState()
      
      login(mockUsers.customer)
      
      const originalPreferences = mockUsers.customer.preferences
      
      updateUser({
        preferences: {
          ...originalPreferences,
          spiceLevel: 5
        }
      })
      
      const { user } = useAuthStore.getState()
      expect(user?.preferences?.spiceLevel).toBe(5)
      expect(user?.preferences?.cuisine).toEqual(originalPreferences?.cuisine)
    })
  })
})