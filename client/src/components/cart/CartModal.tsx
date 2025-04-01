import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { CartItem } from "@/types";

const CartModal = () => {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    getSubtotal, 
    getTax, 
    getTotal,
    clearCart 
  } = useCart();
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, navigate] = useLocation();

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Please log in",
        description: "You must be logged in to place an order",
        variant: "destructive",
      });
      closeCart();
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const order = {
        userId: user.id,
        totalPrice: getTotal(),
        status: "pending",
        restaurantId: 1, // Default restaurant
      };

      const items = cartItems.map((item: CartItem) => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price * item.quantity,
        notes: item.notes,
        modifiers: item.selectedModifiers,
      }));

      const response = await apiRequest("POST", "/api/orders", { order, items });
      const data = await response.json();

      toast({
        title: "Order placed successfully!",
        description: `You earned ${data.pointsEarned} loyalty points`,
      });

      clearCart();
      closeCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      navigate("/order");
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Failed to place order",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCart();
      }}
    >
      <div
        className="bg-white rounded-t-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
        style={{ transform: "translateY(0)", transition: "transform 0.3s ease-out" }}
      >
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-lg">Your Order</h3>
            <button onClick={closeCart} className="text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cartItems.map((item: CartItem) => (
                  <div key={item.menuItem.id} className="flex items-center">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-medium">{item.menuItem.name}</h4>
                      {item.notes && <p className="text-sm text-gray-600">{item.notes}</p>}
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-accent text-primary">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center"
                            disabled={item.quantity <= 1}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <span className="mx-2 w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Total</span>
                  <span className="font-heading font-bold text-lg">${total.toFixed(2)}</span>
                </div>

                {user && (
                  <div className="mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          You'll earn {Math.floor(total)} points with this order!
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Points can be redeemed for rewards on your next visit.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium disabled:opacity-50"
                  onClick={handleCheckout}
                  disabled={isSubmitting || cartItems.length === 0}
                >
                  {isSubmitting ? "Processing..." : "Checkout"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
