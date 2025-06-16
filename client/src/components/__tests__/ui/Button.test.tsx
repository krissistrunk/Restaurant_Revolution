import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils'
import { Button } from '../../ui/button'

describe('Button', () => {
  describe('basic functionality', () => {
    it('should render with text', () => {
      render(<Button>Click me</Button>)
      
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('should handle click events', async () => {
      const handleClick = vi.fn()
      const { user } = render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole('button', { name: /click me/i })
      await user.click(button)
      
      expect(handleClick).toHaveBeenCalledOnce()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled button</Button>)
      
      const button = screen.getByRole('button', { name: /disabled button/i })
      expect(button).toBeDisabled()
    })
  })

  describe('variants', () => {
    it('should apply default variant styles', () => {
      render(<Button>Default</Button>)
      
      const button = screen.getByRole('button', { name: /default/i })
      expect(button).toHaveClass('bg-primary')
    })

    it('should apply secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>)
      
      const button = screen.getByRole('button', { name: /secondary/i })
      expect(button).toHaveClass('bg-secondary')
    })

    it('should apply outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>)
      
      const button = screen.getByRole('button', { name: /outline/i })
      expect(button).toHaveClass('border')
    })

    it('should apply destructive variant styles', () => {
      render(<Button variant="destructive">Destructive</Button>)
      
      const button = screen.getByRole('button', { name: /destructive/i })
      expect(button).toHaveClass('bg-destructive')
    })

    it('should apply ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>)
      
      const button = screen.getByRole('button', { name: /ghost/i })
      expect(button).toHaveClass('hover:bg-accent')
    })
  })

  describe('sizes', () => {
    it('should apply default size styles', () => {
      render(<Button>Default size</Button>)
      
      const button = screen.getByRole('button', { name: /default size/i })
      expect(button).toHaveClass('h-10')
    })

    it('should apply small size styles', () => {
      render(<Button size="sm">Small</Button>)
      
      const button = screen.getByRole('button', { name: /small/i })
      expect(button).toHaveClass('h-9')
    })

    it('should apply large size styles', () => {
      render(<Button size="lg">Large</Button>)
      
      const button = screen.getByRole('button', { name: /large/i })
      expect(button).toHaveClass('h-11')
    })

    it('should apply icon size styles', () => {
      render(<Button size="icon">🚀</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'w-10')
    })
  })

  describe('accessibility', () => {
    it('should have proper button role', () => {
      render(<Button>Accessible button</Button>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should support custom aria-label', () => {
      render(<Button aria-label="Custom label">🔍</Button>)
      
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument()
    })

    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn()
      const { user } = render(<Button onClick={handleClick}>Keyboard test</Button>)
      
      const button = screen.getByRole('button', { name: /keyboard test/i })
      button.focus()
      await user.keyboard('{Enter}')
      
      expect(handleClick).toHaveBeenCalledOnce()
    })

    it('should support space key activation', async () => {
      const handleClick = vi.fn()
      const { user } = render(<Button onClick={handleClick}>Space test</Button>)
      
      const button = screen.getByRole('button', { name: /space test/i })
      button.focus()
      await user.keyboard('{ }')
      
      expect(handleClick).toHaveBeenCalledOnce()
    })
  })

  describe('custom attributes', () => {
    it('should accept custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      
      const button = screen.getByRole('button', { name: /custom/i })
      expect(button).toHaveClass('custom-class')
    })

    it('should forward other props', () => {
      render(<Button data-testid="custom-button" type="submit">Submit</Button>)
      
      const button = screen.getByTestId('custom-button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })
})