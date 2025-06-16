import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { RefreshCw, X } from 'lucide-react';

export const PWAUpdateNotification: React.FC = () => {
  const { updateInfo } = usePWA();
  const [showUpdate, setShowUpdate] = React.useState(false);

  React.useEffect(() => {
    if (updateInfo.isUpdateAvailable) {
      setShowUpdate(true);
    }
  }, [updateInfo.isUpdateAvailable]);

  if (!showUpdate || !updateInfo.isUpdateAvailable) return null;

  const handleUpdate = () => {
    updateInfo.updateSW();
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-blue-900">Update Available</CardTitle>
                <CardDescription className="text-sm text-blue-700">
                  A new version is ready to install
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-blue-800">
            We've made improvements to Restaurant Revolution. Update now to get the latest features and bug fixes.
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Now
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Later
            </Button>
          </div>

          <p className="text-xs text-center text-blue-600">
            Update takes just a few seconds
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAUpdateNotification;