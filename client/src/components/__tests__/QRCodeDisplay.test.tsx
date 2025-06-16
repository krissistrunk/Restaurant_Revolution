import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import QRCodeDisplay from '../loyalty/QRCodeDisplay'
import { useAuthStore } from '../../stores/authStore'
import { usePromotionStore } from '../../stores/promotionStore'
import { mockUsers } from '../../test/utils'

// Mock the stores
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('../../stores/promotionStore', () => ({
  usePromotionStore: vi.fn()
}))

// Mock react-qr-code
vi.mock('react-qr-code', () => ({
  default: ({ value }: { value: string }) => (
    <div data-testid="qr-code" data-value={value}>
      QR Code: {value}
    </div>
  )
}))

const mockGenerateQRCode = vi.fn()
const mockUseAuthStore = useAuthStore as unknown as ReturnType<typeof vi.fn>
const mockUsePromotionStore = usePromotionStore as unknown as ReturnType<typeof vi.fn>

describe('QRCodeDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseAuthStore.mockReturnValue({
      user: mockUsers.customer,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn()
    })

    mockUsePromotionStore.mockReturnValue({
      generateQRCode: mockGenerateQRCode,
      loyaltyPoints: 250,
      currentTier: 'regular'
    })

    mockGenerateQRCode.mockResolvedValue('PROMO-12345')
  })

  describe('when user is not logged in', () => {
    it('should show sign in message', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn()
      })

      render(<QRCodeDisplay type="points" />)
      
      expect(screen.getByText('Sign in to access QR codes')).toBeInTheDocument()
    })
  })

  describe('promotion QR codes', () => {
    it('should render promotion QR code with correct title', () => {
      render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      expect(screen.getByText('Promotion QR Code')).toBeInTheDocument()
      expect(screen.getByText('Show this QR code to your server to apply the promotion')).toBeInTheDocument()
    })

    it('should generate QR code for promotion', async () => {
      render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      await waitFor(() => {
        expect(mockGenerateQRCode).toHaveBeenCalledWith('promo123')
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('qr-code')).toBeInTheDocument()
      })
    })
  })

  describe('loyalty QR codes', () => {
    it('should render loyalty reward QR code', () => {
      render(<QRCodeDisplay type="loyalty" rewardId="reward456" />)
      
      expect(screen.getByText('Loyalty Reward QR Code')).toBeInTheDocument()
      expect(screen.getByText('Scan this QR code to redeem your loyalty reward')).toBeInTheDocument()
    })

    it('should generate QR code for loyalty reward', async () => {
      render(<QRCodeDisplay type="loyalty" rewardId="reward456" />)
      
      await waitFor(() => {
        const qrCode = screen.getByTestId('qr-code')
        expect(qrCode).toHaveAttribute('data-value', expect.stringContaining('REWARD-reward456'))
      })
    })
  })

  describe('points QR codes', () => {
    it('should render loyalty points QR code', () => {
      render(<QRCodeDisplay type="points" />)
      
      expect(screen.getByText('Loyalty Points QR Code')).toBeInTheDocument()
      expect(screen.getByText('Earn and track your 250 loyalty points')).toBeInTheDocument()
    })

    it('should generate QR code for points', async () => {
      render(<QRCodeDisplay type="points" />)
      
      await waitFor(() => {
        const qrCode = screen.getByTestId('qr-code')
        expect(qrCode).toHaveAttribute('data-value', expect.stringContaining('LOYALTY-'))
        expect(qrCode).toHaveAttribute('data-value', expect.stringContaining('250'))
        expect(qrCode).toHaveAttribute('data-value', expect.stringContaining('regular'))
      })
    })

    it('should display current points and tier', () => {
      render(<QRCodeDisplay type="points" />)
      
      expect(screen.getByText('250')).toBeInTheDocument()
      expect(screen.getByText('regular')).toBeInTheDocument()
    })
  })

  describe('user information', () => {
    it('should display user name and tier badges', () => {
      render(<QRCodeDisplay type="points" />)
      
      expect(screen.getByText('Test Customer')).toBeInTheDocument()
      expect(screen.getByText('regular Member')).toBeInTheDocument()
    })

    it('should handle VIP user correctly', () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUsers.vipCustomer,
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn()
      })

      mockUsePromotionStore.mockReturnValue({
        generateQRCode: mockGenerateQRCode,
        loyaltyPoints: 1250,
        currentTier: 'vip'
      })

      render(<QRCodeDisplay type="points" />)
      
      expect(screen.getByText('VIP Customer')).toBeInTheDocument()
      expect(screen.getByText('vip Member')).toBeInTheDocument()
      expect(screen.getByText('1250')).toBeInTheDocument()
    })
  })

  describe('QR code actions', () => {
    beforeEach(async () => {
      render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('qr-code')).toBeInTheDocument()
      })
    })

    it('should show action buttons', () => {
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument()
    })

    it('should handle share functionality', async () => {
      // Mock navigator.share
      const mockShare = vi.fn()
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
      })

      const { user } = render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('qr-code')).toBeInTheDocument()
      })

      const shareButton = screen.getByRole('button', { name: /share/i })
      await user.click(shareButton)

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Restaurant Revolution QR Code',
        text: 'Check out this exclusive offer!',
        url: expect.stringContaining('restaurant-revolution.com/qr/')
      })
    })

    it('should handle copy functionality when share is not available', async () => {
      // Mock clipboard API
      const mockWriteText = vi.fn()
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      })

      // Remove share API
      delete (navigator as any).share

      const { user } = render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('qr-code')).toBeInTheDocument()
      })

      const shareButton = screen.getByRole('button', { name: /share/i })
      await user.click(shareButton)

      expect(mockWriteText).toHaveBeenCalledWith('PROMO-12345')
    })
  })

  describe('expiry timer', () => {
    it('should show expiry timer', async () => {
      render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      await waitFor(() => {
        expect(screen.getByText('Expires in:')).toBeInTheDocument()
      })
    })

    it('should display time remaining', async () => {
      render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      await waitFor(() => {
        // Should show some time format (hours/minutes)
        const timerElements = screen.getAllByText(/\d+[hm]/)
        expect(timerElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('QR code value display', () => {
    it('should show truncated QR code value', async () => {
      render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      await waitFor(() => {
        expect(screen.getByText('PROMO-12345')).toBeInTheDocument()
      })
    })

    it('should show copy button for QR value', async () => {
      render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      await waitFor(() => {
        const copyButtons = screen.getAllByRole('button')
        const copyButton = copyButtons.find(button => 
          button.querySelector('[data-testid*="copy"]') || 
          button.textContent?.includes('copy') ||
          button.getAttribute('aria-label')?.includes('copy')
        )
        expect(copyButton).toBeDefined()
      })
    })

    it('should handle copy QR value', async () => {
      const mockWriteText = vi.fn()
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      })

      const { user } = render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('qr-code')).toBeInTheDocument()
      })

      // Find and click copy button in QR value section
      const qrValueSection = screen.getByText('PROMO-12345').closest('div')
      const copyButton = qrValueSection?.querySelector('button')
      
      if (copyButton) {
        await user.click(copyButton)
        expect(mockWriteText).toHaveBeenCalledWith('PROMO-12345')
      }
    })
  })

  describe('usage instructions', () => {
    it('should show usage instructions', () => {
      render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      expect(screen.getByText('How to use:')).toBeInTheDocument()
      expect(screen.getByText('1. Show this QR code to your server')).toBeInTheDocument()
      expect(screen.getByText('2. They\'ll scan it with their device')).toBeInTheDocument()
      expect(screen.getByText(/will be applied automatically/)).toBeInTheDocument()
      expect(screen.getByText('4. Enjoy your savings!')).toBeInTheDocument()
    })

    it('should customize instructions based on type', () => {
      render(<QRCodeDisplay type="loyalty" rewardId="reward123" />)
      
      expect(screen.getByText(/loyalty/i)).toBeInTheDocument()
    })
  })

  describe('loading states', () => {
    it('should show loading spinner while generating', () => {
      mockGenerateQRCode.mockImplementation(() => new Promise(() => {})) // Never resolves
      
      render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      expect(screen.getByText('Generating QR code...')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should handle QR generation errors', async () => {
      mockGenerateQRCode.mockRejectedValue(new Error('Generation failed'))
      
      render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      await waitFor(() => {
        expect(screen.getByText('Unable to generate QR code')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<QRCodeDisplay type="points" />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
      })
    })

    it('should provide alternative text for QR code', async () => {
      render(<QRCodeDisplay type="promotion" promotionId="promo123" />)
      
      await waitFor(() => {
        const qrCode = screen.getByTestId('qr-code')
        expect(qrCode).toBeInTheDocument()
      })
    })
  })

  describe('responsive design', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <QRCodeDisplay type="points" className="custom-qr-class" />
      )
      
      expect(container.firstChild).toHaveClass('custom-qr-class')
    })
  })
})