import { useQuery } from "@tanstack/react-query";
import { Restaurant } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const InfoPage = () => {
  const { data: restaurant, isLoading } = useQuery<Restaurant>({
    queryKey: ["/api/restaurant"],
  });

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
      <h2 className="font-heading font-bold text-xl mb-6">Restaurant Information</h2>
      
      <div className="space-y-6">
        <Card>
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
        </Card>
        
        <Card>
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
      </div>
    </main>
  );
};

export default InfoPage;
