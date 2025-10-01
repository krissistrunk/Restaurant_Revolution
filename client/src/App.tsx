import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

// Eagerly load critical pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

// Lazy load non-critical pages for better performance
const MenuPage = lazy(() => import("@/pages/MenuPage"));
const MenuBrowsePage = lazy(() => import("@/pages/MenuBrowsePage"));
const ReservePage = lazy(() => import("@/pages/ReservePage"));
const OrderPage = lazy(() => import("@/pages/OrderPage"));
const RewardsPage = lazy(() => import("@/pages/RewardsPage"));
const InfoPage = lazy(() => import("@/pages/InfoPage"));
const AiAssistantPage = lazy(() => import("@/pages/AiAssistantPage"));
const ThemeSettingsPage = lazy(() => import("@/pages/ThemeSettingsPage"));
const OwnerPage = lazy(() => import("@/pages/OwnerPage"));
const CustomerExperiencePage = lazy(() => import("@/pages/CustomerExperiencePage"));
const OwnerExperiencePage = lazy(() => import("@/pages/OwnerExperiencePage"));
const PlatformDemosPage = lazy(() => import("@/pages/PlatformDemosPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const GiftCardsPage = lazy(() => import("@/pages/GiftCardsPage"));
const CateringPage = lazy(() => import("@/pages/CateringPage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const NutritionPage = lazy(() => import("@/pages/NutritionPage"));
const CareersPage = lazy(() => import("@/pages/CareersPage"));
const PressPage = lazy(() => import("@/pages/PressPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const SupportPage = lazy(() => import("@/pages/SupportPage"));

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

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navigation />

      <Suspense fallback={<PageLoader />}>
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
      </Suspense>

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
