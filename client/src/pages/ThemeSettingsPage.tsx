import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import ThemeSelector from '@/components/theme/ThemeSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Eye } from 'lucide-react';
import { Link } from 'wouter';

const ThemeSettingsPage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      setLocation('/login');
    }
  }, [user, setLocation]);

  if (!user || user.role !== 'owner') {
    return null;
  }

  return (
    <main className="flex-grow">
      <div className="section-padding bg-background-alt">
        <div className="section-container max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Link href="/info">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Settings className="h-6 w-6 text-primary" />
                  <h1 className="text-3xl font-bold text-text-primary">Theme Settings</h1>
                </div>
              </div>
              <p className="text-text-muted max-w-2xl">
                Customize your restaurant's storefront appearance. Choose from our professionally designed templates
                to create the perfect atmosphere for your brand.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview Storefront
              </Button>
            </Link>
          </div>

          {/* Theme Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Choose Your Design
              </CardTitle>
              <CardDescription>
                Select the template that best represents your restaurant's style and atmosphere.
                Changes are applied instantly and saved automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customization Tips</CardTitle>
                <CardDescription>
                  Get the most out of your chosen theme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-text-primary">Classic Elegance</h4>
                  <p className="text-sm text-text-muted">
                    Perfect for fine dining establishments. Features warm burgundy and gold colors with traditional typography.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-text-primary">Modern Minimalist</h4>
                  <p className="text-sm text-text-muted">
                    Great for contemporary cafes and bistros. Clean lines with blue and orange accents.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-text-primary">Rustic Charm</h4>
                  <p className="text-sm text-text-muted">
                    Ideal for farm-to-table and organic restaurants. Earth tones with natural textures.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-text-primary">Bold & Vibrant</h4>
                  <p className="text-sm text-text-muted">
                    Perfect for trendy spots and fast-casual dining. High contrast with dynamic layouts.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Additional resources and support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Professional Setup</h4>
                  <p className="text-sm text-text-muted mb-3">
                    Need custom branding or have specific design requirements? Our team can help you create a unique look.
                  </p>
                  <Button size="sm" variant="outline">
                    Contact Support
                  </Button>
                </div>
                
                <div className="p-4 bg-secondary/5 border border-secondary/10 rounded-lg">
                  <h4 className="font-semibold text-secondary mb-2">Marketing Materials</h4>
                  <p className="text-sm text-text-muted mb-3">
                    Update your business cards, flyers, and social media to match your new theme.
                  </p>
                  <Link href="/marketing">
                    <Button size="sm" variant="outline">
                      View Materials
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ThemeSettingsPage;