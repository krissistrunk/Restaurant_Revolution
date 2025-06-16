import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useMenuStore } from '@/stores/menuStore';
import { usePromotionStore } from '@/stores/promotionStore';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package,
  Bell,
  Settings,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Edit
} from 'lucide-react';

interface DashboardStats {
  todayRevenue: number;
  ordersToday: number;
  activeCustomers: number;
  inventoryAlerts: number;
  averageRating: number;
  popularItems: Array<{
    id: number;
    name: string;
    orders: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    items: string[];
    total: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed';
    time: string;
  }>;
  inventoryStatus: Array<{
    itemId: number;
    name: string;
    current: number;
    minimum: number;
    status: 'good' | 'low' | 'critical';
  }>;
}

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { menuItems } = useMenuStore();
  const { activePromotions } = usePromotionStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    // Mock dashboard data
    const mockStats: DashboardStats = {
      todayRevenue: 2847.50,
      ordersToday: 42,
      activeCustomers: 156,
      inventoryAlerts: 3,
      averageRating: 4.7,
      popularItems: [
        { id: 1, name: 'Truffle Pasta', orders: 12, revenue: 384.00 },
        { id: 2, name: 'Grilled Salmon', orders: 8, revenue: 256.00 },
        { id: 3, name: 'Caesar Salad', orders: 15, revenue: 195.00 },
        { id: 4, name: 'Chocolate Lava Cake', orders: 10, revenue: 120.00 }
      ],
      recentOrders: [
        {
          id: 'ORD-001',
          customerName: 'John Smith',
          items: ['Truffle Pasta', 'Caesar Salad'],
          total: 47.50,
          status: 'preparing',
          time: '2 min ago'
        },
        {
          id: 'ORD-002',
          customerName: 'Sarah Johnson',
          items: ['Grilled Salmon', 'Wine'],
          total: 65.00,
          status: 'ready',
          time: '5 min ago'
        },
        {
          id: 'ORD-003',
          customerName: 'Mike Chen',
          items: ['Burger', 'Fries', 'Soda'],
          total: 28.50,
          status: 'completed',
          time: '12 min ago'
        }
      ],
      inventoryStatus: [
        { itemId: 1, name: 'Truffle Oil', current: 2, minimum: 5, status: 'critical' },
        { itemId: 2, name: 'Fresh Salmon', current: 8, minimum: 10, status: 'low' },
        { itemId: 3, name: 'Caesar Dressing', current: 3, minimum: 5, status: 'low' },
        { itemId: 4, name: 'Pasta', current: 25, minimum: 15, status: 'good' }
      ]
    };
    
    setStats(mockStats);
  }, [selectedTimeRange]);

  if (!user || user.role !== 'owner') {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Access Denied</h3>
              <p className="text-gray-600">Only restaurant owners can access this dashboard</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInventoryStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['today', 'week', 'month'] as const).map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTimeRange(range)}
                className="capitalize"
              >
                {range}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.todayRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.ordersToday}</div>
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +5% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.activeCustomers}</div>
            <p className="text-xs text-purple-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8% this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
            <p className="text-xs text-gray-600">Based on 127 reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.inventoryAlerts > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Inventory Alerts ({stats.inventoryAlerts})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              You have {stats.inventoryAlerts} items running low on inventory. 
              <Button variant="link" className="text-red-700 p-0 ml-1 h-auto">
                View Details
              </Button>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{order.customerName}</span>
                      <Badge className={getOrderStatusColor(order.status)} variant="secondary">
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.items.join(', ')}
                    </div>
                    <div className="text-xs text-gray-500">{order.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${order.total}</div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Popular Items Today
            </CardTitle>
            <CardDescription>Best performing menu items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.popularItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.orders} orders</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${item.revenue}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <PieChart className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Status
          </CardTitle>
          <CardDescription>Current stock levels and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.inventoryStatus.map((item) => (
              <div key={item.itemId} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{item.name}</span>
                  {getInventoryStatusIcon(item.status)}
                </div>
                <div className="text-xs text-gray-600">
                  Current: {item.current} | Min: {item.minimum}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.status === 'critical' ? 'bg-red-500' :
                      item.status === 'low' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((item.current / item.minimum) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
            <Button variant="outline" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Manage Inventory
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm">Add Menu Item</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Star className="h-6 w-6" />
              <span className="text-sm">Create Promotion</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">View Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Settings className="h-6 w-6" />
              <span className="text-sm">Restaurant Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDashboard;