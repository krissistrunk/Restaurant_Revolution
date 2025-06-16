import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  heroStyle: 'gradient' | 'image' | 'solid' | 'pattern';
  cardStyle: 'modern' | 'classic' | 'minimal' | 'bold';
  buttonStyle: 'rounded' | 'square' | 'pill' | 'sharp';
}

export const themes: Theme[] = [
  {
    id: 'classic',
    name: 'Classic Elegance',
    description: 'Timeless design with warm colors and traditional typography',
    primaryColor: '#8B1538',
    secondaryColor: '#D4AF37',
    backgroundColor: '#FDFCF9',
    textColor: '#1A1A1A',
    fontFamily: 'Inter, system-ui, sans-serif',
    heroStyle: 'gradient',
    cardStyle: 'classic',
    buttonStyle: 'rounded'
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Clean lines, bold typography, and contemporary aesthetics',
    primaryColor: '#2563EB',
    secondaryColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    textColor: '#111827',
    fontFamily: 'Poppins, system-ui, sans-serif',
    heroStyle: 'solid',
    cardStyle: 'modern',
    buttonStyle: 'square'
  },
  {
    id: 'rustic',
    name: 'Rustic Charm',
    description: 'Warm earth tones with organic shapes and natural textures',
    primaryColor: '#92400E',
    secondaryColor: '#059669',
    backgroundColor: '#FEF7ED',
    textColor: '#451A03',
    fontFamily: 'Merriweather, serif',
    heroStyle: 'image',
    cardStyle: 'minimal',
    buttonStyle: 'pill'
  },
  {
    id: 'bold',
    name: 'Bold & Vibrant',
    description: 'High contrast colors with dynamic layouts and modern fonts',
    primaryColor: '#DC2626',
    secondaryColor: '#7C3AED',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    fontFamily: 'Roboto, system-ui, sans-serif',
    heroStyle: 'pattern',
    cardStyle: 'bold',
    buttonStyle: 'sharp'
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('restaurant-theme', themeId);
      applyTheme(theme);
    }
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-primary-light', lightenColor(theme.primaryColor, 20));
    root.style.setProperty('--color-primary-dark', darkenColor(theme.primaryColor, 20));
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-secondary-light', lightenColor(theme.secondaryColor, 20));
    root.style.setProperty('--color-secondary-dark', darkenColor(theme.secondaryColor, 20));
    root.style.setProperty('--color-background', theme.backgroundColor);
    root.style.setProperty('--color-text-primary', theme.textColor);
    
    // Apply font family
    root.style.setProperty('--font-family-primary', theme.fontFamily);
    
    // Add theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.id}`);
  };

  useEffect(() => {
    // Load saved theme on mount
    const savedThemeId = localStorage.getItem('restaurant-theme');
    if (savedThemeId) {
      const savedTheme = themes.find(t => t.id === savedThemeId);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme);
        return;
      }
    }
    
    // Apply default theme
    applyTheme(currentTheme);
  }, []);

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes: themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Helper functions to lighten and darken colors
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
    (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
    (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
}