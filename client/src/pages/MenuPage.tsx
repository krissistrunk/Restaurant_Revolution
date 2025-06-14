import { useState } from "react";
import FeaturedItems from "@/components/menu/FeaturedItems";
import MenuCategories from "@/components/menu/MenuCategories";
import MenuItems from "@/components/menu/MenuItems";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Play, FileText, Users, BarChart3 } from "lucide-react";

const MenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      {/* Demo Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Play className="h-6 w-6 text-blue-600" />
          RestaurantRush Interactive Demos
        </h2>
        <p className="text-gray-600 mb-6">Experience the complete restaurant management system from both perspectives.</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <BarChart3 className="h-5 w-5" />
                Restaurant Owner Demo
              </CardTitle>
              <CardDescription>
                See how restaurant owners manage orders, reservations, queue, and analytics in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.open('/owner-demo.html', '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Try Owner Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Users className="h-5 w-5" />
                Customer Experience Demo
              </CardTitle>
              <CardDescription>
                Experience the mobile app customers use to browse, order, make reservations, and earn rewards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.open('/customer-demo.html', '_blank')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Try Customer App
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Marketing Materials Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="h-6 w-6 text-green-600" />
          Marketing & Documentation
        </h2>
        <p className="text-gray-600 mb-6">Complete sales materials, user guides, and implementation resources.</p>
        
        <Button 
          onClick={() => window.open('/marketing-materials.html', '_blank')}
          className="bg-green-600 hover:bg-green-700"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Marketing Package
        </Button>
      </div>

      <FeaturedItems />
      <MenuCategories
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <MenuItems selectedCategory={selectedCategory} />
    </main>
  );
};

export default MenuPage;
