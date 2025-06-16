import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Wifi, WifiOff, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface WebSocketStatusProps {
  showDetails?: boolean;
  className?: string;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { isConnected, isConnecting, error, connect, disconnect, lastMessage } = useWebSocket();

  const getStatusIcon = () => {
    if (isConnecting) {
      return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
    }
    if (isConnected) {
      return <Wifi className="h-4 w-4 text-green-500" />;
    }
    return <WifiOff className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    if (error) return 'Connection Error';
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (isConnecting) return 'yellow';
    if (isConnected) return 'green';
    return 'red';
  };

  if (!showDetails) {
    // Simple status indicator
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        <Badge variant={getStatusColor() === 'green' ? 'default' : 'secondary'}>
          {getStatusText()}
        </Badge>
      </div>
    );
  }

  // Detailed status card
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">WebSocket Connection</CardTitle>
          </div>
          <Badge variant={getStatusColor() === 'green' ? 'default' : 'secondary'}>
            {getStatusText()}
          </Badge>
        </div>
        <CardDescription>
          Real-time updates for orders, queue, and notifications
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm">{getStatusText()}</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Connection Error</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Last Message */}
        {lastMessage && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Last message:</span>
            <div className="mt-1 p-2 bg-gray-50 rounded border">
              <div>Type: {lastMessage.type}</div>
              <div>Channel: {lastMessage.channel}</div>
              <div>Time: {new Date(lastMessage.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        )}

        {/* Connection Controls */}
        <div className="flex gap-2">
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={disconnect}
              className="flex-1"
            >
              <WifiOff className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={connect}
              disabled={isConnecting}
              className="flex-1"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isConnecting ? 'Connecting...' : 'Reconnect'}
            </Button>
          )}
        </div>

        {/* Features */}
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">Real-time features:</p>
          <ul className="space-y-1 ml-2">
            <li>• Live order status updates</li>
            <li>• Queue position notifications</li>
            <li>• Reservation confirmations</li>
            <li>• Menu and promotion updates</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebSocketStatus;