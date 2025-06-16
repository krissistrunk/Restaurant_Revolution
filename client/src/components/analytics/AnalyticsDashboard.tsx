import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  PieChart, 
  Calendar,
  Users,
  DollarSign,
  Package,
  Star,
  Clock,
  Target,
  Zap,
  Brain,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    chartData: Array<{ date: string; amount: number; orders: number }>;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    churnRate: number;
    satisfactionScore: number;
    demographics: Array<{ age: string; percentage: number }>;
  };
  menu: {
    topItems: Array<{ name: string; orders: number; revenue: number; margin: number }>;
    categories: Array<{ name: string; percentage: number; revenue: number }>;
    lowPerformers: Array<{ name: string; orders: number; lastOrdered: string }>;
  };
  operations: {
    avgOrderTime: number;
    peakHours: Array<{ hour: string; orders: number }>;
    staffEfficiency: number;
    tableUtilization: number;
  };
  predictions: {
    nextWeekRevenue: number;
    busyDays: string[];
    stockAlerts: Array<{ item: string; daysLeft: number }>;
    recommendations: string[];
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color, 
  description 
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-3 w-3 text-green-600" />;
      case 'down': return <ArrowDown className="h-3 w-3 text-red-600" />;
      default: return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(change)}% from last period</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter'>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock analytics data
    const mockAnalytics: AnalyticsData = {
      revenue: {
        current: 45680,
        previous: 42130,
        change: 8.4,
        trend: 'up',
        chartData: [
          { date: '2024-01-01', amount: 1250, orders: 45 },
          { date: '2024-01-02', amount: 1580, orders: 52 },
          { date: '2024-01-03', amount: 980, orders: 38 },
          { date: '2024-01-04', amount: 2100, orders: 67 },
          { date: '2024-01-05', amount: 1890, orders: 59 },
          { date: '2024-01-06', amount: 2340, orders: 78 },
          { date: '2024-01-07', amount: 2180, orders: 71 }
        ]
      },
      customers: {
        total: 1247,
        new: 156,
        returning: 1091,
        churnRate: 12.5,
        satisfactionScore: 4.6,
        demographics: [
          { age: '18-25', percentage: 22 },
          { age: '26-35', percentage: 35 },
          { age: '36-45', percentage: 28 },
          { age: '46-60', percentage: 12 },
          { age: '60+', percentage: 3 }
        ]
      },
      menu: {
        topItems: [
          { name: 'Truffle Pasta', orders: 156, revenue: 4680, margin: 68 },
          { name: 'Grilled Salmon', orders: 142, revenue: 4260, margin: 72 },
          { name: 'Caesar Salad', orders: 198, revenue: 2574, margin: 85 },
          { name: 'Ribeye Steak', orders: 89, revenue: 4450, margin: 65 }
        ],
        categories: [
          { name: 'Main Courses', percentage: 45, revenue: 20556 },
          { name: 'Appetizers', percentage: 25, revenue: 11420 },
          { name: 'Desserts', percentage: 15, revenue: 6852 },
          { name: 'Beverages', percentage: 15, revenue: 6852 }
        ],
        lowPerformers: [
          { name: 'Quinoa Bowl', orders: 8, lastOrdered: '3 days ago' },
          { name: 'Vegan Burger', orders: 12, lastOrdered: '1 day ago' },
          { name: 'Fruit Parfait', orders: 6, lastOrdered: '5 days ago' }
        ]
      },
      operations: {
        avgOrderTime: 18.5,
        peakHours: [
          { hour: '12:00', orders: 45 },
          { hour: '13:00', orders: 52 },
          { hour: '19:00', orders: 67 },
          { hour: '20:00', orders: 78 }
        ],
        staffEfficiency: 87,
        tableUtilization: 73
      },
      predictions: {
        nextWeekRevenue: 48200,
        busyDays: ['Friday', 'Saturday', 'Sunday'],
        stockAlerts: [
          { item: 'Truffle Oil', daysLeft: 2 },
          { item: 'Fresh Salmon', daysLeft: 3 },
          { item: 'Aged Balsamic', daysLeft: 1 }
        ],
        recommendations: [
          'Consider promoting Caesar Salad during lunch hours',
          'Stock up on truffle oil before weekend rush',
          'Add vegetarian options to improve variety',
          'Optimize staff schedule for 7-8 PM peak hours'
        ]
      }
    };

    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  if (!user || user.role !== 'owner') {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Access Denied</h3>
              <p className="text-gray-600">Analytics are only available to restaurant owners</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights and data-driven recommendations for your restaurant</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['today', 'week', 'month', 'quarter'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="capitalize"
              >
                {range}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${analytics.revenue.current.toLocaleString()}`}
          change={analytics.revenue.change}
          trend={analytics.revenue.trend}
          icon={<DollarSign className="h-4 w-4 text-white" />}
          color="bg-green-500"
          description={`${timeRange} performance`}
        />
        
        <MetricCard
          title="Active Customers"
          value={analytics.customers.total.toLocaleString()}
          change={((analytics.customers.new / analytics.customers.total) * 100)}
          trend="up"
          icon={<Users className="h-4 w-4 text-white" />}
          color="bg-blue-500"
          description={`${analytics.customers.new} new customers`}
        />
        
        <MetricCard
          title="Avg Order Time"
          value={`${analytics.operations.avgOrderTime}min`}
          change={-12.3}
          trend="down"
          icon={<Clock className="h-4 w-4 text-white" />}
          color="bg-orange-500"
          description="12% faster than last period"
        />
        
        <MetricCard
          title="Customer Satisfaction"
          value={`${analytics.customers.satisfactionScore}/5`}
          change={5.2}
          trend="up"
          icon={<Star className="h-4 w-4 text-white" />}
          color="bg-purple-500"
          description="Based on 234 reviews"
        />
      </div>

      {/* AI Predictions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Predictions
            </CardTitle>
            <CardDescription>Data-driven forecasts for your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-white/60 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Next Week Revenue</span>
                <Badge variant="secondary">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.5%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-primary">
                ${analytics.predictions.nextWeekRevenue.toLocaleString()}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Busy Days Forecast</h4>
              <div className="flex flex-wrap gap-1">
                {analytics.predictions.busyDays.map((day) => (
                  <Badge key={day} variant="outline" className="bg-yellow-50 text-yellow-700">
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">AI Recommendations</h4>
              <div className="space-y-2">
                {analytics.predictions.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Stock Alerts
            </CardTitle>
            <CardDescription className="text-red-700">
              Items running low on inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.predictions.stockAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                  <div>
                    <div className="font-medium text-red-900">{alert.item}</div>
                    <div className="text-sm text-red-700">
                      {alert.daysLeft} days remaining
                    </div>
                  </div>
                  <Badge 
                    variant="destructive" 
                    className={alert.daysLeft <= 1 ? 'animate-pulse' : ''}
                  >
                    {alert.daysLeft <= 1 ? 'Critical' : 'Low'}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 text-red-700 border-red-300">
              <Package className="h-4 w-4 mr-2" />
              Order Supplies
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenue Trends
          </CardTitle>
          <CardDescription>Daily revenue and order volume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2 p-4 bg-gray-50 rounded-lg">
            {analytics.revenue.chartData.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="flex flex-col items-center gap-1 mb-2">
                  <div 
                    className="w-full bg-primary rounded-t"
                    style={{ 
                      height: `${(day.amount / Math.max(...analytics.revenue.chartData.map(d => d.amount))) * 180}px`,
                      minHeight: '20px'
                    }}
                  />
                  <div 
                    className="w-full bg-secondary rounded-b opacity-60"
                    style={{ 
                      height: `${(day.orders / Math.max(...analytics.revenue.chartData.map(d => d.orders))) * 40}px`,
                      minHeight: '10px'
                    }}
                  />
                </div>
                <div className="text-xs text-gray-600 text-center">
                  <div className="font-medium">${day.amount}</div>
                  <div>{day.orders} orders</div>
                  <div>{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary opacity-60 rounded"></div>
              <span>Orders</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Performing Items
            </CardTitle>
            <CardDescription>Best selling menu items this {timeRange}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.menu.topItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                    <div className="text-sm text-gray-600">{item.margin}% margin</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Customer Demographics
            </CardTitle>
            <CardDescription>Age distribution of your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.customers.demographics.map((demo, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{demo.age} years</span>
                  <div className="flex items-center gap-2 flex-1 mx-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${demo.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[40px]">{demo.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{analytics.customers.new}</div>
                <div className="text-sm text-gray-600">New Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{analytics.customers.returning}</div>
                <div className="text-sm text-gray-600">Returning</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Operations Insights
          </CardTitle>
          <CardDescription>Performance metrics and efficiency data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {analytics.operations.staffEfficiency}%
              </div>
              <div className="text-sm text-gray-600">Staff Efficiency</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${analytics.operations.staffEfficiency}%` }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {analytics.operations.tableUtilization}%
              </div>
              <div className="text-sm text-gray-600">Table Utilization</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-secondary h-2 rounded-full"
                  style={{ width: `${analytics.operations.tableUtilization}%` }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {analytics.operations.avgOrderTime}m
              </div>
              <div className="text-sm text-gray-600">Avg Order Time</div>
              <Badge variant="secondary" className="mt-2">
                <ArrowDown className="h-3 w-3 mr-1" />
                Improving
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.max(...analytics.operations.peakHours.map(h => h.orders))}
              </div>
              <div className="text-sm text-gray-600">Peak Hour Orders</div>
              <div className="text-xs text-gray-500 mt-1">
                7-8 PM busiest
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Performers Alert */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <TrendingDown className="h-5 w-5" />
            Items Needing Attention
          </CardTitle>
          <CardDescription className="text-yellow-700">
            Menu items with low order frequency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.menu.lowPerformers.map((item, index) => (
              <div key={index} className="p-3 bg-white/60 rounded-lg">
                <div className="font-medium text-yellow-900">{item.name}</div>
                <div className="text-sm text-yellow-700">
                  {item.orders} orders • Last: {item.lastOrdered}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Promote
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Recipe
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;