import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Info, ShoppingBag, Clock, ArrowRight, Truck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const OrderPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", user?.id.toString()],
    enabled: !!user,
  });
  
  const walkthroughSteps = [
    {
      title: "Place Your Order",
      icon: <ShoppingBag className="h-8 w-8 text-primary" />,
      description: "Browse our menu and add items to your cart. You can customize items and specify any special instructions."
    },
    {
      title: "Order Confirmation",
      icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
      description: "After placing your order, you'll receive an order confirmation with an estimated preparation time."
    },
    {
      title: "Order Tracking",
      icon: <Clock className="h-8 w-8 text-primary" />,
      description: "Track the status of your order in real-time. You'll be notified when your order is ready for pickup or out for delivery."
    },
    {
      title: "Order History",
      icon: <Truck className="h-8 w-8 text-primary" />,
      description: "Access your complete order history. Easily reorder your favorite meals with just a few clicks."
    }
  ];

  if (!isAuthenticated) {
    return (
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="font-heading font-bold text-xl mb-4">Your Orders</h2>
          <p className="mb-4">Please log in to view your orders</p>
          <Button onClick={() => navigate("/login")}>Log In</Button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex-grow container mx-auto px-4 py-6">
        <h2 className="font-heading font-bold text-xl mb-6">Your Orders</h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </main>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading font-bold text-xl">Your Orders</h2>
          <Dialog open={isWalkthroughOpen} onOpenChange={setIsWalkthroughOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Info className="h-4 w-4" /> How Ordering Works
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Ordering Guide</DialogTitle>
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

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
              <Button onClick={() => navigate("/menu")}>Browse Menu</Button>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t px-6 py-4">
            <div className="w-full flex flex-col gap-3">
              <h3 className="text-sm font-medium">Did you know?</h3>
              <p className="text-xs text-gray-500">
                You can pre-order food with your table reservation to save time on your visit.
              </p>
              <Button 
                variant="link" 
                size="sm" 
                className="px-0 flex items-center text-primary gap-1 w-fit"
                onClick={() => navigate("/reserve")}
              >
                Make a reservation <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading font-bold text-xl">Your Orders</h2>
        <Dialog open={isWalkthroughOpen} onOpenChange={setIsWalkthroughOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Info className="h-4 w-4" /> How Ordering Works
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ordering Guide</DialogTitle>
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
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Order #{order.id}</CardTitle>
                  <CardDescription>
                    {format(new Date(order.orderDate), "MMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <span className="font-medium">{item.quantity}x </span>
                      <span>{item.menuItem?.name}</span>
                      {item.notes && (
                        <p className="text-sm text-gray-600">{item.notes}</p>
                      )}
                    </div>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="flex justify-between pt-4 font-medium">
                  <span>Total</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
                
                {order.status === "pending" && (
                  <div className="pt-4">
                    <Button className="w-full">Track Order</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default OrderPage;
