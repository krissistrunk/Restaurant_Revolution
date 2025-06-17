import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from './storage';
import { log } from './vite';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  userRole?: string;
  restaurantId?: number;
  isAlive?: boolean;
}

interface WebSocketMessage {
  type: 'auth' | 'subscribe' | 'unsubscribe' | 'ping' | 'pong';
  payload?: any;
  channel?: string;
}

interface BroadcastMessage {
  type: string;
  payload: any;
  channel: string;
  timestamp: Date;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Set<AuthenticatedWebSocket> = new Set();
  private channels: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    
    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Setup heartbeat to detect broken connections
    this.heartbeatInterval = setInterval(this.heartbeat.bind(this), 30000);
    
    log('WebSocket server initialized');
  }

  private handleConnection(ws: AuthenticatedWebSocket) {
    log('New WebSocket connection');
    
    ws.isAlive = true;
    this.clients.add(ws);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        await this.handleMessage(ws, message);
      } catch (error) {
        log(`WebSocket message error: ${error}`);
        this.sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    ws.on('error', (error) => {
      log(`WebSocket error: ${error}`);
      this.handleDisconnection(ws);
    });

    // Send welcome message
    this.send(ws, {
      type: 'connected',
      payload: { message: 'WebSocket connection established' },
      channel: 'system',
      timestamp: new Date()
    });
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'auth':
        await this.handleAuth(ws, message.payload);
        break;
        
      case 'subscribe':
        this.handleSubscribe(ws, message.channel!);
        break;
        
      case 'unsubscribe':
        this.handleUnsubscribe(ws, message.channel!);
        break;
        
      case 'ping':
        this.send(ws, {
          type: 'pong',
          payload: message.payload,
          channel: 'system',
          timestamp: new Date()
        });
        break;
        
      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  private async handleAuth(ws: AuthenticatedWebSocket, payload: any) {
    try {
      const { userId, token } = payload;
      
      // In a real app, validate the token here
      // For now, we'll just check if user exists
      const user = await storage.getUser(userId);
      
      if (!user) {
        this.sendError(ws, 'Invalid user credentials');
        return;
      }

      ws.userId = user.id;
      ws.userRole = user.role;
      ws.restaurantId = user.restaurantId || 1; // Default restaurant

      this.send(ws, {
        type: 'authenticated',
        payload: { 
          userId: user.id, 
          role: user.role,
          restaurantId: ws.restaurantId
        },
        channel: 'system',
        timestamp: new Date()
      });

      log(`WebSocket authenticated: User ${userId} (${user.role})`);
    } catch (error) {
      log(`Authentication error: ${error}`);
      this.sendError(ws, 'Authentication failed');
    }
  }

  private handleSubscribe(ws: AuthenticatedWebSocket, channel: string) {
    if (!this.isAuthorizedForChannel(ws, channel)) {
      this.sendError(ws, `Not authorized for channel: ${channel}`);
      return;
    }

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    
    this.channels.get(channel)!.add(ws);
    
    this.send(ws, {
      type: 'subscribed',
      payload: { channel },
      channel: 'system',
      timestamp: new Date()
    });

    log(`Client subscribed to channel: ${channel}`);
  }

  private handleUnsubscribe(ws: AuthenticatedWebSocket, channel: string) {
    if (this.channels.has(channel)) {
      this.channels.get(channel)!.delete(ws);
      
      // Clean up empty channels
      if (this.channels.get(channel)!.size === 0) {
        this.channels.delete(channel);
      }
    }
    
    this.send(ws, {
      type: 'unsubscribed',
      payload: { channel },
      channel: 'system',
      timestamp: new Date()
    });

    log(`Client unsubscribed from channel: ${channel}`);
  }

  private handleDisconnection(ws: AuthenticatedWebSocket) {
    this.clients.delete(ws);
    
    // Remove from all channels
    for (const [channel, clients] of this.channels.entries()) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.channels.delete(channel);
      }
    }

    log(`WebSocket disconnected: User ${ws.userId || 'unknown'}`);
  }

  private isAuthorizedForChannel(ws: AuthenticatedWebSocket, channel: string): boolean {
    if (!ws.userId) return false;

    // System channels are available to all authenticated users
    if (channel.startsWith('system')) return true;
    
    // User-specific channels
    if (channel.startsWith(`user:${ws.userId}`)) return true;
    
    // Restaurant-specific channels
    if (channel.startsWith(`restaurant:${ws.restaurantId}`)) return true;
    
    // Owner/admin channels
    if ((ws.userRole === 'owner' || ws.userRole === 'admin') && 
        (channel.startsWith('orders') || channel.startsWith('queue') || channel.startsWith('analytics'))) {
      return true;
    }
    
    // Customer channels (orders, reservations)
    if (ws.userRole === 'customer' && 
        (channel.startsWith('customer') || channel.includes(`user:${ws.userId}`))) {
      return true;
    }

    return false;
  }

  private send(ws: AuthenticatedWebSocket, message: BroadcastMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: AuthenticatedWebSocket, message: string) {
    this.send(ws, {
      type: 'error',
      payload: { message },
      channel: 'system',
      timestamp: new Date()
    });
  }

  private heartbeat() {
    this.clients.forEach((ws) => {
      if (!ws.isAlive) {
        this.handleDisconnection(ws);
        ws.terminate();
        return;
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }

  // Public methods for broadcasting events
  public broadcastToChannel(channel: string, message: Omit<BroadcastMessage, 'timestamp'>) {
    const clients = this.channels.get(channel);
    if (!clients || clients.size === 0) return;

    const fullMessage: BroadcastMessage = {
      ...message,
      timestamp: new Date()
    };

    clients.forEach((ws) => {
      this.send(ws, fullMessage);
    });

    log(`Broadcast to ${channel}: ${message.type} (${clients.size} clients)`);
  }

  public broadcastToUser(userId: number, message: Omit<BroadcastMessage, 'timestamp'>) {
    const userClients = Array.from(this.clients).filter(ws => ws.userId === userId);
    
    const fullMessage: BroadcastMessage = {
      ...message,
      timestamp: new Date()
    };

    userClients.forEach((ws) => {
      this.send(ws, fullMessage);
    });

    log(`Broadcast to user ${userId}: ${message.type} (${userClients.length} clients)`);
  }

  public broadcastToRestaurant(restaurantId: number, message: Omit<BroadcastMessage, 'timestamp'>) {
    const restaurantClients = Array.from(this.clients).filter(ws => ws.restaurantId === restaurantId);
    
    const fullMessage: BroadcastMessage = {
      ...message,
      timestamp: new Date()
    };

    restaurantClients.forEach((ws) => {
      this.send(ws, fullMessage);
    });

    log(`Broadcast to restaurant ${restaurantId}: ${message.type} (${restaurantClients.length} clients)`);
  }

  // Event broadcasting methods for specific features
  public notifyOrderUpdate(orderId: number, orderData: any, restaurantId: number) {
    this.broadcastToChannel(`restaurant:${restaurantId}:orders`, {
      type: 'order_updated',
      payload: { orderId, order: orderData },
      channel: `restaurant:${restaurantId}:orders`
    });

    // Also notify the specific user
    if (orderData.userId) {
      this.broadcastToUser(orderData.userId, {
        type: 'order_updated',
        payload: { orderId, order: orderData },
        channel: `user:${orderData.userId}:orders`
      });
    }
  }

  public notifyQueueUpdate(queueEntry: any, restaurantId: number) {
    this.broadcastToChannel(`restaurant:${restaurantId}:queue`, {
      type: 'queue_updated',
      payload: { queueEntry },
      channel: `restaurant:${restaurantId}:queue`
    });

    // Also notify the specific user
    if (queueEntry.userId) {
      this.broadcastToUser(queueEntry.userId, {
        type: 'queue_updated',
        payload: { queueEntry },
        channel: `user:${queueEntry.userId}:queue`
      });
    }
  }

  public notifyReservationUpdate(reservation: any, restaurantId: number) {
    this.broadcastToChannel(`restaurant:${restaurantId}:reservations`, {
      type: 'reservation_updated',
      payload: { reservation },
      channel: `restaurant:${restaurantId}:reservations`
    });

    // Also notify the specific user
    if (reservation.userId) {
      this.broadcastToUser(reservation.userId, {
        type: 'reservation_updated',
        payload: { reservation },
        channel: `user:${reservation.userId}:reservations`
      });
    }
  }

  public notifyMenuUpdate(menuData: any, restaurantId: number) {
    this.broadcastToChannel(`restaurant:${restaurantId}:menu`, {
      type: 'menu_updated',
      payload: { menu: menuData },
      channel: `restaurant:${restaurantId}:menu`
    });
  }

  public notifyPromotionUpdate(promotion: any, restaurantId: number) {
    this.broadcastToChannel(`restaurant:${restaurantId}:promotions`, {
      type: 'promotion_updated',
      payload: { promotion },
      channel: `restaurant:${restaurantId}:promotions`
    });
  }

  public getStats() {
    return {
      totalClients: this.clients.size,
      totalChannels: this.channels.size,
      channelStats: Array.from(this.channels.entries()).map(([channel, clients]) => ({
        channel,
        subscriberCount: clients.size
      }))
    };
  }

  public close() {
    clearInterval(this.heartbeatInterval);
    this.wss.close();
    log('WebSocket server closed');
  }
}

let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(server: HTTPServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(server);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}

export function broadcastToRestaurant(restaurantId: number, message: any) {
  if (wsManager) {
    wsManager.broadcastToRestaurant(restaurantId, message);
  }
}