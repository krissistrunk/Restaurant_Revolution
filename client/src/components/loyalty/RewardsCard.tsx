import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Gift, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useLoyalty } from '@/hooks/useLoyalty';
import { motion } from 'framer-motion';

const RewardsCard = () => {
  const { user } = useAuth();
  const { awardPoints } = useLoyalty();
  const [isAwarding, setIsAwarding] = useState(false);
  
  const handleEarnPoints = () => {
    if (isAwarding || !user) return;
    
    setIsAwarding(true);
    
    // Award points (for demonstration purposes)
    const pointsToAward = Math.floor(Math.random() * 20) + 5; // 5-25 points
    awardPoints(pointsToAward, 'demo testing');
    
    // Reset button after a delay
    setTimeout(() => {
      setIsAwarding(false);
    }, 5000);
  };
  
  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Loyalty Rewards</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p>Please log in to view your rewards</p>
        </CardContent>
      </Card>
    );
  }
  
  // For demo purposes, let's say 100 points is a target for a free item
  const progressPercent = Math.min(100, Math.round((user.loyaltyPoints % 100) / 100 * 100));
  const nextRewardPoints = 100 - (user.loyaltyPoints % 100);
  
  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-700 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-6 w-6" />
            Loyalty Rewards
          </CardTitle>
          <motion.div 
            className="bg-amber-900/30 px-3 py-1 rounded-full flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="h-4 w-4 text-amber-200 mr-1" />
            <span className="text-amber-100 font-semibold">{user.loyaltyPoints} points</span>
          </motion.div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Progress to next reward</span>
            <span className="text-sm font-medium">{progressPercent}%</span>
          </div>
          <div className="relative">
            <Progress value={progressPercent} className="h-2" />
            <motion.div 
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-amber-300 to-amber-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500 text-right">
            {nextRewardPoints} points until next reward
          </div>
        </div>
        
        <div className="space-y-3">
          <motion.div 
            className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex justify-between items-center"
            whileHover={{ backgroundColor: "rgba(245, 245, 245, 1)", x: 5 }}
          >
            <div className="flex items-center">
              <div className="bg-amber-100 rounded-full p-2 mr-3">
                <Gift className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Free Appetizer</h4>
                <p className="text-xs text-gray-500">Available with 100 points</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              disabled={user.loyaltyPoints < 100}
            >
              Redeem
            </Button>
          </motion.div>
          
          <motion.div 
            className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex justify-between items-center"
            whileHover={{ backgroundColor: "rgba(245, 245, 245, 1)", x: 5 }}
          >
            <div className="flex items-center">
              <div className="bg-amber-100 rounded-full p-2 mr-3">
                <Gift className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm font-medium">25% Off Next Order</h4>
                <p className="text-xs text-gray-500">Available with 200 points</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              disabled={user.loyaltyPoints < 200}
            >
              Redeem
            </Button>
          </motion.div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t flex justify-center p-4">
        <Button 
          variant="default" 
          onClick={handleEarnPoints}
          disabled={isAwarding}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isAwarding ? 'Awarding Points...' : 'Demo: Earn Random Points'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RewardsCard;