import { useQuery } from "@tanstack/react-query";
import { LoyaltyReward } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import RewardsCard from "@/components/loyalty/RewardsCard";
import { useLoyalty } from "@/hooks/useLoyalty";

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
      
      {/* New RewardsCard component */}
      <RewardsCard />
      
      {/* Show available rewards from the API */}
      {rewards && rewards.length > 0 && (
        <div className="mt-8">
          <h3 className="font-heading font-semibold text-lg mb-4">More Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium mb-1">{reward.name}</h4>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-amber-700">
                        {reward.pointsRequired} points
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        disabled={!user || user.loyaltyPoints < reward.pointsRequired}
                      >
                        Redeem
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default RewardsPage;
