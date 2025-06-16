import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import SocialLoginButton from "@/components/auth/SocialLoginButton";
import BiometricLogin from "@/components/auth/BiometricLogin";
import { Link } from "wouter";
import { Crown, User, Fingerprint, Shield } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const guestSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type GuestForm = z.infer<typeof guestSchema>;

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const { login, isAuthenticated } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("traditional");

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const guestForm = useForm<GuestForm>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);

    try {
      // Try existing auth first
      await authLogin(data.username, data.password);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      setLocation("/menu");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onGuestSubmit = async (data: GuestForm) => {
    setIsLoading(true);

    try {
      // Mock guest checkout - create temporary user
      const guestUser = {
        id: Math.floor(Math.random() * 100000),
        username: `guest_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: 'customer' as const,
        tier: 'regular' as const,
        loyaltyPoints: 0,
        preferences: {
          cuisine: [],
          spiceLevel: 2,
          priceRange: [10, 50] as [number, number],
          favoriteItems: [],
          allergens: []
        }
      };

      login(guestUser);
      setLocation("/order");
      toast({
        title: "Welcome!",
        description: "You can now place your order as a guest.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to continue as guest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricSuccess = () => {
    setLocation("/");
    toast({
      title: "Welcome back!",
      description: "Biometric authentication successful.",
    });
  };

  const handleBiometricError = (error: string) => {
    toast({
      title: "Authentication failed",
      description: error,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background-alt to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            Welcome to Restaurant Revolution
          </h2>
          <p className="text-text-muted">
            Sign in to access your personalized dining experience
          </p>
        </div>

        <Card className="card-elevated">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Choose Sign-in Method</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="traditional" className="text-xs">
                  <User className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="social" className="text-xs">
                  <Shield className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="biometric" className="text-xs">
                  <Fingerprint className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="guest" className="text-xs">
                  Guest
                </TabsTrigger>
              </TabsList>

              <TabsContent value="traditional" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-text-primary">Traditional Login</h3>
                  <p className="text-sm text-text-muted">Use your username and password</p>
                </div>
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </Form>

                <div className="text-center text-sm text-text-muted">
                  <p>Demo credentials:</p>
                  <p><strong>Owner:</strong> owner / owner123</p>
                  <p><strong>Customer:</strong> customer / customer123</p>
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-text-primary">Social Login</h3>
                  <p className="text-sm text-text-muted">Quick access with your social accounts</p>
                </div>
                
                <div className="space-y-3">
                  <SocialLoginButton provider="google" />
                  <SocialLoginButton provider="facebook" />
                  <SocialLoginButton provider="apple" />
                </div>
                
                <div className="text-center text-xs text-text-muted">
                  Mock social login - creates demo accounts
                </div>
              </TabsContent>

              <TabsContent value="biometric" className="mt-6">
                <BiometricLogin 
                  onSuccess={handleBiometricSuccess}
                  onError={handleBiometricError}
                />
              </TabsContent>

              <TabsContent value="guest" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-text-primary">Guest Checkout</h3>
                  <p className="text-sm text-text-muted">Order without creating an account</p>
                </div>
                
                <Form {...guestForm}>
                  <form onSubmit={guestForm.handleSubmit(onGuestSubmit)} className="space-y-4">
                    <FormField
                      control={guestForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={guestForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating guest account..." : "Continue as Guest"}
                    </Button>
                  </form>
                </Form>
                
                <div className="text-center text-xs text-text-muted">
                  You'll have the option to create an account after ordering
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className="text-center space-y-2">
              <p className="text-sm text-text-muted">
                Don't have an account?{" "}
                <Link href="/register">
                  <a className="text-primary hover:underline font-medium">
                    Sign up here
                  </a>
                </Link>
              </p>
              <p className="text-xs text-text-muted">
                <Link href="/forgot-password">
                  <a className="text-primary hover:underline">
                    Forgot your password?
                  </a>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
