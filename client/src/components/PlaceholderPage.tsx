import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction } from 'lucide-react';
import { Link } from 'wouter';

interface PlaceholderPageProps {
  title: string;
  description: string;
  comingSoonMessage?: string;
  icon?: React.ComponentType<{ className?: string }>;
  contactInfo?: boolean;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  comingSoonMessage = "This page is currently under development. Check back soon for updates!",
  icon: Icon = Construction,
  contactInfo = true
}) => {
  return (
    <main className="flex-grow">
      <div className="section-padding bg-background-alt">
        <div className="section-container max-w-4xl">
          <div className="text-center mb-8">
            <Link href="/">
              <Button variant="outline" className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center">
                <Icon className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-text-primary mb-4">{title}</h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">{description}</p>
          </div>

          <Card className="card-elevated text-center mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Construction className="h-5 w-5 text-primary" />
                Coming Soon
              </CardTitle>
              <CardDescription className="text-lg">
                {comingSoonMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {contactInfo && (
                <div className="space-y-4">
                  <p className="text-text-muted">
                    Have questions or need immediate assistance? We're here to help!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/info">
                      <Button variant="outline">
                        Contact Us
                      </Button>
                    </Link>
                    <Button className="bg-primary text-white">
                      Call (555) 123-4567
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="text-lg">Our Menu</CardTitle>
                <CardDescription>
                  Explore our current offerings and seasonal specialties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/menu">
                  <Button variant="outline" className="w-full">
                    View Menu
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="text-lg">Make a Reservation</CardTitle>
                <CardDescription>
                  Book your table for an exceptional dining experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/reserve">
                  <Button variant="outline" className="w-full">
                    Reserve Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="text-lg">Order Online</CardTitle>
                <CardDescription>
                  Enjoy our cuisine from the comfort of your home
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/order">
                  <Button variant="outline" className="w-full">
                    Order Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PlaceholderPage;