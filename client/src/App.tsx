import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

import HomePage from "@/pages/HomePage";
import MenuPage from "@/pages/MenuPage";
import MenuBrowsePage from "@/pages/MenuBrowsePage";
import ReservePage from "@/pages/ReservePage";
import OrderPage from "@/pages/OrderPage";
import RewardsPage from "@/pages/RewardsPage";
import InfoPage from "@/pages/InfoPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AiAssistantPage from "@/pages/AiAssistantPage";
import ThemeSettingsPage from "@/pages/ThemeSettingsPage";
import OwnerPage from "@/pages/OwnerPage";
import CustomerExperiencePage from "@/pages/CustomerExperiencePage";
import OwnerExperiencePage from "@/pages/OwnerExperiencePage";
import PlatformDemosPage from "@/pages/PlatformDemosPage";
import PricingPage from "@/pages/PricingPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";

import GiftCardsPage from "@/pages/GiftCardsPage";
import CateringPage from "@/pages/CateringPage";
import EventsPage from "@/pages/EventsPage";
import NutritionPage from "@/pages/NutritionPage";
import CareersPage from "@/pages/CareersPage";
import PressPage from "@/pages/PressPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import SupportPage from "@/pages/SupportPage";

import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CartButton from "@/components/cart/CartButton";
import CartModal from "@/components/cart/CartModal";
import AppWrapper from "@/components/AppWrapper";
import AiAssistantDrawer from "@/components/ai/AiAssistantDrawer";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import PWAUpdateNotification from "@/components/pwa/PWAUpdateNotification";
import WebSocketStatus from "@/components/websocket/WebSocketStatus";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { LoyaltyProvider } from "@/context/LoyaltyContext";
import { AiAssistantProvider } from "@/context/AiAssistantContext";
import { ThemeProvider } from "@/context/ThemeContext";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navigation />
      
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/customer-experience" component={CustomerExperiencePage} />
        <Route path="/owner-experience" component={OwnerExperiencePage} />
        <Route path="/platform-demos" component={PlatformDemosPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/owner" component={OwnerPage} />
        <Route path="/menu" component={MenuBrowsePage} />
        <Route path="/sales" component={MenuPage} />
        <Route path="/reserve" component={ReservePage} />
        <Route path="/order" component={OrderPage} />
        <Route path="/rewards" component={RewardsPage} />
        <Route path="/ai-assistant" component={AiAssistantPage} />
        <Route path="/info" component={InfoPage} />
        <Route path="/themes" component={ThemeSettingsPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        
        <Route path="/gift-cards" component={GiftCardsPage} />
        <Route path="/catering" component={CateringPage} />
        <Route path="/events" component={EventsPage} />
        <Route path="/nutrition" component={NutritionPage} />
        <Route path="/careers" component={CareersPage} />
        <Route path="/press" component={PressPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/support" component={SupportPage} />
        
        <Route component={NotFound} />
      </Switch>
      
      <Footer />
      
      <CartButton />
      <CartModal />
      <AiAssistantDrawer />
      <PWAInstallPrompt />
      <PWAUpdateNotification />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RestaurantProvider>
          <AuthProvider>
            <CartProvider>
              <LoyaltyProvider>
                <AiAssistantProvider>
                  <AppWrapper>
                    <Router />
                    <Toaster />
                  </AppWrapper>
                </AiAssistantProvider>
              </LoyaltyProvider>
            </CartProvider>
          </AuthProvider>
        </RestaurantProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
