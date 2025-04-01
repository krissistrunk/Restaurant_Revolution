import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

import MenuPage from "@/pages/MenuPage";
import ReservePage from "@/pages/ReservePage";
import OrderPage from "@/pages/OrderPage";
import RewardsPage from "@/pages/RewardsPage";
import InfoPage from "@/pages/InfoPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import CartButton from "@/components/cart/CartButton";
import CartModal from "@/components/cart/CartModal";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { RestaurantProvider } from "@/context/RestaurantContext";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navigation />
      
      <Switch>
        <Route path="/" component={MenuPage} />
        <Route path="/menu" component={MenuPage} />
        <Route path="/reserve" component={ReservePage} />
        <Route path="/order" component={OrderPage} />
        <Route path="/rewards" component={RewardsPage} />
        <Route path="/info" component={InfoPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route component={NotFound} />
      </Switch>
      
      <CartButton />
      <CartModal />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RestaurantProvider>
        <AuthProvider>
          <CartProvider>
            <Router />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </RestaurantProvider>
    </QueryClientProvider>
  );
}

export default App;
