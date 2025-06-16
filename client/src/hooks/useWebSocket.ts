import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface WebSocketMessage {
  type: string;
  payload: any;
  channel: string;
  timestamp: string;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const { user } = useAuthStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedChannelsRef = useRef<Set<string>>(new Set());
  const messageHandlersRef = useRef<Map<string, (payload: any) => void>>(new Map());

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null
  });

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  };

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setState(prev => ({ ...prev, isConnected: true, isConnecting: false, error: null }));
        reconnectCountRef.current = 0;
        
        // Authenticate if user is available
        if (user) {
          authenticate(user.id, 'mock-token'); // In real app, use actual JWT token
        }
        
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setState(prev => ({ ...prev, lastMessage: message }));
          
          // Handle specific message types
          if (message.type === 'authenticated') {
            // Re-subscribe to channels after authentication
            subscribedChannelsRef.current.forEach(channel => {
              subscribeToChannel(channel);
            });
          }
          
          // Call specific message handlers
          const handler = messageHandlersRef.current.get(message.type);
          if (handler) {
            handler(message.payload);
          }
          
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
        wsRef.current = null;
        
        onDisconnect?.();
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          scheduleReconnect();
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        const errorMessage = 'WebSocket connection failed';
        setState(prev => ({ ...prev, error: errorMessage, isConnecting: false }));
        onError?.(event);
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create WebSocket connection',
        isConnecting: false 
      }));
    }
  }, [user, onConnect, onDisconnect, onError, onMessage, reconnectAttempts]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectCountRef.current >= reconnectAttempts) {
      setState(prev => ({ ...prev, error: 'Max reconnection attempts reached' }));
      return;
    }

    reconnectCountRef.current++;
    console.log(`Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts})...`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, reconnectInterval);
  }, [connect, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User initiated disconnect');
      wsRef.current = null;
    }
    
    setState(prev => ({ ...prev, isConnected: false, isConnecting: false, error: null }));
  }, []);

  const sendMessage = useCallback((type: string, payload: any, channel?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = { type, payload, channel };
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const authenticate = useCallback((userId: number, token: string) => {
    return sendMessage('auth', { userId, token });
  }, [sendMessage]);

  const subscribeToChannel = useCallback((channel: string) => {
    subscribedChannelsRef.current.add(channel);
    return sendMessage('subscribe', null, channel);
  }, [sendMessage]);

  const unsubscribeFromChannel = useCallback((channel: string) => {
    subscribedChannelsRef.current.delete(channel);
    return sendMessage('unsubscribe', null, channel);
  }, [sendMessage]);

  const onMessageType = useCallback((type: string, handler: (payload: any) => void) => {
    messageHandlersRef.current.set(type, handler);
    
    // Return cleanup function
    return () => {
      messageHandlersRef.current.delete(type);
    };
  }, []);

  const ping = useCallback(() => {
    return sendMessage('ping', { timestamp: Date.now() });
  }, [sendMessage]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Setup periodic ping to keep connection alive
  useEffect(() => {
    if (!state.isConnected) return;
    
    const pingInterval = setInterval(() => {
      ping();
    }, 30000); // Ping every 30 seconds
    
    return () => clearInterval(pingInterval);
  }, [state.isConnected, ping]);

  return {
    // State
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    lastMessage: state.lastMessage,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    authenticate,
    subscribeToChannel,
    unsubscribeFromChannel,
    onMessageType,
    ping,
    
    // WebSocket instance (for advanced usage)
    ws: wsRef.current
  };
};

// Specialized hooks for specific features
export const useOrderUpdates = (userId?: number) => {
  const [orders, setOrders] = useState<any[]>([]);
  const ws = useWebSocket({
    onConnect: () => {
      if (userId) {
        ws.subscribeToChannel(`user:${userId}:orders`);
      }
    }
  });

  useEffect(() => {
    const cleanup = ws.onMessageType('order_updated', (payload) => {
      setOrders(prev => {
        const existingIndex = prev.findIndex(o => o.id === payload.orderId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = payload.order;
          return updated;
        } else {
          return [...prev, payload.order];
        }
      });
    });

    return cleanup;
  }, [ws]);

  return { orders, ...ws };
};

export const useQueueUpdates = (userId?: number, restaurantId?: number) => {
  const [queueEntry, setQueueEntry] = useState<any>(null);
  const ws = useWebSocket({
    onConnect: () => {
      if (userId) {
        ws.subscribeToChannel(`user:${userId}:queue`);
      }
      if (restaurantId) {
        ws.subscribeToChannel(`restaurant:${restaurantId}:queue`);
      }
    }
  });

  useEffect(() => {
    const cleanup = ws.onMessageType('queue_updated', (payload) => {
      setQueueEntry(payload.queueEntry);
    });

    return cleanup;
  }, [ws]);

  return { queueEntry, ...ws };
};

export const useReservationUpdates = (userId?: number, restaurantId?: number) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const ws = useWebSocket({
    onConnect: () => {
      if (userId) {
        ws.subscribeToChannel(`user:${userId}:reservations`);
      }
      if (restaurantId) {
        ws.subscribeToChannel(`restaurant:${restaurantId}:reservations`);
      }
    }
  });

  useEffect(() => {
    const cleanup = ws.onMessageType('reservation_updated', (payload) => {
      setReservations(prev => {
        const existingIndex = prev.findIndex(r => r.id === payload.reservation.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = payload.reservation;
          return updated;
        } else {
          return [...prev, payload.reservation];
        }
      });
    });

    return cleanup;
  }, [ws]);

  return { reservations, ...ws };
};