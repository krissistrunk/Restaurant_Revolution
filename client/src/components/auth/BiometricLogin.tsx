import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { Fingerprint, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface BiometricLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const BiometricLogin: React.FC<BiometricLoginProps> = ({
  onSuccess,
  onError
}) => {
  const { biometricEnabled, setBiometric, login } = useAuthStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const mockBiometricAuth = async () => {
    setIsAuthenticating(true);
    setAuthStatus('idle');

    try {
      // Mock biometric authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success (80% success rate)
      const success = Math.random() > 0.2;
      
      if (success) {
        setAuthStatus('success');
        
        // Mock user data for biometric login
        const mockUser = {
          id: 1,
          username: 'biometric_user',
          name: 'Biometric User',
          email: 'user@example.com',
          role: 'customer' as const,
          tier: 'vip' as const,
          loyaltyPoints: 1250,
          preferences: {
            cuisine: ['Italian', 'American'],
            spiceLevel: 2,
            priceRange: [15, 60] as [number, number],
            favoriteItems: [1, 3, 4],
            allergens: ['Nuts']
          }
        };
        
        login(mockUser);
        onSuccess?.();
      } else {
        setAuthStatus('error');
        onError?.('Biometric authentication failed. Please try again.');
      }
    } catch (error) {
      setAuthStatus('error');
      onError?.('Biometric authentication error.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const enableBiometric = async () => {
    // Mock enabling biometric authentication
    setIsAuthenticating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setBiometric(true);
    setIsAuthenticating(false);
  };

  if (!biometricEnabled) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Fingerprint className="h-6 w-6" />
            Enable Biometric Login
          </CardTitle>
          <CardDescription>
            Secure and convenient authentication with your fingerprint or face
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={enableBiometric}
            disabled={isAuthenticating}
            className="w-full"
          >
            {isAuthenticating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Fingerprint className="h-4 w-4 mr-2" />
            )}
            Enable Biometric Authentication
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Fingerprint className="h-6 w-6" />
          Biometric Login
        </CardTitle>
        <CardDescription>
          Touch the sensor or look at the camera to authenticate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
            ${isAuthenticating ? 'bg-blue-100 animate-pulse' : 
              authStatus === 'success' ? 'bg-green-100' : 
              authStatus === 'error' ? 'bg-red-100' : 'bg-gray-100'}
          `}>
            {isAuthenticating ? (
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            ) : authStatus === 'success' ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : authStatus === 'error' ? (
              <AlertCircle className="h-8 w-8 text-red-600" />
            ) : (
              <Fingerprint className="h-8 w-8 text-gray-600" />
            )}
          </div>
          
          <div className="text-center">
            {isAuthenticating && (
              <p className="text-sm text-blue-600 font-medium">Authenticating...</p>
            )}
            {authStatus === 'success' && (
              <p className="text-sm text-green-600 font-medium">Authentication successful!</p>
            )}
            {authStatus === 'error' && (
              <p className="text-sm text-red-600 font-medium">Authentication failed</p>
            )}
            {authStatus === 'idle' && !isAuthenticating && (
              <p className="text-sm text-gray-600">Ready for authentication</p>
            )}
          </div>
        </div>

        <Button
          onClick={mockBiometricAuth}
          disabled={isAuthenticating}
          className="w-full"
          variant={authStatus === 'error' ? 'destructive' : 'default'}
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Authenticating...
            </>
          ) : authStatus === 'error' ? (
            'Try Again'
          ) : (
            <>
              <Fingerprint className="h-4 w-4 mr-2" />
              Authenticate
            </>
          )}
        </Button>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBiometric(false)}
            className="text-gray-500"
          >
            Disable Biometric Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiometricLogin;