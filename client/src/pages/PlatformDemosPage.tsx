import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, 
  ExternalLink, 
  Monitor, 
  Smartphone, 
  Brain, 
  Zap, 
  Database, 
  BarChart3,
  Settings,
  Users,
  Gift,
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
  Award,
  Eye,
  MousePointer,
  Wifi
} from 'lucide-react';

const PlatformDemosPage = () => {
  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="hero-section relative min-h-[70vh] bg-gradient-to-br from-primary via-primary-light to-secondary overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        
        <div className="section-container relative z-10 text-white">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Play className="h-4 w-4" />
              🎯 Interactive Platform Demos
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              See Restaurant Revolution
              <br />
              <span className="text-secondary">In Action</span>
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 max-w-2xl leading-relaxed opacity-90">
              Experience the complete Restaurant Revolution v3 platform through interactive demos that showcase AI intelligence, real-time operations, and proven ROI results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a href="/marketing/owner-demo/interactive-demo.html" target="_blank">
                <Button 
                  size="lg"
                  className="bg-secondary hover:bg-secondary-dark text-text-primary font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Monitor className="h-5 w-5 mr-2" />
                  Owner Dashboard Demo
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
              
              <a href="/marketing/customer-demo/interactive-demo.html" target="_blank">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold px-8 py-4 rounded-xl transition-all duration-300"
                >
                  <Smartphone className="h-5 w-5 mr-2" />
                  Customer App Demo
                </Button>
              </a>
            </div>

            {/* Demo Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Eye className="h-4 w-4" />
                <span>Live Interactive Demos</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <MousePointer className="h-4 w-4" />
                <span>Full Feature Access</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Wifi className="h-4 w-4" />
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Demos Section */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              🎮 Interactive Platform Demos
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Fully functional demonstrations that let you experience every feature of Restaurant Revolution v3.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Owner Demo Card */}
            <Card className="card-interactive group relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                  🏆 Most Popular
                </div>
              </div>
              
              <CardHeader className="pb-6">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Monitor className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-text-primary">Owner Dashboard Experience</CardTitle>
                <CardDescription className="text-lg">
                  Explore the complete restaurant management suite with AI analytics, real-time operations, and CMS control.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>AI Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Real-time Order Management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Smart Queue Control</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>CMS Management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>PostgreSQL Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Revenue Insights</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
                  <h4 className="font-semibold text-text-primary mb-2">Demo Highlights:</h4>
                  <ul className="text-sm text-text-muted space-y-1">
                    <li>• Interactive AI analytics with live data</li>
                    <li>• Simulated real-time order processing</li>
                    <li>• Dynamic queue management features</li>
                    <li>• Complete CMS interface walkthrough</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="/marketing/owner-demo/interactive-demo.html" target="_blank" className="flex-1">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary-dark">
                      <Play className="h-5 w-5 mr-2" />
                      Launch Owner Demo
                    </Button>
                  </a>
                  <Button variant="outline" size="lg">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Demo Card */}
            <Card className="card-interactive group relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                  📱 PWA Demo
                </div>
              </div>
              
              <CardHeader className="pb-6">
                <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-text-primary">Customer App Experience</CardTitle>
                <CardDescription className="text-lg">
                  Experience the complete customer journey with AI recommendations, PWA features, and seamless ordering.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>AI Menu Recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Progressive Web App</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Smart Queue Updates</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Loyalty Program</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Real-time Notifications</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Offline Functionality</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg p-4">
                  <h4 className="font-semibold text-text-primary mb-2">Demo Highlights:</h4>
                  <ul className="text-sm text-text-muted space-y-1">
                    <li>• 96.2% accurate AI recommendations</li>
                    <li>• PWA installation simulation</li>
                    <li>• Live queue position updates</li>
                    <li>• Interactive loyalty features</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="/marketing/customer-demo/interactive-demo.html" target="_blank" className="flex-1">
                    <Button size="lg" className="w-full bg-secondary hover:bg-secondary-dark">
                      <Smartphone className="h-5 w-5 mr-2" />
                      Launch Customer Demo
                    </Button>
                  </a>
                  <Button variant="outline" size="lg">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature-Specific Demos Section */}
      <section className="section-padding bg-background-alt">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              🎯 Feature-Specific Demonstrations
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Deep dive into specific Restaurant Revolution v3 capabilities with focused demonstrations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Brain className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <CardTitle className="text-lg">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  See how machine learning delivers 96.2% accurate menu suggestions.
                </CardDescription>
                <Button variant="outline" size="sm" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  View AI Demo
                </Button>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                  <Zap className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <CardTitle className="text-lg">Real-time Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Experience WebSocket-powered live updates and instant synchronization.
                </CardDescription>
                <Button variant="outline" size="sm" className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  View Real-time Demo
                </Button>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Database className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <CardTitle className="text-lg">PostgreSQL Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Explore enterprise-grade database analytics and reporting capabilities.
                </CardDescription>
                <Button variant="outline" size="sm" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics Demo
                </Button>
              </CardContent>
            </Card>

            <Card className="card-interactive group text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                  <Settings className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <CardTitle className="text-lg">CMS Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  See how Strapi v4 integration provides complete content control.
                </CardDescription>
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  View CMS Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Performance Metrics */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              📊 Demo Performance Metrics
            </h2>
            <p className="text-lg text-text-muted">
              Real results from restaurants using Restaurant Revolution v3
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">680%</div>
              <div className="text-text-muted">Average Annual ROI</div>
              <div className="text-sm text-green-600 mt-1">
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Proven Results
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">96.2%</div>
              <div className="text-text-muted">AI Recommendation Accuracy</div>
              <div className="text-sm text-green-600 mt-1">
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Industry Leading
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">58%</div>
              <div className="text-text-muted">Wait Time Reduction</div>
              <div className="text-sm text-green-600 mt-1">
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Customer Satisfaction
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">500+</div>
              <div className="text-text-muted">Restaurants Served</div>
              <div className="text-sm text-green-600 mt-1">
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Growing Fast
              </div>
            </div>
          </div>

          <div className="text-center">
            <Card className="inline-block max-w-2xl">
              <CardContent className="pt-6">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-text-primary mb-4">
                  Ready to See Your Restaurant's Potential?
                </h3>
                <p className="text-text-muted mb-6">
                  Schedule a personalized demo with your restaurant's data and see exactly how Restaurant Revolution v3 can transform your operations.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="bg-primary hover:bg-primary-dark">
                    <Monitor className="h-5 w-5 mr-2" />
                    Schedule Personal Demo
                  </Button>
                  <Button variant="outline" size="lg">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Start Free Trial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section-padding bg-gradient-to-br from-primary via-primary-light to-secondary">
        <div className="section-container text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Experience Restaurant Revolution v3 Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            These interactive demos show just a fraction of what's possible. Start your free trial and discover how AI can transform your restaurant.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/marketing/owner-demo/interactive-demo.html" target="_blank">
              <Button 
                size="lg"
                className="bg-secondary hover:bg-secondary-dark text-text-primary font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Play className="h-5 w-5 mr-2" />
                Try Full Demo Now
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

export default PlatformDemosPage;