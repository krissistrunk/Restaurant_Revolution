import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Gift, 
  Percent, 
  Zap, 
  Crown,
  DollarSign,
  Clock,
  AlertTriangle,
  Sparkles,
  PartyPopper,
  Star
} from 'lucide-react';

interface RedemptionResult {
  success: boolean;
  type: 'loyalty' | 'discount' | 'lightning' | 'tier';
  title: string;
  message: string;
  details?: {
    reward?: { name: string; description: string };
    pointsDeducted?: number;
    remainingPoints?: number;
    discountAmount?: number;
    discountType?: 'percentage' | 'fixed';
    originalPrice?: number;
    dealPrice?: number;
    userTier?: string;
    benefit?: string;
  };
  timestamp: Date;
}

interface RedemptionFeedbackProps {
  result: RedemptionResult | null;
  onClose: () => void;
  className?: string;
}

export const RedemptionFeedback: React.FC<RedemptionFeedbackProps> = ({
  result,
  onClose,
  className = ''
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (result) {
      setShowAnimation(true);
      // Auto close after 5 seconds for successful redemptions
      if (result.success) {
        const timer = setTimeout(() => {
          onClose();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [result, onClose]);

  if (!result) return null;

  const getResultIcon = () => {
    if (!result.success) {
      return <XCircle className="w-16 h-16 text-red-500" />;
    }

    switch (result.type) {
      case 'loyalty':
        return <Gift className="w-16 h-16 text-green-500" />;
      case 'discount':
        return <Percent className="w-16 h-16 text-blue-500" />;
      case 'lightning':
        return <Zap className="w-16 h-16 text-yellow-500" />;
      case 'tier':
        return <Crown className="w-16 h-16 text-purple-500" />;
      default:
        return <CheckCircle className="w-16 h-16 text-green-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (result.type) {
      case 'loyalty':
        return 'Loyalty Reward';
      case 'discount':
        return 'Discount Applied';
      case 'lightning':
        return 'Lightning Deal';
      case 'tier':
        return 'Tier Benefit';
      default:
        return 'Redemption';
    }
  };

  const getTypeColor = () => {
    if (!result.success) return 'border-red-200 bg-red-50';
    
    switch (result.type) {
      case 'loyalty':
        return 'border-green-200 bg-green-50';
      case 'discount':
        return 'border-blue-200 bg-blue-50';
      case 'lightning':
        return 'border-yellow-200 bg-yellow-50';
      case 'tier':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const renderSuccessDetails = () => {
    if (!result.success || !result.details) return null;

    const { details } = result;

    switch (result.type) {
      case 'loyalty':
        return (
          <div className="space-y-3">
            {details.reward && (
              <div className="text-center">
                <h4 className="font-semibold text-lg text-green-800">
                  {details.reward.name}
                </h4>
                <p className="text-green-700">{details.reward.description}</p>
              </div>
            )}
            
            {details.pointsDeducted && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <Star className="w-5 h-5 mx-auto text-red-500 mb-1" />
                  <div className="font-semibold text-red-600">Points Used</div>
                  <div className="text-xl font-bold text-red-700">
                    -{details.pointsDeducted}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <Star className="w-5 h-5 mx-auto text-green-500 mb-1" />
                  <div className="font-semibold text-green-600">Points Left</div>
                  <div className="text-xl font-bold text-green-700">
                    {details.remainingPoints || 0}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'discount':
        return (
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
              <div className="text-2xl font-bold text-blue-700">
                {details.discountType === 'percentage' 
                  ? `${details.discountAmount}%` 
                  : `$${details.discountAmount}`}
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-800">
                {details.discountType === 'percentage' 
                  ? `${details.discountAmount}% Discount Applied!` 
                  : `$${details.discountAmount} Off Your Order!`}
              </div>
              <div className="text-blue-700">Show this confirmation to your server</div>
            </div>
          </div>
        );

      case 'lightning':
        return (
          <div className="text-center space-y-3">
            {details.originalPrice && details.dealPrice && (
              <div className="space-y-2">
                <div className="text-lg line-through text-gray-500">
                  ${details.originalPrice}
                </div>
                <div className="text-3xl font-bold text-yellow-700">
                  ${details.dealPrice}
                </div>
                <div className="text-yellow-800">
                  You saved ${(details.originalPrice - details.dealPrice).toFixed(2)}!
                </div>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-yellow-700">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Lightning Deal Active</span>
            </div>
          </div>
        );

      case 'tier':
        return (
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full">
              <Crown className="w-10 h-10 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-800">
                {details.userTier} Member Benefit
              </div>
              <div className="text-purple-700">{details.benefit}</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFailureDetails = () => {
    if (result.success) return null;

    return (
      <div className="text-center space-y-3">
        <div className="text-red-700">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
          <div className="font-semibold">Redemption Failed</div>
        </div>
        <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">
          {result.message}
        </div>
        <div className="text-xs text-red-500">
          Please try again or contact staff for assistance
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <Card className={`w-full max-w-md ${getTypeColor()} border-2 ${showAnimation ? 'animate-in fade-in-0 zoom-in-95 duration-300' : ''}`}>
        <CardContent className="p-6 text-center space-y-6">
          {/* Header with Icon */}
          <div className="space-y-2">
            <div className="flex justify-center">
              {getResultIcon()}
            </div>
            
            <Badge 
              variant={result.success ? 'default' : 'destructive'} 
              className="text-sm"
            >
              {getTypeLabel()}
            </Badge>

            <h3 className="text-xl font-bold text-gray-900">
              {result.title}
            </h3>

            <p className="text-gray-700">{result.message}</p>
          </div>

          {/* Success Animation */}
          {result.success && (
            <div className="flex justify-center space-x-2">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              <PartyPopper className="w-6 h-6 text-pink-500 animate-bounce" />
              <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
            </div>
          )}

          {/* Details */}
          <div className="space-y-4">
            {result.success ? renderSuccessDetails() : renderFailureDetails()}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            {result.timestamp.toLocaleTimeString()}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={onClose} 
              className="w-full"
              variant={result.success ? 'default' : 'destructive'}
            >
              {result.success ? 'Great!' : 'Try Again'}
            </Button>
            
            {result.success && (
              <p className="text-xs text-gray-500">
                This window will close automatically in 5 seconds
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for managing redemption feedback
export const useRedemptionFeedback = () => {
  const [feedback, setFeedback] = useState<RedemptionResult | null>(null);

  const showSuccess = (
    type: RedemptionResult['type'],
    title: string,
    message: string,
    details?: RedemptionResult['details']
  ) => {
    setFeedback({
      success: true,
      type,
      title,
      message,
      details,
      timestamp: new Date()
    });
  };

  const showError = (
    type: RedemptionResult['type'],
    title: string,
    message: string
  ) => {
    setFeedback({
      success: false,
      type,
      title,
      message,
      timestamp: new Date()
    });
  };

  const clearFeedback = () => {
    setFeedback(null);
  };

  return {
    feedback,
    showSuccess,
    showError,
    clearFeedback
  };
};

export default RedemptionFeedback;