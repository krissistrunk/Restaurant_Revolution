import { useState } from "react";
import FeaturedItems from "@/components/menu/FeaturedItems";
import MenuCategories from "@/components/menu/MenuCategories";
import MenuItems from "@/components/menu/MenuItems";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ExternalLink, 
  Play, 
  FileText, 
  Users, 
  BarChart3, 
  Crown, 
  Star, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap
} from "lucide-react";

const MenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  return (
    <main className="flex-grow">
      {/* Platform Demo Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-3">
        <div className="section-container">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Crown className="h-4 w-4" />
            <span>Restaurant Revolution Platform Demo</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Experience the full restaurant management system</span>
            <a href="/" className="ml-4 underline hover:no-underline">
              View Live Storefront →
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative section-padding bg-gradient-to-br from-background via-background-alt to-white overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,<svg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><g fill='%23D4AF37' fill-opacity='0.05'><circle cx='30' cy='30' r='2'/></g></svg>")`
        }}></div>
        
        <div className="section-container relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Premium Restaurant Management Platform
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-text-primary mb-6 animate-slide-up">
              Transform Your 
              <span className="text-gradient"> Restaurant</span>
              <br />
              Experience
            </h1>
            
            <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in">
              Streamline operations, delight customers, and boost revenue with our comprehensive 
              restaurant management system trusted by premium establishments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up">
              <Button 
                size="lg"
                className="gradient-primary text-white font-semibold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById('demos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="h-5 w-5 mr-2" />
                Explore Live Demos
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300"
                onClick={() => window.open('/marketing-materials.html', '_blank')}
              >
                <FileText className="h-5 w-5 mr-2" />
                View Documentation
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in">
              {[
                { label: "Revenue Increase", value: "25%", icon: BarChart3 },
                { label: "Customer Retention", value: "40%", icon: Users },
                { label: "Order Efficiency", value: "60%", icon: Zap },
                { label: "Client Satisfaction", value: "98%", icon: Star }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                  <div className="text-sm text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demos Section */}
      <section id="demos" className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Experience the Platform
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Explore our interactive demonstrations showcasing the complete restaurant management ecosystem.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Owner Demo */}
            <Card className="card-interactive group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 gradient-primary rounded-bl-3xl flex items-center justify-center">
                <Crown className="h-8 w-8 text-white" />
              </div>
              
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-primary text-2xl">
                  <BarChart3 className="h-6 w-6" />
                  Restaurant Owner Dashboard
                </CardTitle>
                <CardDescription className="text-base text-text-muted leading-relaxed">
                  Comprehensive management interface for restaurant operations, analytics, and customer insights.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "Order Management", 
                    "Real-time Analytics", 
                    "Reservation System", 
                    "Staff Coordination"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-status-success" />
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => window.open('/owner-demo.html', '_blank')}
                  className="w-full gradient-primary text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 mt-6"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Launch Owner Demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Customer Demo */}
            <Card className="card-interactive group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 gradient-secondary rounded-bl-3xl flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-secondary text-2xl">
                  <Users className="h-6 w-6" />
                  Customer Experience Portal
                </CardTitle>
                <CardDescription className="text-base text-text-muted leading-relaxed">
                  Mobile-optimized interface for seamless dining experiences, from ordering to loyalty rewards.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "Menu Browsing", 
                    "Order Placement", 
                    "Loyalty Rewards", 
                    "Queue Management"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-status-success" />
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => window.open('/customer-demo.html', '_blank')}
                  className="w-full bg-secondary hover:bg-secondary-dark text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 mt-6"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Launch Customer Demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Marketing Resources Section */}
      <section className="section-padding bg-background-alt">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Complete Marketing Package
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Professional sales materials, implementation guides, and comprehensive documentation.
            </p>
          </div>
          
          <Card className="card-elevated max-w-4xl mx-auto">
            <CardHeader className="text-center pb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 gradient-elegant rounded-2xl mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl text-text-primary mb-4">
                Everything You Need to Succeed
              </CardTitle>
              <CardDescription className="text-lg text-text-muted">
                Comprehensive marketing materials and implementation resources for your sales team.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "Sales Presentations", desc: "Professional slide decks with ROI calculations" },
                  { title: "Implementation Guides", desc: "Step-by-step setup and training materials" },
                  { title: "Customer Documentation", desc: "User guides and support resources" }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <h4 className="font-semibold text-text-primary mb-2">{item.title}</h4>
                    <p className="text-text-muted text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => window.open('/marketing-materials.html', '_blank')}
                  size="lg"
                  className="gradient-elegant text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Access Marketing Package
                  <ExternalLink className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Menu Sections */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <FeaturedItems />
          <MenuCategories
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <MenuItems selectedCategory={selectedCategory} />
        </div>
      </section>
    </main>
  );
};

export default MenuPage;
