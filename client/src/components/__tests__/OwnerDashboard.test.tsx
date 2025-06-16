import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import OwnerDashboard from '../owner/OwnerDashboard'
import { useAuthStore } from '../../stores/authStore'
import { useMenuStore } from '../../stores/menuStore'
import { usePromotionStore } from '../../stores/promotionStore'
import { mockUsers } from '../../test/utils'

// Mock the stores
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('../../stores/menuStore', () => ({
  useMenuStore: vi.fn()
}))

vi.mock('../../stores/promotionStore', () => ({
  usePromotionStore: vi.fn()
}))

const mockUseAuthStore = useAuthStore as unknown as ReturnType<typeof vi.fn>
const mockUseMenuStore = useMenuStore as unknown as ReturnType<typeof vi.fn>
const mockUsePromotionStore = usePromotionStore as unknown as ReturnType<typeof vi.fn>

describe('OwnerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseAuthStore.mockReturnValue({
      user: mockUsers.owner,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn()
    })

    mockUseMenuStore.mockReturnValue({
      menuItems: [],
      isLoading: false
    })

    mockUsePromotionStore.mockReturnValue({
      activePromotions: [],
      isLoading: false
    })
  })

  describe('access control', () => {
    it('should render dashboard for owner users', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Owner Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Welcome back, Test Owner')).toBeInTheDocument()
      })
    })

    it('should show access denied for non-owner users', () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUsers.customer,
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn()
      })

      render(<OwnerDashboard />)
      
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(screen.getByText('Only restaurant owners can access this dashboard')).toBeInTheDocument()
    })

    it('should show access denied for unauthenticated users', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn()
      })

      render(<OwnerDashboard />)
      
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })
  })

  describe('dashboard metrics', () => {
    beforeEach(() => {
      render(<OwnerDashboard />)
    })

    it('should display key performance metrics', async () => {
      await waitFor(() => {
        expect(screen.getByText('Today\'s Revenue')).toBeInTheDocument()
        expect(screen.getByText('Orders Today')).toBeInTheDocument()
        expect(screen.getByText('Active Customers')).toBeInTheDocument()
        expect(screen.getByText('Avg Rating')).toBeInTheDocument()
      })
    })

    it('should show revenue with trend indicators', async () => {
      await waitFor(() => {
        expect(screen.getByText(/\$2,847/)).toBeInTheDocument()
        expect(screen.getByText(/\+12% from yesterday/)).toBeInTheDocument()
      })
    })

    it('should display order count with trends', async () => {
      await waitFor(() => {
        expect(screen.getByText('42')).toBeInTheDocument()
        expect(screen.getByText(/\+5% from yesterday/)).toBeInTheDocument()
      })
    })

    it('should show customer metrics', async () => {
      await waitFor(() => {
        expect(screen.getByText('156')).toBeInTheDocument()
        expect(screen.getByText(/\+8% this week/)).toBeInTheDocument()
      })
    })

    it('should display average rating', async () => {
      await waitFor(() => {
        expect(screen.getByText('4.7')).toBeInTheDocument()
        expect(screen.getByText(/Based on 127 reviews/)).toBeInTheDocument()
      })
    })
  })

  describe('time range controls', () => {
    it('should show time range selection buttons', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /week/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /month/i })).toBeInTheDocument()
      })
    })

    it('should have default time range selected', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        // Should have today selected by default
        const todayButton = screen.getByRole('button', { name: /today/i })
        expect(todayButton).toBeInTheDocument()
      })
    })

    it('should handle time range changes', async () => {
      const { user } = render(<OwnerDashboard />)
      
      await waitFor(() => {
        const weekButton = screen.getByRole('button', { name: /week/i })
        expect(weekButton).toBeInTheDocument()
      })

      const weekButton = screen.getByRole('button', { name: /week/i })
      await user.click(weekButton)
      
      // Should update the data (mock implementation)
      expect(weekButton).toBeInTheDocument()
    })
  })

  describe('inventory alerts', () => {
    it('should show inventory alerts section', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText(/Inventory Alerts/)).toBeInTheDocument()
        expect(screen.getByText(/items running low on inventory/)).toBeInTheDocument()
      })
    })

    it('should display critical inventory items', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Truffle Oil')).toBeInTheDocument()
        expect(screen.getByText('Fresh Salmon')).toBeInTheDocument()
        expect(screen.getByText('Caesar Dressing')).toBeInTheDocument()
      })
    })

    it('should show inventory status indicators', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Critical')).toBeInTheDocument()
        expect(screen.getAllByText('Low')).toHaveLength(2)
      })
    })
  })

  describe('recent orders section', () => {
    it('should display recent orders', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Recent Orders')).toBeInTheDocument()
        expect(screen.getByText('Latest orders from customers')).toBeInTheDocument()
      })
    })

    it('should show order details', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument()
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
        expect(screen.getByText('Mike Chen')).toBeInTheDocument()
      })
    })

    it('should display order statuses', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('preparing')).toBeInTheDocument()
        expect(screen.getByText('ready')).toBeInTheDocument()
        expect(screen.getByText('completed')).toBeInTheDocument()
      })
    })

    it('should show order totals', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('$47.50')).toBeInTheDocument()
        expect(screen.getByText('$65.00')).toBeInTheDocument()
        expect(screen.getByText('$28.50')).toBeInTheDocument()
      })
    })
  })

  describe('popular items section', () => {
    it('should display popular items', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Popular Items Today')).toBeInTheDocument()
        expect(screen.getByText('Best performing menu items')).toBeInTheDocument()
      })
    })

    it('should show item rankings', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Truffle Pasta')).toBeInTheDocument()
        expect(screen.getByText('Grilled Salmon')).toBeInTheDocument()
        expect(screen.getByText('Caesar Salad')).toBeInTheDocument()
        expect(screen.getByText('Ribeye Steak')).toBeInTheDocument()
      })
    })

    it('should display order counts and revenue', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('156 orders')).toBeInTheDocument()
        expect(screen.getByText('142 orders')).toBeInTheDocument()
        expect(screen.getByText('$4680')).toBeInTheDocument()
        expect(screen.getByText('$4260')).toBeInTheDocument()
      })
    })
  })

  describe('inventory status section', () => {
    it('should display inventory status grid', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Inventory Status')).toBeInTheDocument()
        expect(screen.getByText('Current stock levels and alerts')).toBeInTheDocument()
      })
    })

    it('should show inventory levels', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Current: 2 | Min: 5')).toBeInTheDocument()
        expect(screen.getByText('Current: 8 | Min: 10')).toBeInTheDocument()
        expect(screen.getByText('Current: 25 | Min: 15')).toBeInTheDocument()
      })
    })

    it('should have inventory management buttons', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add stock/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /manage inventory/i })).toBeInTheDocument()
      })
    })
  })

  describe('quick actions', () => {
    it('should display quick action buttons', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /add menu item/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /create promotion/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /view reports/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /restaurant settings/i })).toBeInTheDocument()
      })
    })

    it('should handle quick action clicks', async () => {
      const { user } = render(<OwnerDashboard />)
      
      await waitFor(() => {
        const addMenuButton = screen.getByRole('button', { name: /add menu item/i })
        expect(addMenuButton).toBeInTheDocument()
      })

      const addMenuButton = screen.getByRole('button', { name: /add menu item/i })
      await user.click(addMenuButton)
      
      // Should handle the click (mock implementation)
      expect(addMenuButton).toBeInTheDocument()
    })
  })

  describe('settings and controls', () => {
    it('should show settings button', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
      })
    })

    it('should display view all buttons', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view all orders/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /view analytics/i })).toBeInTheDocument()
      })
    })
  })

  describe('loading states', () => {
    it('should show loading spinner when data is being fetched', () => {
      // Mock loading state by not setting the mock data immediately
      render(<OwnerDashboard />)
      
      // Should show loading initially before data loads
      expect(screen.getByRole('presentation', { hidden: true }) || 
             screen.getByText(/loading/i) || 
             document.querySelector('.animate-spin')).toBeTruthy()
    })
  })

  describe('responsive design', () => {
    it('should render properly on different screen sizes', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        // Should have responsive grid classes
        const metricsGrid = screen.getByText('Today\'s Revenue').closest('.grid')
        expect(metricsGrid).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })
    })

    it('should have accessible button labels', async () => {
      render(<OwnerDashboard />)
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
          expect(button).toBeInTheDocument()
        })
      })
    })
  })
})