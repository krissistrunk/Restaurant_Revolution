import React from 'react';
import { useTheme, Theme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Palette } from 'lucide-react';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const getThemePreview = (theme: Theme) => {
    return (
      <div className="w-full h-24 rounded-lg overflow-hidden relative border">
        <div 
          className="w-full h-8 flex items-center px-2"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <div className="w-2 h-2 rounded-full bg-white/60 mr-1"></div>
          <div className="w-16 h-1 bg-white/60 rounded"></div>
        </div>
        <div 
          className="w-full h-16 p-2"
          style={{ backgroundColor: theme.backgroundColor }}
        >
          <div 
            className="w-full h-2 rounded mb-1"
            style={{ backgroundColor: theme.primaryColor, opacity: 0.3 }}
          ></div>
          <div 
            className="w-3/4 h-2 rounded mb-1"
            style={{ backgroundColor: theme.secondaryColor, opacity: 0.4 }}
          ></div>
          <div className="flex gap-1">
            <div 
              className="w-8 h-4 rounded text-[6px] flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: theme.primaryColor }}
            >
              BTN
            </div>
            <div 
              className="w-8 h-4 rounded text-[6px] flex items-center justify-center border"
              style={{ 
                borderColor: theme.secondaryColor, 
                color: theme.secondaryColor,
                backgroundColor: theme.backgroundColor 
              }}
            >
              BTN
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Palette className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-text-primary">Choose Your Storefront Style</h2>
        </div>
        <p className="text-text-muted max-w-2xl mx-auto">
          Select from 4 professionally designed templates to match your restaurant's personality. 
          You can change this anytime from your owner dashboard.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {availableThemes.map((theme) => (
          <Card 
            key={theme.id} 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              currentTheme.id === theme.id 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:ring-1 hover:ring-primary/50'
            }`}
            onClick={() => setTheme(theme.id)}
          >
            <CardHeader className="pb-3">
              <div className="relative">
                {getThemePreview(theme)}
                {currentTheme.id === theme.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardTitle className="text-lg mb-2" style={{ fontFamily: theme.fontFamily }}>
                {theme.name}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {theme.description}
              </CardDescription>
              
              <div className="mt-4 space-y-2">
                <div className="text-xs text-text-muted">Color Palette:</div>
                <div className="flex gap-2">
                  <div 
                    className="w-4 h-4 rounded border border-gray-200"
                    style={{ backgroundColor: theme.primaryColor }}
                    title="Primary Color"
                  ></div>
                  <div 
                    className="w-4 h-4 rounded border border-gray-200"
                    style={{ backgroundColor: theme.secondaryColor }}
                    title="Secondary Color"
                  ></div>
                  <div 
                    className="w-4 h-4 rounded border border-gray-200"
                    style={{ backgroundColor: theme.backgroundColor }}
                    title="Background Color"
                  ></div>
                </div>
              </div>

              <Button
                variant={currentTheme.id === theme.id ? "default" : "outline"}
                size="sm"
                className="w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme(theme.id);
                }}
              >
                {currentTheme.id === theme.id ? 'Active' : 'Select Theme'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-text-muted">
          Currently using: <span className="font-semibold text-text-primary">{currentTheme.name}</span>
        </p>
      </div>
    </div>
  );
};

export default ThemeSelector;