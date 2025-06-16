import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Restaurant } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Info, 
  Star, 
  Calendar, 
  FileText, 
  Utensils, 
  MessageCircle,
  Palette,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

const InfoPage = () => {
  const [location, navigate] = useLocation();
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const { user } = useAuth();
  const { data: restaurant, isLoading } = useQuery<Restaurant>({
    queryKey: ["/api/restaurant"],
  });
  
  const restaurantFeatures = [
    {
      title: "About Us",
      icon: <FileText className="h-8 w-8 text-primary" />,
      description: "Learn about our restaurant, our story, and the culinary philosophy that drives our menu."
    },
    {
      title: "Location & Hours",
      icon: <MapPin className="h-8 w-8 text-primary" />,
      description: "Find our address, contact information, and opening hours for all days of the week."
    },
    {
      title: "Reservations",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      description: "Book a table in advance to ensure your dining experience is seamless and comfortable."
    },
    {
      title: "Menu & Specialties",
      icon: <Utensils className="h-8 w-8 text-primary" />,
      description: "Explore our diverse menu with seasonal specials and signature dishes prepared by our talented chefs."
    }
  ];

  if (isLoading) {
    return (
      <main className="flex-grow container mx-auto px-4 py-6">
        <h2 className="font-heading font-bold text-xl mb-6">Restaurant Information</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="flex-grow container mx-auto px-4 py-6">
        <h2 className="font-heading font-bold text-xl mb-6">Restaurant Information</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <p className="text-gray-500">Restaurant information is not available</p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading font-bold text-xl">Restaurant Information</h2>
        <Dialog open={isWalkthroughOpen} onOpenChange={setIsWalkthroughOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Info className="h-4 w-4" /> Restaurant Guide
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Restaurant Information Guide</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Tabs defaultValue="feature1" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="feature1">About</TabsTrigger>
                  <TabsTrigger value="feature2">Location</TabsTrigger>
                  <TabsTrigger value="feature3">Reserve</TabsTrigger>
                  <TabsTrigger value="feature4">Menu</TabsTrigger>
                </TabsList>
                {restaurantFeatures.map((feature, index) => (
                  <TabsContent key={index} value={`feature${index + 1}`} className="py-2">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 bg-primary/10 rounded-full">{feature.icon}</div>
                      <h3 className="text-lg font-medium">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                      
                      {index === 0 && (
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          onClick={() => {
                            setIsWalkthroughOpen(false);
                            // Scroll to about section
                            document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          View About Section
                        </Button>
                      )}
                      
                      {index === 1 && (
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          onClick={() => {
                            setIsWalkthroughOpen(false);
                            // Scroll to location section
                            document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          View Location Details
                        </Button>
                      )}
                      
                      {index === 2 && (
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          onClick={() => {
                            setIsWalkthroughOpen(false);
                            navigate("/reserve");
                          }}
                        >
                          Make a Reservation
                        </Button>
                      )}
                      
                      {index === 3 && (
                        <Button 
                          variant="outline" 
                          className="mt-2" 
                          onClick={() => {
                            setIsWalkthroughOpen(false);
                            navigate("/menu");
                          }}
                        >
                          Browse Our Menu
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-6">
        <Card id="about-section">
          <CardHeader>
            <CardTitle>About {restaurant.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start mb-4">
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-20 h-20 rounded-lg mr-4 object-cover"
              />
              <p>{restaurant.description}</p>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t px-6 py-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
              <span className="font-medium">Did you know?</span>
              <p className="text-sm text-gray-600">
                {restaurant.name} has been serving customers since 2010 and has won multiple culinary awards.
              </p>
            </div>
          </CardFooter>
        </Card>
        
        <Card id="location-section">
          <CardHeader>
            <CardTitle>Contact & Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                <span>{restaurant.phone}</span>
              </div>
              {restaurant.email && (
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  <span>{restaurant.email}</span>
                </div>
              )}
            </div>
            
            {(restaurant.latitude && restaurant.longitude) && (
              <div className="mt-4 w-full h-60 bg-gray-200 rounded-lg">
                <iframe
                  title="Restaurant Location"
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${restaurant.latitude},${restaurant.longitude}`}
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Opening Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {restaurant.openingHours && Object.entries(restaurant.openingHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="capitalize">{day}</span>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{hours}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Owner Dashboard - Only visible to owners */}
        {user?.role === 'owner' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Owner Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Manage your restaurant's storefront appearance and settings.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                        <Palette className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary">Theme Settings</h4>
                        <p className="text-sm text-gray-600">Choose from 4 professional storefront designs</p>
                      </div>
                    </div>
                    <Link href="/themes">
                      <Button size="sm">
                        Customize
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-secondary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 gradient-secondary rounded-lg flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary">Marketing Materials</h4>
                        <p className="text-sm text-gray-600">Access promotional materials and brand assets</p>
                      </div>
                    </div>
                    <a href="/marketing" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        View Materials
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};

export default InfoPage;
