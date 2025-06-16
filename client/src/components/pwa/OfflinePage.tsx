import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Home, Phone, MapPin } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const OfflinePage: React.FC = () => {
  const { isOnline } = usePWA();
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Wait a bit for potential reconnection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setIsRetrying(false);
    }
  };

  const goHome = () => {
    window.location.href = '/';
  };

  if (isOnline) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="h-8 w-8 text-gray-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">You're Offline</CardTitle>
            <CardDescription className="text-gray-600">
              Check your internet connection and try again
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Offline capabilities */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">What you can still do:</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Browse previously viewed menus</li>
                <li>• Review your recent orders</li>
                <li>• Access saved restaurants</li>
                <li>• View your loyalty points</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full"
              >
                {isRetrying ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isRetrying ? 'Checking...' : 'Try Again'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={goHome}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
            </div>

            {/* Contact info for offline scenarios */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Need immediate assistance?</p>
              <div className="flex flex-col gap-2">
                <a 
                  href="tel:+1-555-FOOD-123"
                  className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Phone className="h-4 w-4" />
                  Call us: (555) FOOD-123
                </a>
                <a 
                  href="https://maps.google.com/?q=restaurant+near+me"
                  className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="h-4 w-4" />
                  Find locations nearby
                </a>
              </div>
            </div>

            {/* Connection status */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>No internet connection</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfflinePage;