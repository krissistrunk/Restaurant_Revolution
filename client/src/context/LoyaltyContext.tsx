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