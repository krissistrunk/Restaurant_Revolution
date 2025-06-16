import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import OwnerDashboard from '@/components/owner/OwnerDashboard';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import ThemeCustomizer from '@/components/storefront/ThemeCustomizer';
import { 
  LayoutDashboard, 
  BarChart3, 
  Palette, 
  Settings, 
  Menu as MenuIcon,
  Users,
  Package,
  Bell,
  AlertTriangle
} from 'lucide-react';

type OwnerPageTab = 'dashboard' | 'analytics' | 'themes' | 'menu' | 'customers' | 'inventory' | 'settings';

export const OwnerPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<OwnerPageTab>('dashboard');

  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Access Denied</h3>
                <p className="text-gray-600">This page is only accessible to restaurant owners</p>
              </div>
              <Button onClick={() => window.location.href = '/login'}>
                Sign In as Owner
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'menu', label: 'Menu Manager', icon: MenuIcon },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OwnerDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'themes':
        return <ThemeCustomizer />;
      case 'menu':
        return (
          <Card>
            <CardContent className="pt-6 text-center">
              <MenuIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Menu Manager</h3>
              <p className="text-gray-600 mb-4">
                Manage your restaurant's menu items, categories, and pricing
              </p>
              <Button>Coming Soon</Button>
            </CardContent>
          </Card>
        );
      case 'customers':
        return (
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Management</h3>
              <p className="text-gray-600 mb-4">
                View customer profiles, order history, and loyalty program data
              </p>
              <Button>Coming Soon</Button>
            </CardContent>
          </Card>
        );
      case 'inventory':
        return (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Management</h3>
              <p className="text-gray-600 mb-4">
                Track stock levels, manage suppliers, and automate reordering
              </p>
              <Button>Coming Soon</Button>
            </CardContent>
          </Card>
        );
      case 'settings':
        return (
          <Card>
            <CardContent className="pt-6 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Restaurant Settings</h3>
              <p className="text-gray-600 mb-4">
                Configure restaurant information, operating hours, and system preferences
              </p>
              <Button>Coming Soon</Button>
            </CardContent>
          </Card>
        );
      default:
        return <OwnerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Owner Portal</h1>
            <p className="text-sm text-gray-600 mt-1">Restaurant Revolution</p>
          </div>
          
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeTab === tab.id ? '' : 'text-gray-600'
                  }`}
                  onClick={() => setActiveTab(tab.id as OwnerPageTab)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {tab.label}
                </Button>
              );
            })}
          </nav>

          {/* Quick Stats in Sidebar */}
          <div className="p-4 border-t mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Today's Revenue</span>
                <span className="font-semibold text-green-600">$2,847</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Orders</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Alerts</span>
                <div className="flex items-center gap-1">
                  <Bell className="h-3 w-3 text-red-500" />
                  <span className="font-semibold text-red-600">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default OwnerPage;