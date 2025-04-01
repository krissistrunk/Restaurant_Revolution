import ReservationForm from "@/components/reservation/ReservationForm";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";

const ReservePage = () => {
  const { openCart, getItemCount } = useCart();
  const [location, navigate] = useLocation();

  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <h2 className="font-heading font-bold text-xl mb-6">Table Reservation</h2>
      
      <ReservationForm />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-heading font-semibold text-lg mb-4">Pre-Order Your Meal</h3>
        <p className="text-gray-600 mb-4">
          Want to save time? Pre-order your food now and it will be ready when you arrive.
        </p>
        {getItemCount() > 0 ? (
          <div className="flex flex-col space-y-4">
            <p className="text-sm font-medium">
              You have {getItemCount()} item{getItemCount() > 1 ? "s" : ""} in your cart.
            </p>
            <Button variant="outline" onClick={openCart}>
              Review Your Items
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => navigate("/menu")}>
            Add Pre-Order Items
          </Button>
        )}
      </div>
    </main>
  );
};

export default ReservePage;
