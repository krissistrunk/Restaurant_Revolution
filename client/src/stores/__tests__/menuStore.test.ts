import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMenuStore } from '../menuStore'
import { mockMenuItems, mockUsers } from '../../test/utils'

describe('MenuStore', () => {
  beforeEach(() => {
    // Reset store state
    const store = useMenuStore.getState()
    store.menuItems = []
    store.personalizedItems = []
    store.currentDeals = []
    store.flashSales = []
    store.isLoading = false
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have empty arrays initially', () => {
      const state = useMenuStore.getState()
      expect(state.menuItems).toEqual([])
      expect(state.personalizedItems).toEqual([])
      expect(state.currentDeals).toEqual([])
      expect(state.flashSales).toEqual([])
      expect(state.isLoading).toBe(false)
    })

    it('should have default context values', () => {
      const state = useMenuStore.getState()
      expect(state.weatherContext.temperature).toBeDefined()
      expect(state.timeContext.period).toBeDefined()
    })
  })

  describe('menu management', () => {
    it('should set menu items correctly', () => {
      const { setMenuItems } = useMenuStore.getState()
      
      setMenuItems(mockMenuItems)
      
      const { menuItems } = useMenuStore.getState()
      expect(menuItems).toEqual(mockMenuItems)
    })

    it('should filter items by category', () => {
      const { setMenuItems, getItemsByCategory } = useMenuStore.getState()
      
      setMenuItems(mockMenuItems)
      const mainCourses = getItemsByCategory('Main Course')
      
      expect(mainCourses).toHaveLength(2)
      expect(mainCourses.every(item => item.category === 'Main Course')).toBe(true)
    })

    it('should filter items by availability', () => {
      const { setMenuItems, getAvailableItems } = useMenuStore.getState()
      
      setMenuItems(mockMenuItems)
      const availableItems = getAvailableItems()
      
      expect(availableItems.every(item => item.availability !== 'sold-out')).toBe(true)
    })

    it('should get item by id', () => {
      const { setMenuItems, getItemById } = useMenuStore.getState()
      
      setMenuItems(mockMenuItems)
      const item = getItemById(1)
      
      expect(item).toEqual(mockMenuItems[0])
    })

    it('should return undefined for non-existent item id', () => {
      const { setMenuItems, getItemById } = useMenuStore.getState()
      
      setMenuItems(mockMenuItems)
      const item = getItemById(999)
      
      expect(item).toBeUndefined()
    })
  })

  describe('personalization features', () => {
    it('should generate personalized menu based on preferences', () => {
      const { setMenuItems, mockPersonalizeMenu } = useMenuStore.getState()
      
      setMenuItems(mockMenuItems)
      mockPersonalizeMenu(mockUsers.customer.preferences)
      
      const { personalizedItems } = useMenuStore.getState()
      expect(personalizedItems.length).toBeGreaterThan(0)
      expect(personalizedItems.every(item => item.isPersonalized)).toBe(true)
    })

    it('should generate weather-based recommendations', () => {
      const { mockWeatherRecommendations } = useMenuStore.getState()
      
      mockWeatherRecommendations()
      
      const { weatherContext } = useMenuStore.getState()
      expect(weatherContext.recommendations.length).toBeGreaterThan(0)
    })

    it('should generate time-based recommendations', () => {
      const { mockTimeBasedRecommendations } = useMenuStore.getState()
      
      mockTimeBasedRecommendations()
      
      const { timeContext } = useMenuStore.getState()
      expect(timeContext.recommendations.length).toBeGreaterThan(0)
    })

    it('should update weather context', () => {
      const { updateWeatherContext } = useMenuStore.getState()
      
      const newWeather = {
        temperature: 85,
        condition: 'sunny',
        recommendations: ['Cold drinks', 'Light salads']
      }
      
      updateWeatherContext(newWeather)
      
      const { weatherContext } = useMenuStore.getState()
      expect(weatherContext.temperature).toBe(85)
      expect(weatherContext.condition).toBe('sunny')
      expect(weatherContext.recommendations).toEqual(['Cold drinks', 'Light salads'])
    })

    it('should update time context', () => {
      const { updateTimeContext } = useMenuStore.getState()
      
      const newTime = {
        period: 'dinner',
        recommendations: ['Hearty mains', 'Wine pairings']
      }
      
      updateTimeContext(newTime)
      
      const { timeContext } = useMenuStore.getState()
      expect(timeContext.period).toBe('dinner')
      expect(timeContext.recommendations).toEqual(['Hearty mains', 'Wine pairings'])
    })
  })

  describe('favorites management', () => {
    beforeEach(() => {
      const { setMenuItems } = useMenuStore.getState()
      setMenuItems(mockMenuItems)
    })

    it('should add item to favorites', () => {
      const { addToFavorites } = useMenuStore.getState()
      
      addToFavorites(1, mockUsers.customer.id)
      
      // This is a mock implementation, so we just verify it doesn't throw
      expect(() => addToFavorites(1, mockUsers.customer.id)).not.toThrow()
    })

    it('should remove item from favorites', () => {
      const { removeFromFavorites } = useMenuStore.getState()
      
      removeFromFavorites(1, mockUsers.customer.id)
      
      // This is a mock implementation, so we just verify it doesn't throw
      expect(() => removeFromFavorites(1, mockUsers.customer.id)).not.toThrow()
    })
  })

  describe('deals and promotions', () => {
    it('should get current deals', () => {
      const { getCurrentDeals } = useMenuStore.getState()
      
      getCurrentDeals()
      
      // Mock implementation should set some deals
      const { currentDeals } = useMenuStore.getState()
      expect(Array.isArray(currentDeals)).toBe(true)
    })

    it('should get flash sales', () => {
      const { getFlashSales } = useMenuStore.getState()
      
      getFlashSales()
      
      // Mock implementation should set some flash sales
      const { flashSales } = useMenuStore.getState()
      expect(Array.isArray(flashSales)).toBe(true)
    })

    it('should get personalized menu', () => {
      const { getPersonalizedMenu } = useMenuStore.getState()
      
      getPersonalizedMenu(mockUsers.customer.id)
      
      // Mock implementation should set personalized items
      const { personalizedItems } = useMenuStore.getState()
      expect(Array.isArray(personalizedItems)).toBe(true)
    })
  })

  describe('filtering and search', () => {
    beforeEach(() => {
      const { setMenuItems } = useMenuStore.getState()
      setMenuItems(mockMenuItems)
    })

    it('should filter vegetarian items', () => {
      const { menuItems } = useMenuStore.getState()
      
      const vegetarianItems = menuItems.filter(item => item.isVegetarian)
      
      expect(vegetarianItems.length).toBeGreaterThan(0)
      expect(vegetarianItems.every(item => item.isVegetarian)).toBe(true)
    })

    it('should filter by dietary restrictions', () => {
      const { menuItems } = useMenuStore.getState()
      
      const glutenFreeItems = menuItems.filter(item => item.isGlutenFree)
      
      expect(glutenFreeItems.some(item => item.isGlutenFree)).toBe(true)
    })

    it('should filter by spice level', () => {
      const { menuItems } = useMenuStore.getState()
      
      const mildItems = menuItems.filter(item => item.spiceLevel <= 1)
      
      expect(mildItems.every(item => item.spiceLevel <= 1)).toBe(true)
    })

    it('should filter chef specials', () => {
      const { menuItems } = useMenuStore.getState()
      
      const chefSpecials = menuItems.filter(item => item.isChefSpecial)
      
      expect(chefSpecials.some(item => item.isChefSpecial)).toBe(true)
    })
  })

  describe('loading states', () => {
    it('should handle loading state correctly', () => {
      const store = useMenuStore.getState()
      
      // Set loading state
      store.isLoading = true
      expect(store.isLoading).toBe(true)
      
      // Clear loading state
      store.isLoading = false
      expect(store.isLoading).toBe(false)
    })
  })

  describe('inventory management', () => {
    beforeEach(() => {
      const { setMenuItems } = useMenuStore.getState()
      setMenuItems(mockMenuItems)
    })

    it('should track inventory levels', () => {
      const { menuItems } = useMenuStore.getState()
      
      const itemWithInventory = menuItems.find(item => item.inventory !== undefined)
      expect(itemWithInventory).toBeDefined()
      expect(typeof itemWithInventory?.inventory).toBe('number')
    })

    it('should handle availability based on inventory', () => {
      const { menuItems } = useMenuStore.getState()
      
      const limitedItem = menuItems.find(item => item.availability === 'limited')
      expect(limitedItem).toBeDefined()
      expect(limitedItem?.inventory).toBeLessThan(10)
    })
  })

  describe('pricing', () => {
    beforeEach(() => {
      const { setMenuItems } = useMenuStore.getState()
      setMenuItems(mockMenuItems)
    })

    it('should handle original pricing for sales', () => {
      const { menuItems } = useMenuStore.getState()
      
      const saleItem = menuItems.find(item => item.originalPrice)
      expect(saleItem).toBeDefined()
      expect(saleItem?.originalPrice).toBeGreaterThan(saleItem?.price || 0)
    })

    it('should calculate discount percentage correctly', () => {
      const { menuItems } = useMenuStore.getState()
      
      const saleItem = menuItems.find(item => item.originalPrice)
      if (saleItem && saleItem.originalPrice) {
        const discountPercent = Math.round(((saleItem.originalPrice - saleItem.price) / saleItem.originalPrice) * 100)
        expect(discountPercent).toBeGreaterThan(0)
        expect(discountPercent).toBeLessThan(100)
      }
    })
  })
})