import { useQuery } from "@tanstack/react-query";
import { LoyaltyReward } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import RewardsCard from "@/components/loyalty/RewardsCard";

const RewardsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();

  const { data: rewards, isLoading } = useQuery<LoyaltyReward[]>({
    queryKey: ["/api/loyalty-rewards"],
  });

  if (!isAuthenticated) {
    return (
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="font-heading font-bold text-xl mb-4">Loyalty Rewards</h2>
          <p className="mb-4">Please log in to view and redeem rewards</p>
          <Button onClick={() => navigate("/login")}>Log In</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <h2 className="font-heading font-bold text-xl mb-6">Loyalty Rewards</h2>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-lg">Your Points</h3>
              <p className="text-gray-600">Earn 1 point for every $1 spent</p>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-accent"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-heading font-bold text-2xl">
                {user?.loyaltyPoints || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <h3 className="font-heading font-semibold text-lg mb-4">Available Rewards</h3>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      ) : !rewards || rewards.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <p className="text-gray-500">No rewards available at the moment</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <RewardsCard key={reward.id} reward={reward} />
          ))}
        </div>
      )}
    </main>
  );
};

export default RewardsPage;
