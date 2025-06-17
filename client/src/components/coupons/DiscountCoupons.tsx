import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLoyalty } from '@/hooks/useLoyalty';
import { QRCodeDisplay } from '@/components/loyalty/QRCodeDisplay';
import { 
  Percent, 
  DollarSign, 
  Clock, 
  Gift,
  Sparkles,
  Tag
} from 'lucide-react';

interface DiscountCoupon {
  id: string;
  type: 'percentage' | 'fixed';
  amount: number;
  title: string;
  description: string;
  minOrderAmount?: number;
  category?: string;
  validUntil: Date;
  isActive: boolean;
}

const availableCoupons: DiscountCoupon[] = [
  {
    id: 'welcome10',
    type: 'percentage',
    amount: 10,
    title: 'Welcome Discount',
    description: 'Get 10% off your first order',
    minOrderAmount: 25,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    isActive: true
  },
  {
    id: 'lunch5',
    type: 'fixed',
    amount: 5,
    title: 'Lunch Special',
    description: '$5 off lunch orders',
    minOrderAmount: 15,
    category: 'lunch',
    validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    isActive: true
  },
  {
    id: 'appetizer15',
    type: 'percentage',
    amount: 15,
    title: 'Appetizer Deal',
    description: '15% off all appetizers',
    category: 'appetizers',
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    isActive: true
  }
];

export const DiscountCoupons: React.FC = () => {
  const { generateDiscountQR } = useLoyalty();
  const [generatedQRs, setGeneratedQRs] = useState<Map<string, string>>(new Map());
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);

  const handleGenerateQR = async (coupon: DiscountCoupon) => {
    setGeneratingQR(coupon.id);
    
    try {
      const qrValue = await generateDiscountQR(coupon.amount, coupon.type);
      if (qrValue) {
        setGeneratedQRs(prev => new Map(prev.set(coupon.id, qrValue)));
      }
    } catch (error) {
      console.error('Failed to generate discount QR:', error);
    } finally {
      setGeneratingQR(null);
    }
  };

  const formatDiscountText = (coupon: DiscountCoupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.amount}% OFF`;
    } else {
      return `$${coupon.amount} OFF`;
    }
  };

  const isExpiringSoon = (validUntil: Date) => {
    const now = new Date();
    const timeDiff = validUntil.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff <= 24;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Discount Coupons</h2>
        <p className="text-gray-600">Generate QR codes for exclusive discounts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableCoupons.map((coupon) => {
          const hasGeneratedQR = generatedQRs.has(coupon.id);
          const isGenerating = generatingQR === coupon.id;
          const expiringSoon = isExpiringSoon(coupon.validUntil);

          return (
            <Card key={coupon.id} className={`relative overflow-hidden ${expiringSoon ? 'border-orange-200 bg-orange-50' : ''}`}>
              {expiringSoon && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Expires Soon
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {coupon.type === 'percentage' ? (
                      <Percent className="w-5 h-5 text-green-600" />
                    ) : (
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    )}
                    <CardTitle className="text-lg">{coupon.title}</CardTitle>
                  </div>
                  <div className={`text-2xl font-bold ${coupon.type === 'percentage' ? 'text-green-600' : 'text-blue-600'}`}>
                    {formatDiscountText(coupon)}
                  </div>
                </div>
                <CardDescription>{coupon.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  {coupon.minOrderAmount && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>Min order: ${coupon.minOrderAmount}</span>
                    </div>
                  )}
                  {coupon.category && (
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      <span>Category: {coupon.category}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Valid until: {coupon.validUntil.toLocaleDateString()}</span>
                  </div>
                </div>

                {!hasGeneratedQR ? (
                  <Button 
                    onClick={() => handleGenerateQR(coupon)}
                    disabled={isGenerating || !coupon.isActive}
                    className="w-full"
                    variant={coupon.type === 'percentage' ? 'default' : 'outline'}
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating QR...
                      </>
                    ) : (
                      <>
                        <Tag className="w-4 h-4 mr-2" />
                        Generate Coupon QR
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center">
                      <Badge variant="secondary" className="mb-2">
                        <Sparkles className="w-3 h-3 mr-1" />
                        QR Code Ready
                      </Badge>
                    </div>
                    <QRCodeDisplay 
                      type="discount"
                      discountAmount={coupon.amount}
                      discountType={coupon.type}
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>🎯 Show your QR code to the restaurant staff to apply discounts</p>
        <p>💡 QR codes expire 48 hours after generation</p>
      </div>
    </div>
  );
};

export default DiscountCoupons;