import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PersonalizedDashboard from '@/components/menu/PersonalizedDashboard';
import VoiceInterface from '@/components/voice/VoiceInterface';
import QRCodeDisplay from '@/components/loyalty/QRCodeDisplay';
import { 
  User, 
  Heart, 
  Star, 
  Gift, 
  Mic, 
  QrCode, 
  History,
  Settings,
  CreditCard,
  MapPin,
  Bell,
  Crown,
  Zap
} from 'lucide-react';

type CustomerTab = 'dashboard' | 'voice' | 'loyalty' | 'orders' | 'favorites' | 'profile';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<CustomerTab>('dashboard');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <User className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sign In Required</h3>
                <p className="text-gray-600">Please sign in to access your personalized dashboard</p>
              </div>
              <Button onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'AI Dashboard', icon: Star },
    { id: 'voice', label: 'Voice Assistant', icon: Mic },
    { id: 'loyalty', label: 'Loyalty & QR', icon: QrCode },
    { id: 'orders', label: 'Order History', icon: History },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'profile', label: 'Profile', icon: Settings }
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <PersonalizedDashboard />;
      case 'voice':
        return (
          <div className="max-w-4xl mx-auto">
            <VoiceInterface />
          </div>
        );
      case 'loyalty':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QRCodeDisplay type="points" className="h-fit" />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Available Rewards
                  </CardTitle>
                  <CardDescription>Redeem your loyalty points</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Free Appetizer', points: 500, available: true },
                    { name: '20% Off Next Order', points: 750, available: true },
                    { name: 'Free Dessert', points: 600, available: true },
                    { name: 'Chef\'s Special', points: 1200, available: false }
                  ].map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{reward.name}</div>
                        <div className="text-sm text-gray-600">{reward.points} points</div>
                      </div>
                      <Button 
                        size="sm" 
                        disabled={!reward.available || (user.loyaltyPoints || 0) < reward.points}
                      >
                        {reward.available ? 'Redeem' : 'Coming Soon'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Program Benefits</CardTitle>
                <CardDescription>Your {user.tier || 'Regular'} member perks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <h4 className="font-medium">Points Multiplier</h4>
                    <p className="text-sm text-gray-600">
                      {user.tier === 'premium' ? '3x' : user.tier === 'vip' ? '2x' : '1x'} points on orders
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-medium">Exclusive Deals</h4>
                    <p className="text-sm text-gray-600">
                      {user.tier === 'premium' ? 'Weekly' : user.tier === 'vip' ? 'Monthly' : 'Seasonal'} specials
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Gift className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h4 className="font-medium">Birthday Reward</h4>
                    <p className="text-sm text-gray-600">
                      {user.tier === 'premium' ? 'Free meal' : user.tier === 'vip' ? 'Free entrée' : 'Free dessert'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'orders':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Order History
              </CardTitle>
              <CardDescription>Your recent dining experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 'ORD-2024-001',
                    date: '2024-01-15',
                    items: ['Truffle Pasta', 'Caesar Salad', 'Wine'],
                    total: 67.50,
                    status: 'completed',
                    rating: 5
                  },
                  {
                    id: 'ORD-2024-002',
                    date: '2024-01-10',
                    items: ['Grilled Salmon', 'Roasted Vegetables'],
                    total: 42.00,
                    status: 'completed',
                    rating: 4
                  },
                  {
                    id: 'ORD-2024-003',
                    date: '2024-01-05',
                    items: ['Burger', 'Fries', 'Craft Beer'],
                    total: 28.50,
                    status: 'completed',
                    rating: 5
                  }
                ].map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium">{order.id}</div>
                        <div className="text-sm text-gray-600">{order.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${order.total}</div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: order.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {order.items.join(', ')}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Reorder</Button>
                      <Button variant="outline" size="sm">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'favorites':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Your Favorites
              </CardTitle>
              <CardDescription>Items you've loved before</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Truffle Pasta', category: 'Main Course', lastOrdered: '3 days ago', price: 28.99 },
                  { name: 'Caesar Salad', category: 'Appetizer', lastOrdered: '1 week ago', price: 14.99 },
                  { name: 'Chocolate Lava Cake', category: 'Dessert', lastOrdered: '2 weeks ago', price: 12.99 }
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      <Heart className="h-4 w-4 fill-current text-red-500" />
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Last ordered: {item.lastOrdered}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">${item.price}</span>
                      <Button size="sm">Add to Cart</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <div className="mt-1 p-2 border rounded">{user.name}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <div className="mt-1 p-2 border rounded">{user.email}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Loyalty Points</label>
                    <div className="mt-1 p-2 border rounded font-bold text-primary">
                      {user.loyaltyPoints || 0} points
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Member Tier</label>
                    <div className="mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {user.tier || 'Regular'} Member
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button>Edit Profile</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dining Preferences</CardTitle>
                <CardDescription>Help us personalize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Favorite Cuisines</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.preferences?.cuisine?.map((cuisine, index) => (
                      <Badge key={index} variant="outline">{cuisine}</Badge>
                    )) || <span className="text-gray-600">None selected</span>}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Spice Level Preference</label>
                  <div className="mt-2 flex items-center gap-2">
                    <span>{'🌶️'.repeat(user.preferences?.spiceLevel || 0)}</span>
                    <span className="text-gray-600">Level {user.preferences?.spiceLevel || 0}/5</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="mt-2">
                    <span className="text-gray-600">
                      ${user.preferences?.priceRange?.[0] || 0} - ${user.preferences?.priceRange?.[1] || 50}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Allergens to Avoid</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.preferences?.allergens?.map((allergen, index) => (
                      <Badge key={index} variant="destructive">{allergen}</Badge>
                    )) || <span className="text-gray-600">None specified</span>}
                  </div>
                </div>
                <Button>Update Preferences</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>Manage your saved payment options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                        VISA
                      </div>
                      <div>
                        <div className="font-medium">•••• •••• •••• 4242</div>
                        <div className="text-sm text-gray-600">Expires 12/25</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Primary</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <PersonalizedDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Badge variant="outline" className="capitalize text-xs">
                    {user.tier || 'Regular'}
                  </Badge>
                  {user.loyaltyPoints} pts
                </p>
              </div>
            </div>
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
                  onClick={() => setActiveTab(tab.id as CustomerTab)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {tab.label}
                </Button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t mt-4">
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Locations
              </Button>
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

export default CustomerDashboardPage;