import { useState } from "react";
import FeaturedItems from "@/components/menu/FeaturedItems";
import MenuCategories from "@/components/menu/MenuCategories";
import MenuItems from "@/components/menu/MenuItems";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Clock, MapPin, Phone, Star } from "lucide-react";

const MenuBrowsePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { restaurant } = useRestaurant();

  return (
    <main className="flex-grow">
      {/* Menu Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background-alt to-white overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,<svg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><g fill='%23D4AF37' fill-opacity='0.05'><circle cx='30' cy='30' r='2'/></g></svg>")`
        }}></div>
        
        <div className="section-container relative">
          <div className="text-center max-w-4xl mx-auto py-16">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in">
              <Star className="h-4 w-4 fill-current" />
              Our Menu
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-text-primary mb-6 animate-slide-up">
              Discover Our
              <span className="text-gradient"> Culinary</span>
              <br />
              Creations
            </h1>
            
            <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in">
              From fresh appetizers to exquisite entrees, our menu features locally-sourced ingredients 
              crafted into unforgettable dining experiences.
            </p>

            {/* Restaurant Info Bar */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-text-muted mb-8">
              {restaurant?.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{restaurant.address}</span>
                </div>
              )}
              {restaurant?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{restaurant.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Open Today: 11:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Content */}
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

      {/* Call to Action Section */}
      <section className="section-padding bg-background-alt">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Ready to Order?
            </h2>
            <p className="text-lg text-text-muted mb-8">
              Place your order online for pickup or delivery, or make a reservation to dine with us.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Order Online
              </button>
              <button className="btn-secondary px-8 py-4 rounded-xl font-semibold text-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300">
                Make Reservation
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default MenuBrowsePage;