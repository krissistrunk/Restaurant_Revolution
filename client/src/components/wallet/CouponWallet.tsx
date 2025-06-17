import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useLoyalty } from '@/hooks/useLoyalty';
import { QRCodeDisplay } from '@/components/loyalty/QRCodeDisplay';
import { 
  Wallet, 
  Gift, 
  Percent, 
  Zap, 
  Crown,
  Clock,
  Star,
  Trophy,
  Plus,
  Archive,
  Calendar,
  Timer,
  Sparkles
} from 'lucide-react';

interface QRCoupon {
  id: string;
  qrCodeValue: string;
  qrType: 'loyalty' | 'discount' | 'lightning' | 'tier';
  title: string;
  description: string;
  value?: number;
  discountType?: 'percentage' | 'fixed';
  expiresAt: Date;
  status: 'active' | 'redeemed' | 'expired';
  createdAt: Date;
  metadata?: any;
}

export const CouponWallet: React.FC = () => {
  const { user } = useAuth();
  const { rewards } = useLoyalty();
  const [coupons, setCoupons] = useState<QRCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('active');

  // Mock data for demonstration
  useEffect(() => {
    const mockCoupons: QRCoupon[] = [
      {
        id: '1',
        qrCodeValue: 'RR-LOYALTY-123-1701234567890-abc123',
        qrType: 'loyalty',
        title: 'Free Appetizer',
        description: 'Complimentary appetizer with main course',
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        status: 'active',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: { rewardId: 1, pointsRequired: 100 }
      },
      {
        id: '2',
        qrCodeValue: 'RR-DISCOUNT-123-1701234567891-def456',
        qrType: 'discount',
        title: '15% Off Your Order',
        description: 'Save 15% on your entire order',
        value: 15,
        discountType: 'percentage',
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        status: 'active',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: '3',
        qrCodeValue: 'RR-LIGHTNING-123-1701234567892-ghi789',
        qrType: 'lightning',
        title: 'Flash Burger Special',
        description: 'Burger combo for just $12.99',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        metadata: { dealId: 1, originalPrice: 18.99, dealPrice: 12.99 }
      },
      {
        id: '4',
        qrCodeValue: 'RR-TIER-123-1701234567893-jkl012',
        qrType: 'tier',
        title: 'VIP Priority Seating',
        description: 'Skip the wait with priority seating',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'active',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        metadata: { tier: 'VIP', benefitType: 'priority' }
      },
      {
        id: '5',
        qrCodeValue: 'RR-DISCOUNT-123-1701234567894-mno345',
        qrType: 'discount',
        title: '$5 Off Lunch',
        description: 'Save $5 on lunch orders over $15',
        value: 5,
        discountType: 'fixed',
        expiresAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // expired 1 hour ago
        status: 'expired',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      }
    ];

    setCoupons(mockCoupons);
    setLoading(false);
  }, []);

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const timeDiff = expiresAt.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return 'Expired';
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  const isExpiringSoon = (expiresAt: Date) => {
    const now = new Date();
    const timeDiff = expiresAt.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff <= 24 && hoursDiff > 0;
  };

  const getCouponIcon = (type: string) => {
    switch (type) {
      case 'loyalty':
        return <Gift className="w-5 h-5 text-green-600" />;
      case 'discount':
        return <Percent className="w-5 h-5 text-blue-600" />;
      case 'lightning':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'tier':
        return <Crown className="w-5 h-5 text-purple-600" />;
      default:
        return <Star className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCouponTypeLabel = (type: string) => {
    switch (type) {
      case 'loyalty':
        return 'Loyalty Reward';
      case 'discount':
        return 'Discount Coupon';
      case 'lightning':
        return 'Lightning Deal';
      case 'tier':
        return 'Tier Benefit';
      default:
        return 'Coupon';
    }
  };

  const getCouponValue = (coupon: QRCoupon) => {
    if (coupon.qrType === 'discount' && coupon.value) {
      return coupon.discountType === 'percentage' 
        ? `${coupon.value}% OFF` 
        : `$${coupon.value} OFF`;
    }
    if (coupon.qrType === 'lightning' && coupon.metadata?.dealPrice) {
      return `$${coupon.metadata.dealPrice}`;
    }
    return null;
  };

  const activeCoupons = coupons.filter(c => c.status === 'active');
  const expiredCoupons = coupons.filter(c => c.status === 'expired');
  const redeemedCoupons = coupons.filter(c => c.status === 'redeemed');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Sparkles className="w-8 h-8 mx-auto text-gray-400 mb-2 animate-spin" />
          <p className="text-gray-500">Loading your coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wallet className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">My Coupon Wallet</h2>
        </div>
        <p className="text-gray-600">Your active rewards and exclusive offers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{activeCoupons.length}</div>
            <div className="text-sm text-gray-600">Active Coupons</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Timer className="w-6 h-6 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {activeCoupons.filter(c => isExpiringSoon(c.expiresAt)).length}
            </div>
            <div className="text-sm text-gray-600">Expiring Soon</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{redeemedCoupons.length}</div>
            <div className="text-sm text-gray-600">Redeemed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Archive className="w-6 h-6 mx-auto text-gray-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{expiredCoupons.length}</div>
            <div className="text-sm text-gray-600">Expired</div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activeCoupons.length})</TabsTrigger>
          <TabsTrigger value="redeemed">Redeemed ({redeemedCoupons.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredCoupons.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeCoupons.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent>
                <Gift className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Coupons</h3>
                <p className="text-gray-500 mb-4">Start earning rewards and discounts!</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Explore Rewards
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeCoupons.map((coupon) => {
                const timeRemaining = getTimeRemaining(coupon.expiresAt);
                const expiringSoon = isExpiringSoon(coupon.expiresAt);
                const couponValue = getCouponValue(coupon);

                return (
                  <Card 
                    key={coupon.id} 
                    className={`${expiringSoon ? 'border-orange-200 bg-orange-50' : ''}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getCouponIcon(coupon.qrType)}
                          <div>
                            <CardTitle className="text-lg">{coupon.title}</CardTitle>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {getCouponTypeLabel(coupon.qrType)}
                            </Badge>
                          </div>
                        </div>
                        {couponValue && (
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              {couponValue}
                            </div>
                          </div>
                        )}
                      </div>
                      <CardDescription>{coupon.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Expires:</span>
                        </div>
                        <div className={`font-medium ${
                          expiringSoon ? 'text-orange-600' : 'text-gray-800'
                        }`}>
                          {timeRemaining}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Created:</span>
                        </div>
                        <div className="text-gray-600">
                          {coupon.createdAt.toLocaleDateString()}
                        </div>
                      </div>

                      {expiringSoon && (
                        <Badge variant="destructive" className="w-full justify-center">
                          <Timer className="w-3 h-3 mr-1" />
                          Expires Soon!
                        </Badge>
                      )}

                      <QRCodeDisplay 
                        type={coupon.qrType}
                        rewardId={coupon.metadata?.rewardId}
                        discountAmount={coupon.value}
                        discountType={coupon.discountType}
                        dealMetadata={coupon.metadata}
                        tierBenefit={coupon.metadata}
                        className="w-full"
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="redeemed" className="space-y-4">
          {redeemedCoupons.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent>
                <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Redeemed Coupons</h3>
                <p className="text-gray-500">Your redeemed rewards will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {redeemedCoupons.map((coupon) => (
                <Card key={coupon.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCouponIcon(coupon.qrType)}
                        <div>
                          <CardTitle className="text-lg">{coupon.title}</CardTitle>
                          <Badge variant="outline" className="text-xs mt-1">
                            Redeemed
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{coupon.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Redeemed on {coupon.createdAt.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {expiredCoupons.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent>
                <Archive className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Expired Coupons</h3>
                <p className="text-gray-500">Your expired rewards will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {expiredCoupons.map((coupon) => (
                <Card key={coupon.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCouponIcon(coupon.qrType)}
                        <div>
                          <CardTitle className="text-lg">{coupon.title}</CardTitle>
                          <Badge variant="destructive" className="text-xs mt-1">
                            Expired
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{coupon.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Expired on {coupon.expiresAt.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>💳 Your digital wallet for all restaurant rewards and offers</p>
        <p>📱 Show QR codes to staff for instant redemption</p>
      </div>
    </div>
  );
};

export default CouponWallet;