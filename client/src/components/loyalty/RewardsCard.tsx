import { useState } from "react";
import { LoyaltyReward } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface RewardsCardProps {
  reward: LoyaltyReward;
}

const RewardsCard = ({ reward }: RewardsCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You must be logged in to redeem rewards",
        variant: "destructive",
      });
      return;
    }

    if (user.loyaltyPoints < reward.pointsRequired) {
      toast({
        title: "Not enough points",
        description: `You need ${reward.pointsRequired - user.loyaltyPoints} more points to redeem this reward`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRedeeming(true);
      await apiRequest("POST", "/api/redeem-reward", {
        userId: user.id,
        rewardId: reward.id,
      });

      toast({
        title: "Reward redeemed!",
        description: `You successfully redeemed ${reward.name}`,
      });

      // Update user data to reflect new points balance
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast({
        title: "Failed to redeem reward",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const canRedeem = user && user.loyaltyPoints >= reward.pointsRequired;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{reward.name}</CardTitle>
        <CardDescription>{reward.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-accent"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-medium">{reward.pointsRequired} points required</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRedeem}
          disabled={!canRedeem || isRedeeming}
          className="w-full"
        >
          {isRedeeming
            ? "Redeeming..."
            : canRedeem
            ? "Redeem Reward"
            : `Need ${reward.pointsRequired - (user?.loyaltyPoints || 0)} more points`}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RewardsCard;
