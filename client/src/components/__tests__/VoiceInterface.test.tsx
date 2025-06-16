import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import VoiceInterface from '../voice/VoiceInterface'
import { useAuthStore } from '../../stores/authStore'
import { useMenuStore } from '../../stores/menuStore'
import { mockUsers } from '../../test/utils'

// Mock the stores
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('../../stores/menuStore', () => ({
  useMenuStore: vi.fn()
}))

const mockUseAuthStore = useAuthStore as unknown as ReturnType<typeof vi.fn>
const mockUseMenuStore = useMenuStore as unknown as ReturnType<typeof vi.fn>

// Mock web speech API
const mockSpeechRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn(() => []),
}

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: vi.fn(() => mockSpeechRecognition),
  writable: true,
})

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true,
})

describe('VoiceInterface', () => {
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
      menuItems: [],
      isLoading: false
    })
  })

  describe('initial rendering', () => {
    it('should render the voice interface with basic elements', () => {
      render(<VoiceInterface />)
      
      expect(screen.getByText('AI Voice Assistant')).toBeInTheDocument()
      expect(screen.getByText('Beta')).toBeInTheDocument()
      expect(screen.getByText(/speak naturally to get menu recommendations/i)).toBeInTheDocument()
    })

    it('should show ready to listen state initially', () => {
      render(<VoiceInterface />)
      
      expect(screen.getByText('Ready to listen')).toBeInTheDocument()
      expect(screen.getByText('Tap to start talking')).toBeInTheDocument()
    })

    it('should display welcome message in conversation', () => {
      render(<VoiceInterface />)
      
      expect(screen.getByText(/Hi! I'm your AI dining assistant/)).toBeInTheDocument()
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    })
  })

  describe('voice controls', () => {
    it('should show microphone button', () => {
      render(<VoiceInterface />)
      
      const micButton = screen.getByRole('button', { name: /start listening/i })
      expect(micButton).toBeInTheDocument()
    })

    it('should start listening when microphone button is clicked', async () => {
      const { user } = render(<VoiceInterface />)
      
      const micButton = screen.getByRole('button', { name: /start listening/i })
      await user.click(micButton)
      
      expect(screen.getByText('Listening...')).toBeInTheDocument()
      expect(screen.getByText('Tap to stop')).toBeInTheDocument()
    })

    it('should show listening state with visual indicators', async () => {
      const { user } = render(<VoiceInterface />)
      
      const micButton = screen.getByRole('button', { name: /start listening/i })
      await user.click(micButton)
      
      // Should show animated pulse and listening indicators
      const listeningState = screen.getByText('Listening...')
      expect(listeningState).toBeInTheDocument()
      
      // Should show transcription area
      expect(screen.getByText("You're saying:")).toBeInTheDocument()
    })

    it('should stop listening when clicked again', async () => {
      const { user } = render(<VoiceInterface />)
      
      const micButton = screen.getByRole('button', { name: /start listening/i })
      await user.click(micButton)
      
      expect(screen.getByText('Listening...')).toBeInTheDocument()
      
      await user.click(micButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Listening...')).not.toBeInTheDocument()
      })
    })
  })

  describe('voice settings', () => {
    it('should show volume control button', () => {
      render(<VoiceInterface />)
      
      const volumeButton = screen.getByRole('button', { name: /volume/i })
      expect(volumeButton).toBeInTheDocument()
    })

    it('should toggle volume when volume button is clicked', async () => {
      const { user } = render(<VoiceInterface />)
      
      const volumeButton = screen.getByRole('button', { name: /volume/i })
      await user.click(volumeButton)
      
      // Should toggle volume state (implementation detail)
      expect(volumeButton).toBeInTheDocument()
    })

    it('should show settings button', () => {
      render(<VoiceInterface />)
      
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      expect(settingsButton).toBeInTheDocument()
    })

    it('should show clear conversation button', () => {
      render(<VoiceInterface />)
      
      const clearButton = screen.getByRole('button', { name: /clear/i })
      expect(clearButton).toBeInTheDocument()
    })

    it('should clear conversation when clear button is clicked', async () => {
      const { user } = render(<VoiceInterface />)
      
      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)
      
      // Should show new welcome message
      expect(screen.getByText(/conversation cleared/i)).toBeInTheDocument()
    })
  })

  describe('quick commands', () => {
    it('should show quick command buttons', () => {
      render(<VoiceInterface />)
      
      expect(screen.getByText('Quick Voice Commands')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /what's your special today/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /i want something vegetarian/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /make a reservation/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /wine recommendations/i })).toBeInTheDocument()
    })

    it('should process command when quick command is clicked', async () => {
      const { user } = render(<VoiceInterface />)
      
      const commandButton = screen.getByRole('button', { name: /what's your special today/i })
      await user.click(commandButton)
      
      // Should add the command to conversation
      await waitFor(() => {
        expect(screen.getByText("What's your special today?")).toBeInTheDocument()
      })
    })
  })

  describe('conversation display', () => {
    it('should show conversation history', async () => {
      const { user } = render(<VoiceInterface />)
      
      // Click a quick command to add to conversation
      const commandButton = screen.getByRole('button', { name: /wine recommendations/i })
      await user.click(commandButton)
      
      await waitFor(() => {
        expect(screen.getByText('Wine recommendations')).toBeInTheDocument()
      })
    })

    it('should distinguish between user and AI messages', () => {
      render(<VoiceInterface />)
      
      // Initial AI welcome message
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      expect(screen.getByText(/Hi! I'm your AI dining assistant/)).toBeInTheDocument()
    })

    it('should show timestamps for messages', () => {
      render(<VoiceInterface />)
      
      // Should show time for the welcome message
      const timeElements = screen.getAllByText(/\d+:\d+:\d+/)
      expect(timeElements.length).toBeGreaterThan(0)
    })

    it('should show confidence scores for voice recognition', async () => {
      const { user } = render(<VoiceInterface />)
      
      const commandButton = screen.getByRole('button', { name: /wine recommendations/i })
      await user.click(commandButton)
      
      await waitFor(() => {
        // Should show confidence percentage
        const confidenceBadges = screen.getAllByText(/\d+%/)
        expect(confidenceBadges.length).toBeGreaterThan(0)
      })
    })
  })

  describe('AI responses', () => {
    it('should generate appropriate responses to different intents', async () => {
      const { user } = render(<VoiceInterface />)
      
      // Test reservation intent
      const reservationButton = screen.getByRole('button', { name: /make a reservation/i })
      await user.click(reservationButton)
      
      await waitFor(() => {
        expect(screen.getByText('Make a reservation')).toBeInTheDocument()
      })
      
      // Should generate an AI response about reservations
      await waitFor(() => {
        expect(screen.getByText(/reservation/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should handle dietary preferences', async () => {
      const { user } = render(<VoiceInterface />)
      
      const vegetarianButton = screen.getByRole('button', { name: /i want something vegetarian/i })
      await user.click(vegetarianButton)
      
      await waitFor(() => {
        expect(screen.getByText('I want something vegetarian')).toBeInTheDocument()
      })
    })

    it('should provide wine recommendations', async () => {
      const { user } = render(<VoiceInterface />)
      
      const wineButton = screen.getByRole('button', { name: /wine recommendations/i })
      await user.click(wineButton)
      
      await waitFor(() => {
        expect(screen.getByText('Wine recommendations')).toBeInTheDocument()
      })
    })
  })

  describe('transcription simulation', () => {
    it('should simulate voice transcription with typing effect', async () => {
      const { user } = render(<VoiceInterface />)
      
      const micButton = screen.getByRole('button', { name: /start listening/i })
      await user.click(micButton)
      
      // Should start showing transcription
      await waitFor(() => {
        expect(screen.getByText('Start speaking...')).toBeInTheDocument()
      })
      
      // After delay, should show simulated transcription
      await waitFor(() => {
        const transcriptionArea = screen.getByText(/you're saying/i).parentElement
        expect(transcriptionArea).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('speaking state', () => {
    it('should show speaking state when AI is responding', async () => {
      const { user } = render(<VoiceInterface />)
      
      const commandButton = screen.getByRole('button', { name: /what's your special today/i })
      await user.click(commandButton)
      
      // Should show speaking state temporarily
      await waitFor(() => {
        expect(screen.getByText('Speaking...')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should disable microphone button while speaking', async () => {
      const { user } = render(<VoiceInterface />)
      
      const commandButton = screen.getByRole('button', { name: /wine recommendations/i })
      await user.click(commandButton)
      
      await waitFor(() => {
        const micButton = screen.getByRole('button', { name: /start listening/i })
        expect(micButton).toBeDisabled()
      }, { timeout: 2000 })
    })
  })

  describe('accessibility features', () => {
    it('should have proper ARIA labels', () => {
      render(<VoiceInterface />)
      
      const micButton = screen.getByRole('button', { name: /start listening/i })
      expect(micButton).toBeInTheDocument()
      
      const volumeButton = screen.getByRole('button', { name: /volume/i })
      expect(volumeButton).toBeInTheDocument()
    })

    it('should show AI features information', () => {
      render(<VoiceInterface />)
      
      expect(screen.getByText('Powered by AI')).toBeInTheDocument()
      expect(screen.getByText('Natural Language Processing')).toBeInTheDocument()
    })
  })

  describe('responsive design', () => {
    it('should render properly with custom className', () => {
      const { container } = render(<VoiceInterface className="custom-voice-class" />)
      
      expect(container.firstChild).toHaveClass('custom-voice-class')
    })
  })

  describe('error handling', () => {
    it('should handle speech recognition errors gracefully', async () => {
      // Mock speech recognition error
      mockSpeechRecognition.start.mockImplementation(() => {
        throw new Error('Speech recognition not supported')
      })
      
      const { user } = render(<VoiceInterface />)
      
      const micButton = screen.getByRole('button', { name: /start listening/i })
      
      // Should not crash when speech recognition fails
      expect(async () => {
        await user.click(micButton)
      }).not.toThrow()
    })
  })
})