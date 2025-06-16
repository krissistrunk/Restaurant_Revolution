import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { usePromotionStore } from '@/stores/promotionStore';
import { 
  QrCode, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Sparkles,
  Timer,
  Gift,
  Star,
  Smartphone
} from 'lucide-react';

interface QRCodeDisplayProps {
  promotionId?: string;
  rewardId?: string;
  type: 'promotion' | 'loyalty' | 'points';
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  promotionId,
  rewardId,
  type,
  className = ''
}) => {
  const { user } = useAuthStore();
  const { generateQRCode, loyaltyPoints, currentTier } = usePromotionStore();
  const [qrValue, setQrValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);

  useEffect(() => {
    generateQRValue();
  }, [promotionId, rewardId, type, user]);

  const generateQRValue = async () => {
    if (!user) return;

    setIsGenerating(true);
    
    try {
      let value = '';
      
      if (type === 'promotion' && promotionId) {
        value = await generateQRCode(promotionId);
      } else if (type === 'loyalty' && rewardId) {
        value = `REWARD-${rewardId}-${user.id}-${Date.now()}`;
      } else if (type === 'points') {
        // Generate loyalty points QR code
        value = `LOYALTY-${user.id}-${loyaltyPoints}-${currentTier}-${Date.now()}`;
      }
      
      setQrValue(value);
      
      // Set expiry time (24 hours from now for demo)
      setExpiryTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
      
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (qrValue) {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share && qrValue) {
      try {
        await navigator.share({
          title: 'Restaurant Revolution QR Code',
          text: `Check out this exclusive offer!`,
          url: `https://restaurant-revolution.com/qr/${qrValue}`
        });
      } catch (error) {
        console.error('Share failed:', error);
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qr-code-${type}-${Date.now()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    }
  };

  const getQRTitle = () => {
    switch (type) {
      case 'promotion':
        return 'Promotion QR Code';
      case 'loyalty':
        return 'Loyalty Reward QR Code';
      case 'points':
        return 'Loyalty Points QR Code';
      default:
        return 'QR Code';
    }
  };

  const getQRDescription = () => {
    switch (type) {
      case 'promotion':
        return 'Show this QR code to your server to apply the promotion';
      case 'loyalty':
        return 'Scan this QR code to redeem your loyalty reward';
      case 'points':
        return `Earn and track your ${loyaltyPoints} loyalty points`;
      default:
        return 'Scan this QR code for exclusive access';
    }
  };

  const getQRIcon = () => {
    switch (type) {
      case 'promotion':
        return <Sparkles className="h-5 w-5 text-primary" />;
      case 'loyalty':
        return <Gift className="h-5 w-5 text-secondary" />;
      case 'points':
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return <QrCode className="h-5 w-5" />;
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Sign in to access QR codes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} bg-gradient-to-br from-white to-gray-50`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {getQRIcon()}
          {getQRTitle()}
        </CardTitle>
        <CardDescription>{getQRDescription()}</CardDescription>
        
        {/* User Info Badge */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {user.name}
          </Badge>
          <Badge variant="outline" className="bg-secondary/10 text-secondary capitalize">
            {currentTier} Member
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center p-6 bg-white rounded-xl border-2 border-dashed border-gray-200">
          {isGenerating ? (
            <div className="w-48 h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : qrValue ? (
            <div className="relative">
              <QRCode
                id="qr-code-svg"
                value={qrValue}
                size={192}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 256 256"
              />
              
              {/* QR Code Center Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-2 rounded-lg shadow-md">
                  <div className="w-6 h-6 gradient-primary rounded flex items-center justify-center">
                    <Smartphone className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <QrCode className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Unable to generate QR code</p>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Value Display */}
        {qrValue && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-600 break-all">
                {qrValue.length > 20 ? `${qrValue.substring(0, 20)}...` : qrValue}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="ml-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Expiry Timer */}
        {expiryTime && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <Timer className="h-4 w-4" />
              <span className="text-sm font-medium">
                Expires in: <ExpiryTimer expiryTime={expiryTime} />
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1"
            disabled={!qrValue}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button
            onClick={downloadQR}
            variant="outline"
            className="flex-1"
            disabled={!qrValue}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <Button
            onClick={generateQRValue}
            variant="outline"
            disabled={isGenerating}
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Show this QR code to your server</li>
            <li>2. They'll scan it with their device</li>
            <li>3. Your {type} will be applied automatically</li>
            <li>4. Enjoy your savings!</li>
          </ol>
        </div>

        {/* Points Display for Loyalty */}
        {type === 'points' && (
          <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Current Points</h4>
                <p className="text-2xl font-bold text-primary">{loyaltyPoints}</p>
              </div>
              <div className="text-right">
                <h4 className="font-medium text-gray-900">Member Tier</h4>
                <p className="text-lg font-semibold text-secondary capitalize">{currentTier}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Expiry Timer Component
const ExpiryTimer: React.FC<{ expiryTime: Date }> = ({ expiryTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = expiryTime.getTime() - now;

      if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      } else {
        setTimeLeft('Expired');
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [expiryTime]);

  return <span className="font-mono">{timeLeft}</span>;
};

export default QRCodeDisplay;