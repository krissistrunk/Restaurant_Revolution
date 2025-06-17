import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  XCircle, 
  Scan,
  Clock,
  Gift,
  Percent,
  Zap,
  Crown,
  AlertCircle,
  User,
  DollarSign
} from 'lucide-react';

interface QRScanResult {
  success: boolean;
  message: string;
  redemption?: {
    type: 'loyalty' | 'discount' | 'lightning' | 'tier';
    reward?: any;
    discountAmount?: number;
    discountType?: string;
    deal?: any;
    userTier?: string;
    benefit?: any;
    pointsDeducted?: number;
    remainingPoints?: number;
  };
  qrType?: string;
}

export const QRScanner: React.FC = () => {
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanHistory, setScanHistory] = useState<Array<QRScanResult & { timestamp: Date; qrCode: string }>>([]);

  // Check if user has staff permissions
  const isStaffUser = user && (user.role === 'owner' || user.role === 'admin');

  const handleScanQR = async (qrCodeValue: string) => {
    if (!isStaffUser) {
      setScanResult({
        success: false,
        message: 'Unauthorized: Only staff members can scan QR codes'
      });
      return;
    }

    setIsProcessing(true);
    setScanResult(null);

    try {
      const response = await fetch('/api/scan-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrCodeValue,
          staffUserId: user.id
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        const successResult: QRScanResult = {
          success: true,
          message: result.message,
          redemption: result.redemption,
          qrType: result.qrType
        };
        setScanResult(successResult);
        
        // Add to scan history
        setScanHistory(prev => [{
          ...successResult,
          timestamp: new Date(),
          qrCode: qrCodeValue
        }, ...prev].slice(0, 10)); // Keep last 10 scans
      } else {
        setScanResult({
          success: false,
          message: result.message || 'Failed to process QR code'
        });
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      setScanResult({
        success: false,
        message: 'Network error - please try again'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualScan = () => {
    if (manualCode.trim()) {
      handleScanQR(manualCode.trim());
      setManualCode('');
    }
  };

  const formatRedemptionDetails = (redemption: QRScanResult['redemption']) => {
    if (!redemption) return null;

    switch (redemption.type) {
      case 'loyalty':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-600" />
              <span className="font-medium">Loyalty Reward Redeemed</span>
            </div>
            {redemption.reward && (
              <div className="text-sm text-gray-600">
                <p><strong>Reward:</strong> {redemption.reward.name}</p>
                <p><strong>Points Deducted:</strong> {redemption.pointsDeducted}</p>
                <p><strong>Remaining Points:</strong> {redemption.remainingPoints}</p>
              </div>
            )}
          </div>
        );

      case 'discount':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Discount Coupon Applied</span>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Discount:</strong> {redemption.message}</p>
            </div>
          </div>
        );

      case 'lightning':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="font-medium">Lightning Deal Redeemed</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>{redemption.message}</p>
            </div>
          </div>
        );

      case 'tier':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-purple-600" />
              <span className="font-medium">Tier Benefit Applied</span>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Tier:</strong> {redemption.userTier}</p>
              <p>{redemption.message}</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-600">
            <p>{redemption.type} benefit applied</p>
          </div>
        );
    }
  };

  const getRedemptionIcon = (type: string) => {
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
        return <QrCode className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!isStaffUser) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center p-8">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">This interface is only available to restaurant staff members.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Scanner</h2>
        <p className="text-gray-600">Scan customer QR codes to apply rewards and discounts</p>
      </div>

      {/* Manual QR Code Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Manual QR Code Entry
          </CardTitle>
          <CardDescription>
            Enter or paste the QR code value manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter QR code value..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
            />
            <Button 
              onClick={handleManualScan}
              disabled={!manualCode.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Scan className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scan Result */}
      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {scanResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              Scan Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scanResult.success ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {scanResult.message}
                  </AlertDescription>
                </Alert>
                
                {scanResult.redemption && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      {formatRedemptionDetails(scanResult.redemption)}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {scanResult.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Scans
            </CardTitle>
            <CardDescription>
              History of recently processed QR codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanHistory.map((scan, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    scan.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {scan.success ? (
                      getRedemptionIcon(scan.qrType || 'default')
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {scan.success ? `${scan.qrType?.toUpperCase()} redeemed` : 'Scan failed'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {scan.timestamp.toLocaleTimeString()} • 
                        {scan.qrCode.substring(0, 20)}...
                      </p>
                    </div>
                  </div>
                  <Badge variant={scan.success ? 'default' : 'destructive'} className="text-xs">
                    {scan.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Staff Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Staff Member:</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Role:</p>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-gray-600">Session:</p>
              <p className="font-medium">Active</p>
            </div>
            <div>
              <p className="text-gray-600">Scans Today:</p>
              <p className="font-medium">{scanHistory.filter(s => s.success).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">
        <p>📱 Scan QR codes from customer devices to apply rewards and discounts</p>
        <p>✅ All redemptions are tracked and validated in real-time</p>
      </div>
    </div>
  );
};

export default QRScanner;