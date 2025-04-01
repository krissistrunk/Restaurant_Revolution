import { useQuery } from "@tanstack/react-query";
import { Order } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { format } from "date-fns";

const OrderPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", user?.id.toString()],
    enabled: !!user,
  });

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
        <h2 className="font-heading font-bold text-xl mb-6">Your Orders</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
              <Button onClick={() => navigate("/menu")}>Browse Menu</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <h2 className="font-heading font-bold text-xl mb-6">Your Orders</h2>
      
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
