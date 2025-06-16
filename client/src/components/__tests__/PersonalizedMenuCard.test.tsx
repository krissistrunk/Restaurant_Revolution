import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '../../test/utils'
import PersonalizedMenuCard from '../menu/PersonalizedMenuCard'
import { useAuthStore } from '../../stores/authStore'
import { useMenuStore } from '../../stores/menuStore'
import { mockMenuItems, mockUsers } from '../../test/utils'

// Mock the stores
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('../../stores/menuStore', () => ({
  useMenuStore: vi.fn()
}))

const mockAddToFavorites = vi.fn()
const mockRemoveFromFavorites = vi.fn()
const mockOnAddToCart = vi.fn()

const mockUseAuthStore = useAuthStore as unknown as ReturnType<typeof vi.fn>
const mockUseMenuStore = useMenuStore as unknown as ReturnType<typeof vi.fn>

describe('PersonalizedMenuCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseAuthStore.mockReturnValue({
      user: mockUsers.customer,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn()
    })

    mockUseMenuStore.mockReturnValue({
      addToFavorites: mockAddToFavorites,
      removeFromFavorites: mockRemoveFromFavorites
    })
  })

  describe('basic rendering', () => {
    it('should render menu item information', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByText('Truffle Pasta')).toBeInTheDocument()
      expect(screen.getByText(/Fresh pasta with truffle oil/)).toBeInTheDocument()
      expect(screen.getByText('$28.99')).toBeInTheDocument()
    })

    it('should display preparation time and popularity', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByText('15min')).toBeInTheDocument()
      expect(screen.getByText('92%')).toBeInTheDocument()
    })

    it('should show dietary tags', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByText('vegetarian')).toBeInTheDocument()
    })
  })

  describe('personalization features', () => {
    it('should show AI Pick badge for personalized items', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByText('AI Pick')).toBeInTheDocument()
    })

    it('should display personalization score', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByText('94% match')).toBeInTheDocument()
    })

    it('should show personalization reason', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      // Should show some personalization reason
      expect(screen.getByText(/Perfect match for your taste/)).toBeInTheDocument()
    })

    it('should not show AI Pick badge for non-personalized items', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[1]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.queryByText('AI Pick')).not.toBeInTheDocument()
    })
  })

  describe('pricing display', () => {
    it('should show original price and discount for sale items', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByText('$28.99')).toBeInTheDocument()
      expect(screen.getByText('$32.99')).toBeInTheDocument()
      expect(screen.getByText(/12% off/)).toBeInTheDocument()
    })

    it('should show regular price for non-sale items', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[1]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByText('$32.00')).toBeInTheDocument()
      expect(screen.queryByText(/% off/)).not.toBeInTheDocument()
    })
  })

  describe('availability status', () => {
    it('should show limited availability badge', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[2]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByText('Only 3 left')).toBeInTheDocument()
    })

    it('should disable add to cart button for sold out items', () => {
      const soldOutItem = {
        ...mockMenuItems[0],
        availability: 'sold-out' as const
      }
      
      render(
        <PersonalizedMenuCard 
          item={soldOutItem} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      const addButton = screen.getByRole('button', { name: /sold out/i })
      expect(addButton).toBeDisabled()
    })

    it('should show sold out overlay for unavailable items', () => {
      const soldOutItem = {
        ...mockMenuItems[0],
        availability: 'sold-out' as const
      }
      
      render(
        <PersonalizedMenuCard 
          item={soldOutItem} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByText('Sold Out')).toBeInTheDocument()
    })
  })

  describe('special indicators', () => {
    it('should show New badge for new items', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[1]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('should show Chef\'s Special badge', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByText('Chef\'s Special')).toBeInTheDocument()
    })

    it('should display spice level indicators', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[1]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      // Should show spice indicator for items with spice level > 0
      expect(screen.getByText('🌶️')).toBeInTheDocument()
    })
  })

  describe('favorites functionality', () => {
    it('should show filled heart for favorite items', () => {
      const userWithFavorites = {
        ...mockUsers.customer,
        preferences: {
          ...mockUsers.customer.preferences!,
          favoriteItems: [1] // Item with ID 1 is favorited
        }
      }
      
      mockUseAuthStore.mockReturnValue({
        user: userWithFavorites,
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn()
      })
      
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      const favoriteButton = screen.getByRole('button', { name: /favorite/i })
      expect(favoriteButton).toBeInTheDocument()
    })

    it('should call addToFavorites when clicking unfavorited item', async () => {
      const { user } = render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      const favoriteButton = screen.getByRole('button', { name: /favorite/i })
      await user.click(favoriteButton)
      
      expect(mockAddToFavorites).toHaveBeenCalledWith(1, mockUsers.customer.id)
    })

    it('should call removeFromFavorites when clicking favorited item', async () => {
      const userWithFavorites = {
        ...mockUsers.customer,
        preferences: {
          ...mockUsers.customer.preferences!,
          favoriteItems: [1]
        }
      }
      
      mockUseAuthStore.mockReturnValue({
        user: userWithFavorites,
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn()
      })
      
      const { user } = render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      const favoriteButton = screen.getByRole('button', { name: /favorite/i })
      await user.click(favoriteButton)
      
      expect(mockRemoveFromFavorites).toHaveBeenCalledWith(1, mockUsers.customer.id)
    })

    it('should not show favorite button when user is not logged in', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn()
      })
      
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.queryByRole('button', { name: /favorite/i })).not.toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should call onAddToCart when add to cart is clicked', async () => {
      const { user } = render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      const addButton = screen.getByRole('button', { name: /add to cart/i })
      await user.click(addButton)
      
      expect(mockOnAddToCart).toHaveBeenCalledWith(mockMenuItems[0])
    })

    it('should show details button', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument()
    })

    it('should handle details button click', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const { user } = render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      const detailsButton = screen.getByRole('button', { name: /details/i })
      await user.click(detailsButton)
      
      expect(consoleSpy).toHaveBeenCalledWith('Show details for:', 'Truffle Pasta')
      
      consoleSpy.mockRestore()
    })
  })

  describe('flash sales', () => {
    it('should show flash sale badge and timer for flash sale items', () => {
      const flashSaleItem = {
        ...mockMenuItems[0],
        flashSaleEndTime: new Date(Date.now() + 3600000) // 1 hour from now
      }
      
      render(
        <PersonalizedMenuCard 
          item={flashSaleItem} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByText('Flash Sale')).toBeInTheDocument()
      expect(screen.getByText('Flash Sale Ends:')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper alt text for images', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      const image = screen.getByAltText('Truffle Pasta')
      expect(image).toBeInTheDocument()
    })

    it('should have accessible button labels', () => {
      render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
        />
      )
      
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PersonalizedMenuCard 
          item={mockMenuItems[0]} 
          onAddToCart={mockOnAddToCart}
          className="custom-class"
        />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})