import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLoyalty } from '@/hooks/useLoyalty';
import { QRCodeDisplay } from '@/components/loyalty/QRCodeDisplay';
import { 
  Zap, 
  Clock, 
  Fire,
  Users,
  Percent,
  Gift,
  Timer,
  AlertCircle
} from 'lucide-react';

interface LightningDeal {
  id: number;
  title: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
  totalAvailable: number;
  claimed: number;
  startTime: Date;
  endTime: Date;
  category: string;
  imageUrl?: string;
  isActive: boolean;
}

// Sample lightning deals data
const lightningDeals: LightningDeal[] = [
  {
    id: 1,
    title: 'Flash Burger Special',
    description: 'Our signature burger with fries and drink',
    originalPrice: 18.99,
    dealPrice: 12.99,
    discountPercentage: 32,
    totalAvailable: 50,
    claimed: 23,
    startTime: new Date(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    category: 'Mains',
    isActive: true
  },
  {
    id: 2,
    title: 'Happy Hour Appetizers',
    description: 'Any two appetizers for one low price',
    originalPrice: 24.99,
    dealPrice: 15.99,
    discountPercentage: 36,
    totalAvailable: 30,
    claimed: 8,
    startTime: new Date(),
    endTime: new Date(Date.now() + 90 * 60 * 1000), // 90 minutes from now
    category: 'Appetizers',
    isActive: true
  },
  {
    id: 3,
    title: 'Dessert Duo Deal',
    description: 'Two premium desserts to share',
    originalPrice: 16.99,
    dealPrice: 9.99,
    discountPercentage: 41,
    totalAvailable: 25,
    claimed: 19,
    startTime: new Date(),
    endTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
    category: 'Desserts',
    isActive: true
  }
];

export const LightningDeals: React.FC = () => {
  const { generateLightningDealQR } = useLoyalty();
  const [deals, setDeals] = useState<LightningDeal[]>(lightningDeals);
  const [generatedQRs, setGeneratedQRs] = useState<Map<number, string>>(new Map());
  const [generatingQR, setGeneratingQR] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClaimDeal = async (deal: LightningDeal) => {
    setGeneratingQR(deal.id);
    
    try {
      const dealMetadata = {
        dealId: deal.id,
        title: deal.title,
        originalPrice: deal.originalPrice,
        dealPrice: deal.dealPrice,
        validUntil: deal.endTime
      };

      const qrValue = await generateLightningDealQR(deal.id, dealMetadata);
      if (qrValue) {
        setGeneratedQRs(prev => new Map(prev.set(deal.id, qrValue)));
        
        // Increment claimed count
        setDeals(prev => prev.map(d => 
          d.id === deal.id 
            ? { ...d, claimed: d.claimed + 1 }
            : d
        ));
      }
    } catch (error) {
      console.error('Failed to claim lightning deal:', error);
    } finally {
      setGeneratingQR(null);
    }
  };

  const getTimeRemaining = (endTime: Date) => {
    const timeDiff = endTime.getTime() - currentTime.getTime();
    
    if (timeDiff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, expired: false };
  };

  const formatTimeRemaining = (timeRemaining: ReturnType<typeof getTimeRemaining>) => {
    if (timeRemaining.expired) return 'EXPIRED';
    
    const { hours, minutes, seconds } = timeRemaining;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getAvailabilityPercentage = (deal: LightningDeal) => {
    return ((deal.totalAvailable - deal.claimed) / deal.totalAvailable) * 100;
  };

  const isDealCritical = (deal: LightningDeal) => {
    const timeRemaining = getTimeRemaining(deal.endTime);
    const availabilityPercentage = getAvailabilityPercentage(deal);
    
    return (
      (timeRemaining.hours === 0 && timeRemaining.minutes < 30) || 
      availabilityPercentage < 20
    );
  };

  const activeDeal = deals.filter(deal => {
    const timeRemaining = getTimeRemaining(deal.endTime);
    return !timeRemaining.expired && deal.claimed < deal.totalAvailable;
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Lightning Deals</h2>
          <Fire className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-gray-600">Limited time offers - claim before they're gone!</p>
      </div>

      {activeDeal.length === 0 && (
        <Card className="text-center p-8">
          <CardContent>
            <Timer className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Lightning Deals</h3>
            <p className="text-gray-500">Check back soon for amazing flash deals!</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeDeal.map((deal) => {
          const timeRemaining = getTimeRemaining(deal.endTime);
          const availabilityPercentage = getAvailabilityPercentage(deal);
          const hasGeneratedQR = generatedQRs.has(deal.id);
          const isGenerating = generatingQR === deal.id;
          const isCritical = isDealCritical(deal);
          const isSoldOut = deal.claimed >= deal.totalAvailable;

          return (
            <Card 
              key={deal.id} 
              className={`relative overflow-hidden transition-all duration-300 ${
                isCritical ? 'border-red-200 bg-red-50 shadow-lg' : 'hover:shadow-md'
              } ${isSoldOut ? 'opacity-60' : ''}`}
            >
              {isCritical && !isSoldOut && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs py-1 px-3 text-center font-medium">
                  <Fire className="w-3 h-3 inline mr-1" />
                  URGENT - Almost Gone!
                </div>
              )}

              <CardHeader className={isCritical ? 'pt-8' : ''}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{deal.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {deal.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${deal.dealPrice}
                    </div>
                    <div className="text-sm text-gray-500 line-through">
                      ${deal.originalPrice}
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      <Percent className="w-3 h-3 mr-1" />
                      {deal.discountPercentage}% OFF
                    </Badge>
                  </div>
                </div>
                <CardDescription>{deal.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Time Remaining */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Time left:</span>
                  </div>
                  <div className={`font-mono font-bold ${
                    timeRemaining.hours === 0 && timeRemaining.minutes < 10 
                      ? 'text-red-600' 
                      : 'text-gray-800'
                  }`}>
                    {formatTimeRemaining(timeRemaining)}
                  </div>
                </div>

                {/* Availability Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Available:</span>
                    </div>
                    <span className="font-medium">
                      {deal.totalAvailable - deal.claimed} of {deal.totalAvailable} left
                    </span>
                  </div>
                  <Progress 
                    value={availabilityPercentage} 
                    className={`h-2 ${availabilityPercentage < 20 ? 'bg-red-100' : ''}`}
                  />
                </div>

                {/* Action Button or QR Code */}
                {!hasGeneratedQR ? (
                  <Button 
                    onClick={() => handleClaimDeal(deal)}
                    disabled={isGenerating || isSoldOut || timeRemaining.expired}
                    className={`w-full ${isCritical ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    variant={isCritical ? 'destructive' : 'default'}
                  >
                    {isGenerating ? (
                      <>
                        <Timer className="w-4 h-4 mr-2 animate-spin" />
                        Claiming Deal...
                      </>
                    ) : isSoldOut ? (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Sold Out
                      </>
                    ) : timeRemaining.expired ? (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Expired
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Claim Deal
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center">
                      <Badge variant="secondary" className="mb-2">
                        <Gift className="w-3 h-3 mr-1" />
                        Deal Claimed!
                      </Badge>
                    </div>
                    <QRCodeDisplay 
                      type="lightning"
                      promotionId={deal.id.toString()}
                      dealMetadata={{
                        dealId: deal.id,
                        title: deal.title,
                        originalPrice: deal.originalPrice,
                        dealPrice: deal.dealPrice,
                        validUntil: deal.endTime
                      }}
                      className="w-full"
                    />
                    <div className="text-xs text-center text-gray-500">
                      Show this QR code to your server before {formatTimeRemaining(timeRemaining)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>⚡ Lightning deals are limited in quantity and time</p>
        <p>🔥 QR codes expire when the deal ends or is used</p>
      </div>
    </div>
  );
};

export default LightningDeals;