import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { 
  Download, 
  X, 
  Smartphone, 
  Zap, 
  Wifi, 
  Bell,
  Home,
  Star
} from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const { showInstallPrompt, installApp, dismissInstallPrompt, isOnline } = usePWA();

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Install Restaurant Revolution</CardTitle>
                <CardDescription className="text-sm">
                  Get the full app experience
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissInstallPrompt}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span>Faster Loading</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="h-4 w-4 text-primary" />
              <span>Works Offline</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4 text-primary" />
              <span>Push Notifications</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Home className="h-4 w-4 text-primary" />
              <span>Home Screen Access</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white/60 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-sm">Why install?</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Instant access from your home screen</li>
              <li>• Order even when you're offline</li>
              <li>• Get notified about exclusive deals</li>
              <li>• Native app-like experience</li>
            </ul>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-600">
              {isOnline ? 'Connected' : 'Offline mode available'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={installApp}
              className="flex-1"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
            <Button 
              variant="outline" 
              onClick={dismissInstallPrompt}
              size="sm"
            >
              Maybe Later
            </Button>
          </div>

          {/* Platform-specific instructions */}
          <div className="text-xs text-center text-gray-600">
            <p>Free • No app store required • Instant install</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;