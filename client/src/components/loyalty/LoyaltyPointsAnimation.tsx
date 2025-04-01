import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Award, Gift, Star, TrendingUp } from 'lucide-react';

interface LoyaltyPointsAnimationProps {
  pointsEarned: number;
  totalPoints: number;
  onAnimationComplete?: () => void;
}

const LoyaltyPointsAnimation = ({ 
  pointsEarned, 
  totalPoints,
  onAnimationComplete 
}: LoyaltyPointsAnimationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showTotal, setShowTotal] = useState(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Handle confetti animation
  useEffect(() => {
    if (confettiCanvasRef.current && isVisible) {
      const canvas = confettiCanvasRef.current;
      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
      });
      
      // Fire confetti
      const duration = 2000;
      const end = Date.now() + duration;
      
      const runConfetti = () => {
        myConfetti({
          particleCount: 2,
          startVelocity: 30,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#FF8C00'],
          disableForReducedMotion: true
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(runConfetti);
        }
      };
      
      runConfetti();
      
      // Clean up
      return () => {
        myConfetti.reset();
      };
    }
  }, [isVisible]);

  // Handle animation timing
  useEffect(() => {
    if (isVisible) {
      // Show total points after initial points earned animation
      const totalTimer = setTimeout(() => {
        setShowTotal(true);
      }, 1500);
      
      // Hide animation after completion
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        if (onAnimationComplete) onAnimationComplete();
      }, 4000);
      
      return () => {
        clearTimeout(totalTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isVisible, onAnimationComplete]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <canvas 
        ref={confettiCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      
      <div className="relative">
        <AnimatePresence>
          {/* Points earned animation */}
          <motion.div
            key="points-earned"
            className="text-center"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ 
              type: "spring", 
              damping: 12, 
              stiffness: 200 
            }}
          >
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Star className="h-16 w-16 text-yellow-400 drop-shadow-glow" />
              </motion.div>
            </div>
            
            <motion.h2 
              className="text-2xl font-bold text-white mb-1"
              animate={{ 
                color: ['#FFFFFF', '#FFD700', '#FFFFFF'] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              You Earned
            </motion.h2>
            
            <div className="relative">
              <motion.div
                className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  delay: 0.3,
                  duration: 0.8
                }}
              >
                +{pointsEarned} Points
              </motion.div>
              
              <motion.div 
                className="absolute inset-0 -z-10"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0.5, 0],
                  scale: [1, 1.5, 1.8]
                }}
                transition={{ 
                  delay: 0.3,
                  duration: 1,
                  repeat: 2
                }}
              >
                <div className="h-full w-full rounded-full bg-gradient-to-r from-yellow-300/20 to-amber-500/20 blur-xl" />
              </motion.div>
            </div>
          </motion.div>
          
          {/* Total points animation */}
          {showTotal && (
            <motion.div
              key="total-points"
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center space-x-2 mb-1">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-white">Your Current Balance</span>
              </div>
              
              <motion.div 
                className="text-3xl font-bold text-yellow-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {totalPoints} Points
              </motion.div>
              
              <motion.div
                className="mt-4 flex justify-center items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="px-4 py-2 bg-yellow-900/30 rounded-full flex items-center">
                  <Gift className="h-4 w-4 text-yellow-400 mr-2" />
                  <span className="text-sm text-yellow-100">Redeem rewards in the Loyalty tab</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoyaltyPointsAnimation;