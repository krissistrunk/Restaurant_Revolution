import { useState } from "react";
import ReservationForm from "@/components/reservation/ReservationForm";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Info, Calendar, Users, Clock, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ReservePage = () => {
  const { openCart, getItemCount } = useCart();
  const [location, navigate] = useLocation();
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  const walkthroughSteps = [
    {
      title: "Choose a Date",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      description: "Select a date from the calendar for your reservation. You can choose from available dates up to 30 days in advance."
    },
    {
      title: "Select Party Size",
      icon: <Users className="h-8 w-8 text-primary" />,
      description: "Choose how many people will be joining you. This helps us prepare the right table size for your party."
    },
    {
      title: "Pick a Time",
      icon: <Clock className="h-8 w-8 text-primary" />,
      description: "Browse available time slots for your selected date. Green slots indicate availability."
    },
    {
      title: "Add Special Requests",
      icon: <Info className="h-8 w-8 text-primary" />,
      description: "Let us know about any special requirements such as high chairs, window seating, or accessibility needs."
    }
  ];

  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading font-bold text-xl">Table Reservation</h2>
        <Dialog open={isWalkthroughOpen} onOpenChange={setIsWalkthroughOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Info className="h-4 w-4" /> How It Works
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reservation Guide</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Tabs defaultValue="step1" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="step1">Step 1</TabsTrigger>
                  <TabsTrigger value="step2">Step 2</TabsTrigger>
                  <TabsTrigger value="step3">Step 3</TabsTrigger>
                  <TabsTrigger value="step4">Step 4</TabsTrigger>
                </TabsList>
                {walkthroughSteps.map((step, index) => (
                  <TabsContent key={index} value={`step${index + 1}`} className="py-2">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 bg-primary/10 rounded-full">{step.icon}</div>
                      <h3 className="text-lg font-medium">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4 mb-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Quick Tip</h3>
              <p className="text-sm text-gray-600">
                For weekend reservations, we recommend booking at least 3 days in advance. 
                Our busiest times are 7-9 PM on Friday and Saturday.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ReservationForm />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-heading font-semibold text-lg mb-4">Pre-Order Your Meal</h3>
        <p className="text-gray-600 mb-4">
          Want to save time? Pre-order your food now and it will be ready when you arrive.
        </p>
        {getItemCount() > 0 ? (
          <div className="flex flex-col space-y-4">
            <p className="text-sm font-medium">
              You have {getItemCount()} item{getItemCount() > 1 ? "s" : ""} in your cart.
            </p>
            <Button variant="outline" onClick={openCart}>
              Review Your Items
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => navigate("/menu")}>
            Add Pre-Order Items
          </Button>
        )}
      </div>
    </main>
  );
};

export default ReservePage;
