import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/types';
import { cn } from '@/lib/utils';

interface WelcomeAnimationProps {
  user: User;
  onComplete?: () => void;
  className?: string;
}

export const WelcomeAnimation = ({ user, onComplete, className }: WelcomeAnimationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Automatically hide the animation after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // If the animation is triggered again with a different user, reset visibility
  useEffect(() => {
    setIsVisible(true);
  }, [user.id]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "fixed inset-0 flex flex-col items-center justify-center bg-black/80 z-50",
            className
          )}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-4"
          >
            <svg 
              className="w-24 h-24 text-white mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-heading text-white mb-2">Welcome back, {user.name}!</h2>
            <p className="text-xl text-gray-200">
              You have {user.loyaltyPoints} loyalty points
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeAnimation;