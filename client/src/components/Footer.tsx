import { Link } from "wouter";
import { useRestaurant } from "@/hooks/useRestaurant";
import { 
  Crown, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";

export default function Footer() {
  const { restaurant } = useRestaurant();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-text-primary text-white">
      {/* Main Footer Content */}
      <div className="section-padding">
        <div className="section-container">
          <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {restaurant?.name || "Restaurant Revolution"}
                  </h3>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-3 w-3 text-secondary fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {restaurant?.description || "Premium restaurant management platform trusted by establishments worldwide."}
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: Facebook, href: "https://facebook.com/restaurantrevolution", label: "Facebook" },
                  { icon: Twitter, href: "https://twitter.com/restaurantrev", label: "Twitter" },
                  { icon: Instagram, href: "https://instagram.com/restaurantrevolution", label: "Instagram" },
                  { icon: Linkedin, href: "https://linkedin.com/company/restaurant-revolution", label: "LinkedIn" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-white/10 hover:bg-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Restaurant Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Restaurant</h4>
              <div className="space-y-3">
                {[
                  { label: "Our Menu", href: "/menu" },
                  { label: "Reservations", href: "/reserve" },
                  { label: "Order Online", href: "/order" },
                  { label: "Loyalty Rewards", href: "/rewards" },
                  { label: "AI Assistant", href: "/ai-assistant" },
                  { label: "About Us", href: "/info" }
                ].map((link, index) => (
                  <div key={index}>
                    <Link href={link.href}>
                      <a className="text-gray-300 hover:text-secondary transition-colors duration-300">
                        {link.label}
                      </a>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Services</h4>
              <div className="space-y-3">
                {[
                  { label: "Gift Cards", href: "/gift-cards" },
                  { label: "Catering", href: "/catering" },
                  { label: "Events", href: "/events" },
                  { label: "Nutrition Info", href: "/nutrition" },
                  { label: "Careers", href: "/careers" },
                  { label: "Press Kit", href: "/press" }
                ].map((link, index) => (
                  <div key={index}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-secondary transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Demo */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Platform Demo</h4>
              <div className="space-y-3">
                {[
                  { label: "Sales Overview", href: "/sales" },
                  { label: "Live Demo Files", href: "/demo", external: true },
                  { label: "Marketing Materials", href: "/marketing", external: true },
                  { label: "Documentation", href: "/docs", external: true }
                ].map((link, index) => (
                  <div key={index}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-secondary transition-colors duration-300 flex items-center gap-2 group"
                      >
                        {link.label}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <Link href={link.href}>
                        <a className="text-gray-300 hover:text-secondary transition-colors duration-300">
                          {link.label}
                        </a>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Contact</h4>
              <div className="space-y-4">
                {restaurant?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{restaurant.address}</span>
                  </div>
                )}
                {restaurant?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-secondary flex-shrink-0" />
                    <a 
                      href={`tel:${restaurant.phone}`}
                      className="text-gray-300 hover:text-secondary transition-colors"
                    >
                      {restaurant.phone}
                    </a>
                  </div>
                )}
                {restaurant?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-secondary flex-shrink-0" />
                    <a 
                      href={`mailto:${restaurant.email}`}
                      className="text-gray-300 hover:text-secondary transition-colors"
                    >
                      {restaurant.email}
                    </a>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div className="text-gray-300">
                    <div className="font-medium text-white mb-1">Hours</div>
                    <div className="text-sm space-y-1">
                      {restaurant?.openingHours ? (
                        Object.entries(restaurant.openingHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize">{day}:</span>
                            <span>{hours}</span>
                          </div>
                        ))
                      ) : (
                        <div>Mon-Sun: 11:00 AM - 10:00 PM</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="section-container">
          <div className="py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} {restaurant?.name || "RestaurantRush"}. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/privacy">
                <a className="text-gray-400 hover:text-secondary text-sm transition-colors">
                  Privacy Policy
                </a>
              </Link>
              <Link href="/terms">
                <a className="text-gray-400 hover:text-secondary text-sm transition-colors">
                  Terms of Service
                </a>
              </Link>
              <Link href="/support">
                <a className="text-gray-400 hover:text-secondary text-sm transition-colors">
                  Support
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}