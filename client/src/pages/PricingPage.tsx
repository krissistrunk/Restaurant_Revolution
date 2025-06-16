import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Check, 
  Star, 
  Calculator,
  TrendingUp,
  Users,
  BarChart3,
  Shield,
  Clock,
  Zap,
  Brain,
  Award,
  ArrowRight,
  Play,
  ExternalLink,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [restaurantSize, setRestaurantSize] = useState('medium');
  const [monthlyRevenue, setMonthlyRevenue] = useState(50000);

  // ROI Calculator Logic
  const calculateROI = () => {
    const baseROI = 6.8; // 680% average ROI
    const monthlyIncrease = monthlyRevenue * (baseROI / 12);
    const annualIncrease = monthlyIncrease * 12;
    const planCost = isAnnual ? 2988 : 3588; // Annual vs monthly pricing
    const netBenefit = annualIncrease - planCost;
    const roiPercentage = ((netBenefit / planCost) * 100).toFixed(0);
    
    return {
      monthlyIncrease: Math.round(monthlyIncrease),
      annualIncrease: Math.round(annualIncrease),
      netBenefit: Math.round(netBenefit),
      roiPercentage
    };
  };

  const roi = calculateROI();

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small restaurants getting started with AI",
      monthlyPrice: 199,
      annualPrice: 1990,
      popular: false,
      features: [
        "AI Menu Recommendations",
        "Basic Analytics Dashboard",
        "Order Management System",
        "Customer Queue Management",
        "Mobile App (iOS & Android)",
        "Email Support",
        "Up to 100 orders/day",
        "2 staff accounts"
      ],
      limitations: [
        "Limited customization",
        "Standard integrations only"
      ]
    },
    {
      name: "Professional",
      description: "Complete Restaurant Revolution v3 experience",
      monthlyPrice: 299,
      annualPrice: 2988,
      popular: true,
      features: [
        "Everything in Starter",
        "Advanced AI Analytics (96.2% accuracy)",
        "Real-time Operations Dashboard",
        "Complete CMS with Strapi v4",
        "Loyalty Program Management",
        "PWA with Offline Capabilities",
        "Predictive Inventory Management", 
        "Custom Branding & Themes",
        "PostgreSQL Enterprise Database",
        "WebSocket Real-time Updates",
        "Priority Phone & Chat Support",
        "Unlimited orders & staff accounts",
        "Third-party Integrations",
        "Custom Reporting"
      ],
      limitations: []
    },
    {
      name: "Enterprise",
      description: "Multi-location restaurants with advanced needs",
      monthlyPrice: 599,
      annualPrice: 5988,
      popular: false,
      features: [
        "Everything in Professional",
        "Multi-location Management",
        "Advanced Role-based Permissions",
        "White-label Solutions",
        "Custom AI Model Training",
        "Dedicated Account Manager",
        "24/7 Priority Support",
        "Custom Integrations",
        "Advanced Security & Compliance",
        "Data Export & Analytics API",
        "Custom Development Hours",
        "Training & Onboarding"
      ],
      limitations: []
    }
  ];

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="hero-section relative min-h-[60vh] bg-gradient-to-br from-primary via-primary-light to-secondary overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        
        <div className="section-container relative z-10 text-white text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <TrendingUp className="h-4 w-4" />
            💰 680% Average ROI Guarantee
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Transform Your Restaurant
            <br />
            <span className="text-secondary">Starting Today</span>
          </h1>
          
          <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
            Join 500+ successful restaurants using Restaurant Revolution v3. Choose the plan that fits your needs and start seeing results immediately.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-lg ${!isAnnual ? 'text-white' : 'text-white/60'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                isAnnual ? 'bg-secondary' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  isAnnual ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${isAnnual ? 'text-white' : 'text-white/60'}`}>
              Annual 
              <span className="text-secondary font-semibold ml-1">(Save 17%)</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative ${
                  plan.popular 
                    ? 'ring-2 ring-primary shadow-2xl scale-105' 
                    : 'shadow-lg hover:shadow-xl transition-shadow'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-text-primary">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold text-text-primary">
                        ${isAnnual ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice}
                      </span>
                      <span className="text-text-muted">/month</span>
                    </div>
                    {isAnnual && (
                      <div className="text-sm text-green-600 mt-1">
                        ${plan.annualPrice} billed annually
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-text-muted">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    size="lg" 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary-dark' 
                        : 'bg-secondary hover:bg-secondary-dark'
                    }`}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  <div className="text-center text-xs text-text-muted">
                    30-day money-back guarantee
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="section-padding bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                📊 Calculate Your ROI
              </h2>
              <p className="text-xl text-text-muted">
                See exactly how Restaurant Revolution v3 will impact your bottom line
              </p>
            </div>

            <Card className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Your Restaurant Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Monthly Revenue
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">$</span>
                      <input
                        type="range"
                        min="10000"
                        max="200000"
                        step="5000"
                        value={monthlyRevenue}
                        onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-lg font-semibold text-primary min-w-[80px]">
                        ${monthlyRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Restaurant Size
                    </label>
                    <select 
                      value={restaurantSize}
                      onChange={(e) => setRestaurantSize(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="small">Small (1-2 locations)</option>
                      <option value="medium">Medium (3-5 locations)</option>
                      <option value="large">Large (6+ locations)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                    <Calculator className="h-6 w-6" />
                    Your ROI Projection
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Monthly Revenue Increase</span>
                      <span className="text-xl font-bold text-green-600">
                        +${roi.monthlyIncrease.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Annual Revenue Increase</span>
                      <span className="text-2xl font-bold text-green-600">
                        +${roi.annualIncrease.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Platform Investment</span>
                      <span className="text-lg font-semibold text-text-primary">
                        ${isAnnual ? '2,988' : '3,588'}/year
                      </span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex justify-between items-center">
                      <span className="text-text-primary font-semibold">Net Annual Benefit</span>
                      <span className="text-3xl font-bold text-primary">
                        ${roi.netBenefit.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-center bg-primary/20 rounded-lg p-4">
                      <div className="text-4xl font-bold text-primary">{roi.roiPercentage}%</div>
                      <div className="text-sm text-text-muted">Annual ROI</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories & Social Proof */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              🏆 Proven Results from Real Restaurants
            </h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 text-secondary fill-current" />
              ))}
              <span className="text-lg font-semibold text-text-primary ml-2">4.9/5</span>
              <span className="text-text-muted ml-2">from 500+ restaurants</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: "Maria's Bistro",
                location: "San Francisco, CA",
                result: "847% ROI in 8 months",
                quote: "Restaurant Revolution v3 transformed our operations completely. The AI recommendations increased our average order value by 32%, and the real-time analytics helped us optimize our menu pricing.",
                revenue: "From $45K to $78K monthly"
              },
              {
                name: "Downtown Grill",
                location: "Austin, TX", 
                result: "623% ROI in 6 months",
                quote: "The queue management system reduced our wait times by 58%. Customers love the mobile app, and our staff efficiency improved dramatically with the real-time dashboard.",
                revenue: "From $62K to $95K monthly"
              },
              {
                name: "Coastal Kitchen",
                location: "Miami, FL",
                result: "712% ROI in 10 months", 
                quote: "The CMS integration made managing our multi-location brand effortless. We can update menus across all locations instantly, and the loyalty program boosted repeat customers by 45%.",
                revenue: "From $38K to $67K monthly"
              }
            ].map((story, index) => (
              <Card key={index} className="card-elevated">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-text-primary">{story.name}</CardTitle>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{story.result}</div>
                      <div className="text-xs text-text-muted">{story.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-secondary fill-current" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed italic mb-4">
                    "{story.quote}"
                  </CardDescription>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm font-semibold text-green-800">{story.revenue}</div>
                    <div className="text-xs text-green-600">Revenue Growth</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-text-primary mb-6">Trusted by Industry Leaders</h3>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="text-lg font-semibold">🏢 Enterprise Security</div>
              <div className="text-lg font-semibold">🔒 SOC 2 Compliant</div>
              <div className="text-lg font-semibold">📊 PostgreSQL Powered</div>
              <div className="text-lg font-semibold">☁️ 99.9% Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-background-alt">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                ❓ Frequently Asked Questions
              </h2>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  question: "How quickly will I see results?",
                  answer: "Most restaurants see measurable improvements within the first 30 days. The AI recommendations start working immediately, and you'll notice increased order values and customer satisfaction right away."
                },
                {
                  question: "Is there a setup fee or long-term contract?",
                  answer: "No setup fees and no long-term contracts required. You can start with a monthly plan and upgrade or cancel anytime. We're confident you'll love the results."
                },
                {
                  question: "How does the 680% ROI guarantee work?",
                  answer: "Our 680% ROI represents the average annual return our customers achieve. If you don't see significant improvement in 90 days, we'll work with you to optimize your setup or provide a full refund."
                },
                {
                  question: "Can I integrate with my existing POS system?",
                  answer: "Yes! Restaurant Revolution v3 integrates with most major POS systems including Square, Toast, Clover, and more. Our team will help you set up the integration during onboarding."
                },
                {
                  question: "What kind of support do you provide?",
                  answer: "All plans include comprehensive support. Professional and Enterprise plans get priority support with phone and chat access. We also provide training, onboarding, and ongoing optimization consultations."
                }
              ].map((faq, index) => (
                <Card key={index} className="card-interactive">
                  <CardHeader>
                    <CardTitle className="text-lg text-text-primary">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {faq.answer}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section-padding bg-gradient-to-br from-primary via-primary-light to-secondary">
        <div className="section-container text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Revolution Your Restaurant?
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
              <Sparkles className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
          </div>

          <div className="mt-8 text-sm opacity-75">
            30-day money-back guarantee • No setup fees • Cancel anytime
          </div>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;