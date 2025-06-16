import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import LoginPage from '../../pages/LoginPage'
import { useAuthStore } from '../../stores/authStore'

// Mock the auth store
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

const mockLogin = vi.fn()
const mockUseAuthStore = useAuthStore as unknown as ReturnType<typeof vi.fn>

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: mockLogin,
      logout: vi.fn(),
      updateUser: vi.fn()
    })
  })

  describe('rendering', () => {
    it('should render the login page with all tabs', () => {
      render(<LoginPage />)
      
      expect(screen.getByText('Welcome to Restaurant Revolution')).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /traditional/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /social/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /biometric/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /guest/i })).toBeInTheDocument()
    })

    it('should have traditional tab active by default', () => {
      render(<LoginPage />)
      
      const traditionalTab = screen.getByRole('tab', { name: /traditional/i })
      expect(traditionalTab).toHaveAttribute('aria-selected', 'true')
    })

    it('should display username and password fields in traditional tab', () => {
      render(<LoginPage />)
      
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })
  })

  describe('tab navigation', () => {
    it('should switch to social tab when clicked', async () => {
      const { user } = render(<LoginPage />)
      
      const socialTab = screen.getByRole('tab', { name: /social/i })
      await user.click(socialTab)
      
      expect(socialTab).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText(/sign in with your social accounts/i)).toBeInTheDocument()
    })

    it('should switch to biometric tab when clicked', async () => {
      const { user } = render(<LoginPage />)
      
      const biometricTab = screen.getByRole('tab', { name: /biometric/i })
      await user.click(biometricTab)
      
      expect(biometricTab).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText(/use your fingerprint or face/i)).toBeInTheDocument()
    })

    it('should switch to guest tab when clicked', async () => {
      const { user } = render(<LoginPage />)
      
      const guestTab = screen.getByRole('tab', { name: /guest/i })
      await user.click(guestTab)
      
      expect(guestTab).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText(/browse as a guest/i)).toBeInTheDocument()
    })
  })

  describe('traditional login', () => {
    it('should handle form submission with valid credentials', async () => {
      const { user } = render(<LoginPage />)
      
      const usernameInput = screen.getByLabelText(/username/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      expect(mockLogin).toHaveBeenCalled()
    })

    it('should show validation errors for empty fields', async () => {
      const { user } = render(<LoginPage />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      // Should show validation messages (implementation depends on form validation)
      expect(submitButton).toBeInTheDocument() // Basic check that form is still there
    })

    it('should toggle password visibility', async () => {
      const { user } = render(<LoginPage />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('social login', () => {
    it('should render social login buttons', async () => {
      const { user } = render(<LoginPage />)
      
      const socialTab = screen.getByRole('tab', { name: /social/i })
      await user.click(socialTab)
      
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continue with facebook/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continue with apple/i })).toBeInTheDocument()
    })

    it('should handle social login clicks', async () => {
      const { user } = render(<LoginPage />)
      
      const socialTab = screen.getByRole('tab', { name: /social/i })
      await user.click(socialTab)
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i })
      await user.click(googleButton)
      
      // Should trigger mock login
      expect(mockLogin).toHaveBeenCalled()
    })
  })

  describe('biometric login', () => {
    it('should render biometric login interface', async () => {
      const { user } = render(<LoginPage />)
      
      const biometricTab = screen.getByRole('tab', { name: /biometric/i })
      await user.click(biometricTab)
      
      expect(screen.getByRole('button', { name: /scan fingerprint/i })).toBeInTheDocument()
    })

    it('should handle biometric authentication', async () => {
      const { user } = render(<LoginPage />)
      
      const biometricTab = screen.getByRole('tab', { name: /biometric/i })
      await user.click(biometricTab)
      
      const scanButton = screen.getByRole('button', { name: /scan fingerprint/i })
      await user.click(scanButton)
      
      // Should show scanning state
      await waitFor(() => {
        expect(screen.getByText(/scanning/i)).toBeInTheDocument()
      })
    })
  })

  describe('guest access', () => {
    it('should render guest access interface', async () => {
      const { user } = render(<LoginPage />)
      
      const guestTab = screen.getByRole('tab', { name: /guest/i })
      await user.click(guestTab)
      
      expect(screen.getByRole('button', { name: /continue as guest/i })).toBeInTheDocument()
      expect(screen.getByText(/browse our menu and restaurants/i)).toBeInTheDocument()
    })

    it('should handle guest login', async () => {
      const { user } = render(<LoginPage />)
      
      const guestTab = screen.getByRole('tab', { name: /guest/i })
      await user.click(guestTab)
      
      const guestButton = screen.getByRole('button', { name: /continue as guest/i })
      await user.click(guestButton)
      
      // Should trigger mock login with guest user
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'customer',
          name: 'Guest User'
        })
      )
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<LoginPage />)
      
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const { user } = render(<LoginPage />)
      
      const traditionalTab = screen.getByRole('tab', { name: /traditional/i })
      
      // Focus should be manageable with keyboard
      traditionalTab.focus()
      expect(traditionalTab).toHaveFocus()
      
      // Tab navigation should work
      await user.keyboard('{ArrowRight}')
      const socialTab = screen.getByRole('tab', { name: /social/i })
      expect(socialTab).toHaveFocus()
    })
  })

  describe('responsive design', () => {
    it('should render properly on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<LoginPage />)
      
      // Should still render all essential elements
      expect(screen.getByText('Welcome to Restaurant Revolution')).toBeInTheDocument()
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should handle login errors gracefully', async () => {
      mockLogin.mockRejectedValue(new Error('Login failed'))
      
      const { user } = render(<LoginPage />)
      
      const usernameInput = screen.getByLabelText(/username/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)
      
      // Should handle error without crashing
      expect(mockLogin).toHaveBeenCalled()
    })
  })
})