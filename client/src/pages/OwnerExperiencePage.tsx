import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Brain, 
  Zap, 
  Database, 
  Settings, 
  Users, 
  TrendingUp,
  Clock,
  Target,
  Shield,
  Smartphone,
  Globe,
  ArrowRight,
  Play,
  ExternalLink,
  CheckCircle,
  Lightbulb,
  PieChart
} from 'lucide-react';

const OwnerExperiencePage = () => {
  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="hero-section relative min-h-[70vh] bg-gradient-to-br from-primary via-primary-light to-secondary overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        
        <div className="section-container relative z-10 text-white">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Brain className="h-4 w-4" />
              🤖 AI-Powered Restaurant Management
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Your Restaurant
              <br />
              <span className="text-secondary">Command Center</span>
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 max-w-2xl leading-relaxed opacity-90">
              Restaurant Revolution v3 gives you AI-powered insights, real-time operations control, and comprehensive management tools that deliver 680% average ROI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a href="/marketing/owner-demo/interactive-demo.html" target="_blank">
                <Button 
                  size="lg"
                  className="bg-secondary hover:bg-secondary-dark text-text-primary font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2" />
                  See Live Dashboard Demo
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold px-8 py-4 rounded-xl transition-all duration-300"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Start Free Trial
              </Button>
            </div>

            {/* Key Benefits */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <TrendingUp className="h-4 w-4" />
                <span>680% Average ROI</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Brain className="h-4 w-4" />
                <span>96.2% AI Accuracy</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Zap className="h-4 w-4" />
                <span>Real-time Operations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              🤖 AI-Powered Intelligence
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Advanced machine learning algorithms that optimize your restaurant's performance automatically.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-text-primary">Smart Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  AI analyzes customer behavior to provide 96.2% accurate menu recommendations, increasing average order value by 28%.
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    +28% Average Order Value
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    96.2% Recommendation Accuracy
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-text-primary">Predictive Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Forecast demand, optimize inventory, and predict peak times with machine learning models trained on your restaurant data.
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    -30% Food Waste Reduction
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    95% Demand Forecast Accuracy
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 gradient-elegant rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-text-primary">Customer Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Deep insights into customer preferences, dining patterns, and lifetime value to drive targeted marketing campaigns.
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    +42% Customer Retention
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    +67% Customer Lifetime Value
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Real-time Operations Section */}
      <section className="section-padding bg-background-alt">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              ⚡ Real-time Operations Dashboard
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Live monitoring and control of your entire restaurant operation with WebSocket-powered real-time updates.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Card className="card-interactive">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Live Order Tracking</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Monitor every order in real-time from placement to completion with automated status updates and kitchen notifications.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="card-interactive">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-secondary" />
                    </div>
                    <CardTitle>Smart Queue Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    AI-powered wait time predictions with 94.7% accuracy, reducing customer wait times by 58% through intelligent optimization.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="card-interactive">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>PostgreSQL Analytics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Enterprise-grade database processing 15,000+ data points in real-time with 99.8% accuracy and complete audit trails.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
                <div className="mb-6">
                  <PieChart className="h-24 w-24 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Live Demo Available</h3>
                  <p className="text-text-muted">
                    Experience the full owner dashboard with real-time data and interactive features.
                  </p>
                </div>
                
                <a href="/marketing/owner-demo/interactive-demo.html" target="_blank">
                  <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
                    <Play className="h-5 w-5 mr-2" />
                    Try Interactive Demo
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CMS & Content Management Section */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              🎛️ Complete Content Management System
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Powerful CMS integration with Strapi v4 gives you complete control over your restaurant's digital presence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Settings className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <CardTitle className="text-lg">Menu Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Update menu items, prices, and descriptions in real-time with automatic sync across all platforms.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                  <Smartphone className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <CardTitle className="text-lg">Brand Customization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete white-label customization with your branding, colors, and restaurant personality.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Globe className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <CardTitle className="text-lg">Multi-Channel Publishing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Update once, publish everywhere - website, mobile app, digital displays, and third-party platforms.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                  <Shield className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <CardTitle className="text-lg">Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Granular permissions for staff with secure access controls and audit trails for all changes.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI & Success Metrics Section */}
      <section className="section-padding bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              📈 Proven ROI Results
            </h2>
            <p className="text-lg text-text-muted">
              Restaurant Revolution v3 delivers measurable results that transform your bottom line.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">680%</div>
              <div className="text-text-muted">Average Annual ROI</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">42%</div>
              <div className="text-text-muted">Customer Retention Increase</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">28%</div>
              <div className="text-text-muted">Order Value Growth</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">94%</div>
              <div className="text-text-muted">Operational Efficiency Gain</div>
            </div>
          </div>

          <div className="text-center">
            <Card className="inline-block max-w-2xl">
              <CardContent className="pt-6">
                <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-text-primary mb-4">
                  Calculate Your Potential ROI
                </h3>
                <p className="text-text-muted mb-6">
                  See how Restaurant Revolution v3 can transform your restaurant's profitability with our interactive ROI calculator.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary-dark">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Calculate My ROI
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section-padding bg-gradient-to-br from-primary via-primary-light to-secondary">
        <div className="section-container text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join 500+ successful restaurants using Restaurant Revolution v3. Start your free trial today and see the difference AI can make.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/marketing/owner-demo/interactive-demo.html" target="_blank">
              <Button 
                size="lg"
                className="bg-secondary hover:bg-secondary-dark text-text-primary font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Live Demo
              </Button>
            </a>
            
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold px-8 py-4 rounded-xl transition-all duration-300"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default OwnerExperiencePage;