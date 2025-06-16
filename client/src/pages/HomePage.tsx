import { useState } from "react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  Heart,
  Award,
  Users,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Play,
  Gift,
  Utensils,
  FileText,
  ExternalLink,
  Crown
} from "lucide-react";
import { Link } from "wouter";

const HomePage = () => {
  const { restaurant } = useRestaurant();

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="hero-section relative min-h-[80vh] bg-gradient-to-br from-primary via-primary-light to-secondary overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        
        <div className="section-container relative z-10 text-white">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Award className="h-4 w-4" />
              🤖 AI-Powered Restaurant Management Platform
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Transform Your Restaurant
              <br />
              <span className="text-secondary">With AI Power</span>
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 max-w-2xl leading-relaxed opacity-90">
              Restaurant Revolution v3 delivers 680% ROI through AI-powered recommendations, real-time analytics, and automated operations. Join 500+ successful restaurants.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a href="/marketing/owner-demo/interactive-demo.html" target="_blank">
                <Button 
                  size="lg"
                  className="bg-secondary hover:bg-secondary-dark text-text-primary font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2" />
                  See Live Demo
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
              
              <Link href="/owner">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold px-8 py-4 rounded-xl transition-all duration-300"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Key Metrics */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Award className="h-4 w-4" />
                <span>680% Average ROI</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Star className="h-4 w-4" />
                <span>96.2% AI Accuracy</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Users className="h-4 w-4" />
                <span>500+ Restaurants</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="section-padding bg-gradient-to-r from-gray-50 to-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              🏆 Trusted by Industry Leaders
            </h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 text-secondary fill-current" />
              ))}
              <span className="text-lg font-semibold text-text-primary ml-2">4.9/5</span>
              <span className="text-text-muted ml-2">from 500+ restaurants</span>
            </div>
          </div>

          {/* Success Stories */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: "Maria Rodriguez",
                restaurant: "Coastal Bistro",
                location: "San Francisco, CA",
                result: "847% ROI",
                quote: "Restaurant Revolution v3 transformed our entire operation. The AI recommendations alone increased our average order value by 32%.",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b766?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
              },
              {
                name: "James Chen",
                restaurant: "Downtown Grill",
                location: "Austin, TX", 
                result: "623% ROI",
                quote: "The real-time analytics helped us optimize our operations completely. We reduced wait times by 58% and customers love the mobile app.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
              },
              {
                name: "Sofia Martinez",
                restaurant: "Garden Kitchen",
                location: "Miami, FL",
                result: "712% ROI",
                quote: "The CMS integration made managing our 3 locations effortless. We can update menus instantly and the loyalty program boosted retention by 45%.",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="card-elevated text-center">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-secondary fill-current" />
                    ))}
                  </div>
                  <CardTitle className="text-lg text-text-primary">{testimonial.name}</CardTitle>
                  <CardDescription>
                    <div className="font-semibold text-primary">{testimonial.restaurant}</div>
                    <div className="text-xs text-text-muted">{testimonial.location}</div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 mb-3">{testimonial.result}</div>
                  <CardDescription className="text-sm leading-relaxed italic">
                    "{testimonial.quote}"
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-text-muted">Restaurants Served</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-secondary mb-2">680%</div>
                <div className="text-text-muted">Average Annual ROI</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">96.2%</div>
                <div className="text-text-muted">AI Accuracy Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-secondary mb-2">99.9%</div>
                <div className="text-text-muted">Platform Uptime</div>
              </div>
            </div>
          </div>

          {/* Industry Recognition */}
          <div className="text-center mt-12">
            <h3 className="text-xl font-semibold text-text-primary mb-6">Industry Recognition</h3>
            <div className="flex items-center justify-center gap-8 opacity-60 text-lg">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span>Best Restaurant Tech 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                <span>AI Innovation Award</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span>Top Rated Platform</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              🤖 Why Restaurant Revolution v3?
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              The only restaurant platform that combines AI intelligence, real-time operations, and proven ROI results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-text-primary">🤖 AI-Powered Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Advanced machine learning delivers 96.2% accurate recommendations, increasing average order value by 28% and customer retention by 42%.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-text-primary">⚡ Real-time Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  WebSocket-powered live updates, PostgreSQL analytics, and instant notifications reduce wait times by 58% and boost efficiency by 94%.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 gradient-elegant rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-text-primary">💰 Proven ROI Results</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Average 680% annual ROI with measurable results: 42% retention increase, 28% order value growth, and 75% operational efficiency gains.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="section-padding bg-background-alt">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              🚀 Experience Restaurant Revolution v3
            </h2>
            <p className="text-lg text-text-muted">
              Explore both the customer experience and powerful owner management tools.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <a href="/marketing/customer-demo/interactive-demo.html" target="_blank">
              <Card className="card-interactive group text-center cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Utensils className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <CardTitle className="text-lg">📱 Customer Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    See how AI recommendations and PWA features delight your customers.
                  </CardDescription>
                </CardContent>
              </Card>
            </a>

            <a href="/marketing/owner-demo/interactive-demo.html" target="_blank">
              <Card className="card-interactive group text-center cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                    <ShoppingBag className="h-6 w-6 text-secondary group-hover:text-white" />
                  </div>
                  <CardTitle className="text-lg">📊 Owner Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Explore AI analytics, real-time operations, and CMS management tools.
                  </CardDescription>
                </CardContent>
              </Card>
            </a>

            <Link href="/pricing">
              <Card className="card-interactive group text-center cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Calendar className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <CardTitle className="text-lg">💰 ROI Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Calculate your potential ROI and explore our pricing packages.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <a href="/marketing-materials.html" target="_blank">
              <Card className="card-interactive group text-center cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                    <Gift className="h-6 w-6 text-secondary group-hover:text-white" />
                  </div>
                  <CardTitle className="text-lg">📈 Sales Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Complete marketing package with ROI analysis and implementation guides.
                  </CardDescription>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>
      </section>

      {/* Lead Generation Section */}
      <section className="section-padding bg-gradient-to-br from-primary via-primary-light to-secondary">
        <div className="section-container text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Gift className="h-4 w-4" />
              🎁 Limited Time Offer
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Get Your FREE Restaurant 
              <br />
              <span className="text-secondary">ROI Analysis Report</span>
            </h2>
            
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Discover exactly how Restaurant Revolution v3 can increase your revenue. Get a personalized analysis showing your potential ROI, cost savings, and implementation roadmap.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-6">What You'll Get (Worth $497):</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">✓</span>
                  </div>
                  <span>Personalized ROI projection for your restaurant</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">✓</span>
                  </div>
                  <span>Cost-benefit analysis with implementation timeline</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">✓</span>
                  </div>
                  <span>Competitive analysis vs other platforms</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">✓</span>
                  </div>
                  <span>30-minute strategy consultation call</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button 
                  size="lg"
                  className="bg-secondary hover:bg-secondary-dark text-text-primary font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Get My FREE ROI Report
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              
              <a href="/marketing/owner-demo/interactive-demo.html" target="_blank">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold px-8 py-4 rounded-xl transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo First
                </Button>
              </a>
            </div>

            <div className="mt-6 text-sm opacity-75">
              No spam, no sales calls. Just your personalized ROI analysis delivered in 24 hours.
            </div>
          </div>
        </div>
      </section>

      {/* Platform Info Section */}
      <section className="section-padding bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-gray-100">
        <div className="section-container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Crown className="h-4 w-4" />
              🤖 Restaurant Revolution v3 - AI-Powered Platform
            </div>
            
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              See Restaurant Revolution v3 In Action
            </h2>
            <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
              This is a live demonstration of Restaurant Revolution v3. Experience AI recommendations, real-time analytics, PostgreSQL backend, and comprehensive restaurant management tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/marketing/owner-demo/interactive-demo.html" target="_blank">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2" />
                  View Live Demo
                </Button>
              </a>
              
              <Link href="/owner">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              🏆 What Restaurant Owners Say
            </h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 text-secondary fill-current" />
              ))}
              <span className="text-lg font-semibold text-text-primary ml-2">4.9/5</span>
              <span className="text-text-muted ml-2">from 500+ restaurant owners</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Rodriguez, Owner",
                review: "Restaurant Revolution v3 increased our average order value by 28% and customer retention by 42% within the first quarter. The AI recommendations are incredibly accurate.",
                rating: 5
              },
              {
                name: "James Chen, Operations Manager",
                review: "The real-time analytics and PostgreSQL backend give us insights we never had before. We've reduced food waste by 30% and optimized our staffing.",
                rating: 5
              },
              {
                name: "David Thompson, Restaurant Group",
                review: "680% ROI in the first year! The AI-powered platform transformed our operations across all 6 locations. Customer satisfaction is at an all-time high.",
                rating: 5
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
    </main>
  );
};

export default HomePage;