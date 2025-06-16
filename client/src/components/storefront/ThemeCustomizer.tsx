import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { 
  Palette, 
  Eye, 
  Download, 
  Upload, 
  RotateCcw, 
  Save,
  Sparkles,
  Sun,
  Moon,
  Coffee,
  Leaf,
  Flame,
  Waves,
  Mountain,
  Heart,
  Settings,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: 'sharp' | 'rounded' | 'pill';
  spacing: 'compact' | 'normal' | 'spacious';
  preview: string;
}

const predefinedThemes: Theme[] = [
  {
    id: 'elegant',
    name: 'Elegant Dining',
    description: 'Sophisticated black and gold for upscale restaurants',
    icon: <Sparkles className="h-5 w-5" />,
    colors: {
      primary: '#D4AF37',
      secondary: '#1A1A1A',
      accent: '#F5F5F5',
      background: '#FFFFFF',
      surface: '#F8F8F8',
      text: '#1A1A1A',
      textSecondary: '#666666'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Source Sans Pro'
    },
    borderRadius: 'sharp',
    spacing: 'spacious',
    preview: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=300'
  },
  {
    id: 'warm',
    name: 'Warm & Cozy',
    description: 'Earth tones perfect for cafes and casual dining',
    icon: <Coffee className="h-5 w-5" />,
    colors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#F4A460',
      background: '#FFF8DC',
      surface: '#FFFAF0',
      text: '#2F1B14',
      textSecondary: '#8B4513'
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Open Sans'
    },
    borderRadius: 'rounded',
    spacing: 'normal',
    preview: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300'
  },
  {
    id: 'fresh',
    name: 'Fresh Garden',
    description: 'Natural greens ideal for organic and healthy restaurants',
    icon: <Leaf className="h-5 w-5" />,
    colors: {
      primary: '#228B22',
      secondary: '#32CD32',
      accent: '#90EE90',
      background: '#F0FFF0',
      surface: '#FFFFFF',
      text: '#2F4F2F',
      textSecondary: '#556B2F'
    },
    fonts: {
      heading: 'Lato',
      body: 'Inter'
    },
    borderRadius: 'rounded',
    spacing: 'normal',
    preview: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300'
  },
  {
    id: 'vibrant',
    name: 'Vibrant Energy',
    description: 'Bold colors for modern and energetic dining experiences',
    icon: <Flame className="h-5 w-5" />,
    colors: {
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#FFE66D',
      background: '#FFFFFF',
      surface: '#FFF9F5',
      text: '#2C2C2C',
      textSecondary: '#666666'
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Roboto'
    },
    borderRadius: 'pill',
    spacing: 'compact',
    preview: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300'
  }
];

interface ThemeCustomizerProps {
  className?: string;
  onThemeChange?: (theme: Theme) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ 
  className = '', 
  onThemeChange 
}) => {
  const { user } = useAuthStore();
  const [selectedTheme, setSelectedTheme] = useState<Theme>(predefinedThemes[0]);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('restaurant-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        setSelectedTheme(theme);
        onThemeChange?.(theme);
      } catch (error) {
        console.error('Failed to load saved theme:', error);
      }
    }
  }, [onThemeChange]);

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    onThemeChange?.(theme);
    
    // Save to localStorage
    localStorage.setItem('restaurant-theme', JSON.stringify(theme));
  };

  const handleCustomizeTheme = () => {
    setCustomTheme({ ...selectedTheme });
    setIsCustomizing(true);
  };

  const handleColorChange = (colorKey: keyof Theme['colors'], value: string) => {
    if (!customTheme) return;
    
    setCustomTheme({
      ...customTheme,
      colors: {
        ...customTheme.colors,
        [colorKey]: value
      }
    });
  };

  const handleSaveCustomTheme = () => {
    if (!customTheme) return;
    
    const savedTheme = {
      ...customTheme,
      id: 'custom',
      name: 'Custom Theme',
      description: 'Your personalized theme'
    };
    
    handleThemeSelect(savedTheme);
    setIsCustomizing(false);
    setCustomTheme(null);
  };

  const handleResetTheme = () => {
    setCustomTheme(null);
    setIsCustomizing(false);
    handleThemeSelect(predefinedThemes[0]);
  };

  const exportTheme = () => {
    const themeData = JSON.stringify(selectedTheme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target?.result as string);
        handleThemeSelect(theme);
      } catch (error) {
        console.error('Failed to import theme:', error);
        alert('Invalid theme file');
      }
    };
    reader.readAsText(file);
  };

  const getDevicePreviewClass = () => {
    switch (previewDevice) {
      case 'mobile': return 'max-w-sm mx-auto';
      case 'tablet': return 'max-w-2xl mx-auto';
      default: return 'w-full';
    }
  };

  const currentTheme = customTheme || selectedTheme;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Theme Customizer
            <Badge variant="secondary">Pro Feature</Badge>
          </CardTitle>
          <CardDescription>
            Customize your restaurant's brand colors, fonts, and overall aesthetic
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isPreviewMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewMode ? 'Exit Preview' : 'Preview Mode'}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleCustomizeTheme}>
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
            
            <Button variant="outline" size="sm" onClick={exportTheme}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={importTheme}
              />
            </label>
            
            <Button variant="outline" size="sm" onClick={handleResetTheme}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Predefined Themes</CardTitle>
              <CardDescription>Choose from our curated theme collection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {predefinedThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTheme.id === theme.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleThemeSelect(theme)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      {theme.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{theme.name}</h4>
                      <p className="text-xs text-gray-600">{theme.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mt-2">
                    {Object.values(theme.colors).slice(0, 5).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Customization Panel */}
          {isCustomizing && customTheme && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Colors</CardTitle>
                <CardDescription>Adjust colors to match your brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(customTheme.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="text-sm font-medium capitalize flex-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof Theme['colors'], e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                ))}
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveCustomTheme} size="sm" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCustomizing(false);
                      setCustomTheme(null);
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Live Preview</CardTitle>
                  <CardDescription>See how your theme looks in action</CardDescription>
                </div>
                
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  {[
                    { id: 'desktop', icon: Monitor },
                    { id: 'tablet', icon: Tablet },
                    { id: 'mobile', icon: Smartphone }
                  ].map(({ id, icon: Icon }) => (
                    <Button
                      key={id}
                      variant={previewDevice === id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewDevice(id as any)}
                      className="w-8 h-8 p-0"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className={`border rounded-lg overflow-hidden ${getDevicePreviewClass()}`}>
                {/* Preview Content */}
                <div 
                  className="p-6 space-y-4"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  {/* Header */}
                  <div 
                    className="p-4 rounded-lg"
                    style={{ 
                      backgroundColor: currentTheme.colors.primary,
                      color: currentTheme.colors.background
                    }}
                  >
                    <h1 
                      className="text-2xl font-bold"
                      style={{ fontFamily: currentTheme.fonts.heading }}
                    >
                      Restaurant Revolution
                    </h1>
                    <p 
                      className="opacity-90"
                      style={{ fontFamily: currentTheme.fonts.body }}
                    >
                      Experience fine dining redefined
                    </p>
                  </div>

                  {/* Menu Card */}
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: currentTheme.colors.surface,
                      borderColor: currentTheme.colors.primary + '20'
                    }}
                  >
                    <h3 
                      className="font-semibold mb-2"
                      style={{ 
                        color: currentTheme.colors.text,
                        fontFamily: currentTheme.fonts.heading
                      }}
                    >
                      Today's Special
                    </h3>
                    <p 
                      className="text-sm mb-3"
                      style={{ 
                        color: currentTheme.colors.textSecondary,
                        fontFamily: currentTheme.fonts.body
                      }}
                    >
                      Pan-seared salmon with roasted vegetables and lemon herb butter
                    </p>
                    <div className="flex items-center justify-between">
                      <span 
                        className="font-bold text-lg"
                        style={{ color: currentTheme.colors.primary }}
                      >
                        $28.99
                      </span>
                      <button 
                        className="px-4 py-2 rounded text-white font-medium"
                        style={{ 
                          backgroundColor: currentTheme.colors.secondary,
                          borderRadius: currentTheme.borderRadius === 'pill' ? '9999px' : 
                                       currentTheme.borderRadius === 'rounded' ? '8px' : '4px'
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Accent Elements */}
                  <div className="flex gap-2">
                    {['New', 'Popular', 'Chef\'s Pick'].map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs rounded"
                        style={{
                          backgroundColor: currentTheme.colors.accent,
                          color: currentTheme.colors.text,
                          borderRadius: currentTheme.borderRadius === 'pill' ? '9999px' : 
                                       currentTheme.borderRadius === 'rounded' ? '6px' : '3px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div 
                    className="text-center p-3 rounded"
                    style={{ 
                      backgroundColor: currentTheme.colors.primary + '10',
                      color: currentTheme.colors.textSecondary
                    }}
                  >
                    <p className="text-sm">
                      ⭐ 4.8/5 rating from 200+ customers
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Theme Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Theme Details</CardTitle>
          <CardDescription>Typography, spacing, and style specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Typography</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Heading:</span>
                  <span className="ml-2 font-medium">{currentTheme.fonts.heading}</span>
                </div>
                <div>
                  <span className="text-gray-600">Body:</span>
                  <span className="ml-2 font-medium">{currentTheme.fonts.body}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Design System</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Border Radius:</span>
                  <span className="ml-2 font-medium capitalize">{currentTheme.borderRadius}</span>
                </div>
                <div>
                  <span className="text-gray-600">Spacing:</span>
                  <span className="ml-2 font-medium capitalize">{currentTheme.spacing}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Color Palette</h4>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(currentTheme.colors).map(([name, color]) => (
                  <div key={name} className="text-center">
                    <div 
                      className="w-full h-8 rounded border border-gray-200 mb-1"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-gray-600 capitalize">
                      {name.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeCustomizer;