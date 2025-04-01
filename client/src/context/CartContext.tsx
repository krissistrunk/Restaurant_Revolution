import { createContext, useState, ReactNode, useEffect } from "react";
import { CartItem, CartContextType } from "@/types";

export const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);
  
  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (cartItem) => cartItem.menuItem.id === item.menuItem.id
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        return updatedItems;
      } else {
        // Add new item to cart
        return [...prevItems, item];
      }
    });
    
    // Open cart when adding items
    setIsCartOpen(true);
  };
  
  const removeFromCart = (menuItemId: number) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.menuItem.id !== menuItemId)
    );
  };
  
  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setCartItems([]);
  };
  
  const openCart = () => {
    setIsCartOpen(true);
  };
  
  const closeCart = () => {
    setIsCartOpen(false);
  };
  
  const getSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  };
  
  const getTax = () => {
    return getSubtotal() * 0.09; // 9% tax rate
  };
  
  const getTotal = () => {
    return getSubtotal() + getTax();
  };
  
  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };
  
  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    openCart,
    closeCart,
    getSubtotal,
    getTax,
    getTotal,
    getItemCount,
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
