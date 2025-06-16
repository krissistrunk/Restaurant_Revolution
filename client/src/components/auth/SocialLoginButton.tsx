import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

interface SocialLoginButtonProps {
  provider: 'google' | 'facebook' | 'apple';
  className?: string;
}

const providerConfig = {
  google: {
    icon: '🔍',
    label: 'Continue with Google',
    bgColor: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
    mockData: {
      name: 'John Doe',
      email: 'john.doe@gmail.com'
    }
  },
  facebook: {
    icon: '📘',
    label: 'Continue with Facebook',
    bgColor: 'bg-blue-600 text-white hover:bg-blue-700',
    mockData: {
      name: 'Jane Smith',
      email: 'jane.smith@facebook.com'
    }
  },
  apple: {
    icon: '🍎',
    label: 'Continue with Apple',
    bgColor: 'bg-black text-white hover:bg-gray-800',
    mockData: {
      name: 'Apple User',
      email: 'user@icloud.com'
    }
  }
};

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  className = ''
}) => {
  const { mockSocialLogin, isLoading } = useAuthStore();
  const config = providerConfig[provider];

  const handleSocialLogin = async () => {
    try {
      await mockSocialLogin(provider, config.mockData);
    } catch (error) {
      console.error(`${provider} login failed:`, error);
    }
  };

  return (
    <Button
      onClick={handleSocialLogin}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 py-3 ${config.bgColor} ${className}`}
      variant="outline"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <span className="text-lg">{config.icon}</span>
          <span className="font-medium">{config.label}</span>
        </>
      )}
    </Button>
  );
};

export default SocialLoginButton;