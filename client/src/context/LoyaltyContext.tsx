import { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoyaltyReward } from '@/types';
import { useQuery } from '@tanstack/react-query';
import LoyaltyPointsAnimation from '@/components/loyalty/LoyaltyPointsAnimation';

interface LoyaltyContextType {
  rewards: LoyaltyReward[];
  isLoading: boolean;
  redeemReward: (rewardId: number) => Promise<boolean>;
  awardPoints: (points: number, reason?: string) => void;
  generateLoyaltyQR: (rewardId: number) => Promise<string | null>;
  generateDiscountQR: (discountAmount: number, discountType: 'percentage' | 'fixed') => Promise<string | null>;
  generateLightningDealQR: (promotionId: number, dealMetadata: any) => Promise<string | null>;
  generateTierQR: (tierBenefit: any) => Promise<string | null>;
}

export const LoyaltyContext = createContext<LoyaltyContextType | null>(null);

interface LoyaltyProviderProps {
  children: ReactNode;
}

export const LoyaltyProvider = ({ children }: LoyaltyProviderProps) => {
  const { user } = useAuth();
  const [pointsToShow, setPointsToShow] = useState<number | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  
  const { data: rewards = [], isLoading } = useQuery<LoyaltyReward[]>({
    queryKey: ['/api/loyalty-rewards'],
    enabled: !!user,
  });
  
  // Show animation when points change
  const awardPoints = (points: number, reason?: string) => {
    if (points <= 0 || !user) return;
    
    // Store the points to animate
    setPointsToShow(points);
    setShowAnimation(true);
    
    // Log for debugging
    console.log(`Awarded ${points} points${reason ? ` for ${reason}` : ''}`);
  };
  
  // Handle reward redemption
  const redeemReward = async (rewardId: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch('/api/redeem-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          rewardId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to redeem reward');
      }
      
      return true;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      return false;
    }
  };

  // Generate QR code for loyalty reward redemption
  const generateLoyaltyQR = async (rewardId: number): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          qrType: 'loyalty',
          rewardId,
          expiresIn: 24, // 24 hours
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate loyalty QR code');
      }
      
      const qrData = await response.json();
      return qrData.qrCodeValue;
    } catch (error) {
      console.error('Error generating loyalty QR code:', error);
      return null;
    }
  };

  // Generate QR code for discount coupon
  const generateDiscountQR = async (discountAmount: number, discountType: 'percentage' | 'fixed'): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          qrType: 'discount',
          discountAmount,
          discountType,
          expiresIn: 48, // 48 hours for discount coupons
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate discount QR code');
      }
      
      const qrData = await response.json();
      return qrData.qrCodeValue;
    } catch (error) {
      console.error('Error generating discount QR code:', error);
      return null;
    }
  };

  // Generate QR code for lightning deal
  const generateLightningDealQR = async (promotionId: number, dealMetadata: any): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          qrType: 'lightning',
          promotionId,
          metadata: dealMetadata,
          expiresIn: 2, // 2 hours for lightning deals
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate lightning deal QR code');
      }
      
      const qrData = await response.json();
      return qrData.qrCodeValue;
    } catch (error) {
      console.error('Error generating lightning deal QR code:', error);
      return null;
    }
  };

  // Generate QR code for tier-based rewards
  const generateTierQR = async (tierBenefit: any): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          qrType: 'tier',
          metadata: tierBenefit,
          expiresIn: 168, // 1 week for tier benefits
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate tier QR code');
      }
      
      const qrData = await response.json();
      return qrData.qrCodeValue;
    } catch (error) {
      console.error('Error generating tier QR code:', error);
      return null;
    }
  };
  
  // Hide animation after it completes
  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setPointsToShow(null);
  };
  
  return (
    <LoyaltyContext.Provider
      value={{
        rewards,
        isLoading,
        redeemReward,
        awardPoints,
        generateLoyaltyQR,
        generateDiscountQR,
        generateLightningDealQR,
        generateTierQR,
      }}
    >
      {children}
      
      {/* Show loyalty points animation when triggered */}
      {showAnimation && pointsToShow !== null && user && (
        <LoyaltyPointsAnimation
          pointsEarned={pointsToShow}
          totalPoints={user.loyaltyPoints}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </LoyaltyContext.Provider>
  );
};

export default LoyaltyProvider;