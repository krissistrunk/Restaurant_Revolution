import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLoyalty } from '@/hooks/useLoyalty';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeDisplay } from '@/components/loyalty/QRCodeDisplay';
import { 
  Crown, 
  Star, 
  Award,
  Gift,
  Sparkles,
  Users,
  Trophy,
  Heart,
  Diamond,
  Coffee
} from 'lucide-react';

interface TierBenefit {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'freeItem' | 'priority' | 'special';
  value?: number;
  category?: string;
  validityDays: number;
  usageLimit: number;
  icon: string;
}

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number | null;
  color: string;
  icon: React.ReactNode;
  benefits: TierBenefit[];
  description: string;
}

const loyaltyTiers: LoyaltyTier[] = [
  {
    id: 'regular',
    name: 'Regular',
    minPoints: 0,
    maxPoints: 499,
    color: 'gray',
    icon: <Users className="w-5 h-5" />,
    description: 'Welcome to our loyalty program!',
    benefits: [
      {
        id: 'birthday-treat',
        title: 'Birthday Treat',
        description: 'Free dessert on your birthday',
        type: 'freeItem',
        category: 'desserts',
        validityDays: 30,
        usageLimit: 1,
        icon: '🎂'
      },
      {
        id: 'welcome-discount',
        title: 'Welcome Discount',
        description: '10% off your first order',
        type: 'discount',
        value: 10,
        validityDays: 30,
        usageLimit: 1,
        icon: '👋'
      }
    ]
  },
  {
    id: 'vip',
    name: 'VIP',
    minPoints: 500,
    maxPoints: 999,
    color: 'blue',
    icon: <Star className="w-5 h-5" />,
    description: 'Enjoy exclusive VIP benefits!',
    benefits: [
      {
        id: 'priority-seating',
        title: 'Priority Seating',
        description: 'Skip the wait with priority seating',
        type: 'priority',
        validityDays: 7,
        usageLimit: 2,
        icon: '🪑'
      },
      {
        id: 'vip-discount',
        title: 'VIP Discount',
        description: '15% off any order',
        type: 'discount',
        value: 15,
        validityDays: 14,
        usageLimit: 3,
        icon: '💎'
      },
      {
        id: 'free-appetizer',
        title: 'Free Appetizer',
        description: 'Complimentary appetizer with main course',
        type: 'freeItem',
        category: 'appetizers',
        validityDays: 14,
        usageLimit: 1,
        icon: '🥗'
      }
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    minPoints: 1000,
    maxPoints: null,
    color: 'gold',
    icon: <Crown className="w-5 h-5" />,
    description: 'The ultimate dining experience!',
    benefits: [
      {
        id: 'chef-special',
        title: 'Chef\'s Special Access',
        description: 'Exclusive access to chef\'s special menu',
        type: 'special',
        validityDays: 30,
        usageLimit: 5,
        icon: '👨‍🍳'
      },
      {
        id: 'premium-discount',
        title: 'Premium Discount',
        description: '20% off any order',
        type: 'discount',
        value: 20,
        validityDays: 30,
        usageLimit: 5,
        icon: '🏆'
      },
      {
        id: 'free-dessert',
        title: 'Free Premium Dessert',
        description: 'Complimentary premium dessert',
        type: 'freeItem',
        category: 'premium-desserts',
        validityDays: 21,
        usageLimit: 2,
        icon: '🍰'
      },
      {
        id: 'valet-service',
        title: 'Valet Parking',
        description: 'Complimentary valet parking service',
        type: 'special',
        validityDays: 14,
        usageLimit: 3,
        icon: '🚗'
      }
    ]
  }
];

export const TierRewards: React.FC = () => {
  const { generateTierQR } = useLoyalty();
  const { user } = useAuth();
  const [generatedQRs, setGeneratedQRs] = useState<Map<string, string>>(new Map());
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);

  // Mock user points for demo (in real app, this would come from user context)
  const userPoints = user?.loyaltyPoints || 650;

  const getCurrentTier = (): LoyaltyTier => {
    return loyaltyTiers.find(tier => 
      userPoints >= tier.minPoints && (tier.maxPoints === null || userPoints <= tier.maxPoints)
    ) || loyaltyTiers[0];
  };

  const getNextTier = (): LoyaltyTier | null => {
    const currentTier = getCurrentTier();
    const currentIndex = loyaltyTiers.findIndex(tier => tier.id === currentTier.id);
    return currentIndex < loyaltyTiers.length - 1 ? loyaltyTiers[currentIndex + 1] : null;
  };

  const getProgressToNextTier = (): number => {
    const nextTier = getNextTier();
    if (!nextTier) return 100;
    
    const currentTier = getCurrentTier();
    const pointsInCurrentTier = userPoints - currentTier.minPoints;
    const pointsNeededForNextTier = nextTier.minPoints - currentTier.minPoints;
    
    return (pointsInCurrentTier / pointsNeededForNextTier) * 100;
  };

  const handleClaimBenefit = async (benefit: TierBenefit) => {
    setGeneratingQR(benefit.id);
    
    try {
      const tierBenefit = {
        benefitId: benefit.id,
        title: benefit.title,
        description: benefit.description,
        type: benefit.type,
        value: benefit.value,
        category: benefit.category,
        tier: getCurrentTier().name,
        validUntil: new Date(Date.now() + benefit.validityDays * 24 * 60 * 60 * 1000),
        usageLimit: benefit.usageLimit
      };

      const qrValue = await generateTierQR(tierBenefit);
      if (qrValue) {
        setGeneratedQRs(prev => new Map(prev.set(benefit.id, qrValue)));
      }
    } catch (error) {
      console.error('Failed to claim tier benefit:', error);
    } finally {
      setGeneratingQR(null);
    }
  };

  const getTierIcon = (tier: LoyaltyTier) => {
    switch (tier.id) {
      case 'regular':
        return <Users className="w-6 h-6 text-gray-600" />;
      case 'vip':
        return <Star className="w-6 h-6 text-blue-600" />;
      case 'premium':
        return <Crown className="w-6 h-6 text-yellow-600" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  const getTierColors = (tier: LoyaltyTier) => {
    switch (tier.id) {
      case 'regular':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800'
        };
      case 'vip':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-800'
        };
      case 'premium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progressToNextTier = getProgressToNextTier();
  const colors = getTierColors(currentTier);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tier Rewards</h2>
        <p className="text-gray-600">Unlock exclusive benefits based on your loyalty tier</p>
      </div>

      {/* Current Tier Status */}
      <Card className={`${colors.bg} ${colors.border} border-2`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTierIcon(currentTier)}
              <div>
                <CardTitle className={`text-xl ${colors.text}`}>
                  {currentTier.name} Member
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {currentTier.description}
                </CardDescription>
              </div>
            </div>
            <Badge className={colors.badge}>
              {userPoints} Points
            </Badge>
          </div>
        </CardHeader>
        
        {nextTier && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress to {nextTier.name}</span>
                <span className="font-medium">
                  {nextTier.minPoints - userPoints} points needed
                </span>
              </div>
              <Progress value={progressToNextTier} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Current Tier Benefits */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Your {currentTier.name} Benefits
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {currentTier.benefits.map((benefit) => {
            const hasGeneratedQR = generatedQRs.has(benefit.id);
            const isGenerating = generatingQR === benefit.id;

            return (
              <Card key={benefit.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{benefit.icon}</div>
                      <div>
                        <CardTitle className="text-base">{benefit.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {benefit.description}
                        </CardDescription>
                      </div>
                    </div>
                    {benefit.type === 'discount' && benefit.value && (
                      <Badge variant="secondary" className="text-xs">
                        {benefit.value}% OFF
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Valid for {benefit.validityDays} days</span>
                    <span>Use {benefit.usageLimit}x</span>
                  </div>

                  {!hasGeneratedQR ? (
                    <Button 
                      onClick={() => handleClaimBenefit(benefit)}
                      disabled={isGenerating}
                      className="w-full"
                      size="sm"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Trophy className="w-4 h-4 mr-2" />
                          Claim Benefit
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center">
                        <Badge variant="secondary" className="mb-2">
                          <Heart className="w-3 h-3 mr-1" />
                          Benefit Claimed!
                        </Badge>
                      </div>
                      <QRCodeDisplay 
                        type="tier"
                        tierBenefit={{
                          benefitId: benefit.id,
                          title: benefit.title,
                          description: benefit.description,
                          type: benefit.type,
                          value: benefit.value,
                          category: benefit.category,
                          tier: currentTier.name,
                          validUntil: new Date(Date.now() + benefit.validityDays * 24 * 60 * 60 * 1000),
                          usageLimit: benefit.usageLimit
                        }}
                        className="w-full"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tier Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Diamond className="w-5 h-5" />
          All Tiers Overview
        </h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          {loyaltyTiers.map((tier) => {
            const tierColors = getTierColors(tier);
            const isCurrentTier = tier.id === currentTier.id;
            const isUnlocked = userPoints >= tier.minPoints;

            return (
              <Card 
                key={tier.id} 
                className={`${isCurrentTier ? `${tierColors.bg} ${tierColors.border} border-2` : ''} ${
                  !isUnlocked ? 'opacity-60' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTierIcon(tier)}
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                    </div>
                    {isCurrentTier && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {tier.minPoints} - {tier.maxPoints || '∞'} points
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                    <div className="space-y-1">
                      {tier.benefits.slice(0, 2).map((benefit) => (
                        <div key={benefit.id} className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{benefit.icon}</span>
                          <span>{benefit.title}</span>
                        </div>
                      ))}
                      {tier.benefits.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{tier.benefits.length - 2} more benefits
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>👑 Higher tiers unlock more exclusive benefits</p>
        <p>⏰ Tier benefits expire after the specified validity period</p>
      </div>
    </div>
  );
};

export default TierRewards;