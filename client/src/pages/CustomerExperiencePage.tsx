import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Smartphone, 
  Brain, 
  Zap, 
  Gift, 
  Clock, 
  Star,
  ArrowRight,
  Play,
  Download,
  CheckCircle,
  Heart,
  Users,
  Bell,
  ShoppingBag,
  MapPin,
  Wifi,
  MessageCircle,
  Target,
  Award
} from 'lucide-react';

const CustomerExperiencePage = () => {
  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="hero-section relative min-h-[70vh] bg-gradient-to-br from-secondary via-secondary to-primary overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        
        <div className="section-container relative z-10 text-white">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Smartphone className="h-4 w-4" />
              📱 Progressive Web App Experience
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Delight Every
              <br />
              <span className="text-primary">Customer</span>
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 max-w-2xl leading-relaxed opacity-90">
              Restaurant Revolution v3 creates personalized dining experiences with AI recommendations, real-time updates, and seamless mobile ordering that keeps customers coming back.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a href="/marketing/customer-demo/interactive-demo.html" target="_blank">
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Try Customer Demo
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-secondary font-bold px-8 py-4 rounded-xl transition-all duration-300"
              >
                <Download className="h-5 w-5 mr-2" />
                Install PWA Demo
              </Button>
            </div>

            {/* Customer Benefits */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Brain className="h-4 w-4" />
                <span>96.2% AI Accuracy</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Clock className="h-4 w-4" />
                <span>58% Faster Service</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Star className="h-4 w-4" />
                <span>94% Satisfaction Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PWA Features Section */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              📱 Progressive Web App Experience
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              App-like experience without app store downloads. Fast, reliable, and works offline.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-text-primary">One-Click Install</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Install directly from the browser with a single tap. No app store, no waiting, no storage concerns.
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    2-second installation
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    90% less storage used
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Wifi className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-text-primary">Offline Capable</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Browse menus, view order history, and prepare orders even without internet connection.
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Full offline browsing
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Smart sync when online
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 gradient-elegant rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-text-primary">Push Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Real-time updates for order status, table readiness, and special offers delivered instantly.
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Instant order updates
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Personalized offers
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Recommendations Section */}
      <section className="section-padding bg-background-alt">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                <Brain className="h-4 w-4" />
                🤖 AI-Powered Intelligence
              </div>
              
              <h2 className="text-4xl font-bold text-text-primary">
                Personalized Menu Recommendations
              </h2>
              
              <p className="text-xl text-text-muted leading-relaxed">
                Advanced machine learning analyzes customer preferences, dietary restrictions, and order history to suggest the perfect dishes with 96.2% accuracy.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-text-primary">Smart Dietary Filtering</h4>
                    <p className="text-text-muted">Automatically filters menu based on allergies and dietary preferences.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Heart className="h-6 w-6 text-secondary mt-1" />
                  <div>
                    <h4 className="font-semibold text-text-primary">Behavioral Learning</h4>
                    <p className="text-text-muted">Gets smarter with every interaction to provide better suggestions.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-text-primary">Social Recommendations</h4>
                    <p className="text-text-muted">"Customers like you also ordered" powered by collaborative filtering.</p>
                  </div>
                </div>
              </div>

              <a href="/marketing/customer-demo/interactive-demo.html" target="_blank">
                <Button size="lg" className="bg-primary hover:bg-primary-dark">
                  <Play className="h-5 w-5 mr-2" />
                  See AI in Action
                </Button>
              </a>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-text-primary mb-2">AI Recommendation Results</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Recommendation Accuracy</span>
                    <span className="text-2xl font-bold text-primary">96.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Customer Satisfaction</span>
                    <span className="text-2xl font-bold text-secondary">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Order Value Increase</span>
                    <span className="text-2xl font-bold text-primary">+28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Return Customer Rate</span>
                    <span className="text-2xl font-bold text-secondary">+42%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Queue Management Section */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              ⏱️ Smart Queue Management
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              AI-powered wait time predictions and real-time updates that eliminate the frustration of waiting.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Clock className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <CardTitle className="text-lg">Accurate Wait Times</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI analyzes kitchen capacity, party sizes, and historical data for 94.7% accurate predictions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                  <Bell className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <CardTitle className="text-lg">Multi-Channel Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  SMS, push notifications, and in-app alerts when your table is ready or order is complete.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <MapPin className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <CardTitle className="text-lg">Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Live position updates in the queue with estimated wait times that adjust automatically.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                  <MessageCircle className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <CardTitle className="text-lg">Smart Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automatic updates and two-way communication for special requests or changes.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Loyalty Program Section */}
      <section className="section-padding bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative order-md-2">
              <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-8 text-center">
                <Gift className="h-20 w-20 text-secondary mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  Smart Loyalty Rewards
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Points Balance</span>
                      <span className="text-2xl font-bold text-secondary">1,247</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Current Tier</span>
                      <span className="text-lg font-bold text-primary">Gold Member</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Next Reward</span>
                      <span className="text-lg font-bold text-secondary">Free Dessert</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 order-md-1">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold">
                <Gift className="h-4 w-4" />
                🎁 Intelligent Loyalty Program
              </div>
              
              <h2 className="text-4xl font-bold text-text-primary">
                Earn Rewards Automatically
              </h2>
              
              <p className="text-xl text-text-muted leading-relaxed">
                AI-powered loyalty program that learns your preferences and delivers personalized rewards that keep you coming back for more.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6 text-secondary mt-1" />
                  <div>
                    <h4 className="font-semibold text-text-primary">Automatic Point Earning</h4>
                    <p className="text-text-muted">Earn points on every purchase, with bonus multipliers for special items.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Target className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-text-primary">Personalized Offers</h4>
                    <p className="text-text-muted">AI creates custom rewards based on your dining preferences and habits.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Star className="h-6 w-6 text-secondary mt-1" />
                  <div>
                    <h4 className="font-semibold text-text-primary">Tiered Benefits</h4>
                    <p className="text-text-muted">Unlock exclusive perks and VIP treatment as you reach higher tiers.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-1">67%</div>
                  <div className="text-sm text-text-muted">Higher Lifetime Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">89%</div>
                  <div className="text-sm text-text-muted">Program Engagement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Success Stories */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              ⭐ What Customers Love
            </h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 text-secondary fill-current" />
              ))}
              <span className="text-lg font-semibold text-text-primary ml-2">4.9/5</span>
              <span className="text-text-muted ml-2">Customer Satisfaction</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Jessica M.",
                review: "The AI recommendations are spot-on! It suggested the perfect wine pairing I never would have thought of. The app works perfectly offline too.",
                feature: "AI Recommendations"
              },
              {
                name: "Michael R.",
                review: "Love getting notifications exactly when my table is ready. No more standing around wondering. The wait time predictions are always accurate.",
                feature: "Smart Queue"
              },
              {
                name: "Sarah L.",
                review: "The loyalty program actually gives me rewards I want! The app knows I'm vegetarian and always shows me the best options first.",
                feature: "Personalized Experience"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="card-elevated">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-secondary fill-current" />
                    ))}
                  </div>
                  <CardTitle className="text-lg text-text-primary">{testimonial.name}</CardTitle>
                  <div className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                    {testimonial.feature}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed italic">
                    "{testimonial.review}"
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section-padding bg-gradient-to-br from-secondary via-secondary to-primary">
        <div className="section-container text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Experience the Future of Dining
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            See how Restaurant Revolution v3 creates personalized, seamless dining experiences that delight customers and build loyalty.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/marketing/customer-demo/interactive-demo.html" target="_blank">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Play className="h-5 w-5 mr-2" />
                Try Customer Demo
              </Button>
            </a>
            
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-secondary font-bold px-8 py-4 rounded-xl transition-all duration-300"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              See Owner Benefits
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CustomerExperiencePage;