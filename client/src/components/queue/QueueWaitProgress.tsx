import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Clock, Check, Hourglass } from 'lucide-react';
import { QueueEntry } from '@/types';

interface QueueWaitProgressProps {
  queueEntry: QueueEntry;
}

const QueueWaitProgress = ({ queueEntry }: QueueWaitProgressProps) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [percentComplete, setPercentComplete] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const progressControls = useAnimation();

  useEffect(() => {
    // Calculate time elapsed since joining the queue
    const calculateTime = () => {
      if (!queueEntry || !queueEntry.joinedAt) return;
      
      const joinedAt = new Date(queueEntry.joinedAt);
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - joinedAt.getTime()) / (1000 * 60)); // in minutes
      
      const estimatedWait = queueEntry.estimatedWaitTime || 30; // default to 30 mins if not provided
      const remaining = Math.max(0, estimatedWait - elapsed);
      const percent = Math.min(100, Math.round((elapsed / estimatedWait) * 100));
      
      setTimeElapsed(elapsed);
      setTimeRemaining(remaining);
      setPercentComplete(percent);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [queueEntry]);

  // Animate progress bar
  useEffect(() => {
    progressControls.start({
      width: `${percentComplete}%`,
      transition: { duration: 1, ease: "easeOut" }
    });
  }, [percentComplete, progressControls]);

  // Return different components based on status
  if (queueEntry.status === 'completed') {
    return (
      <div className="rounded-lg p-3 bg-green-50 border border-green-200">
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-700 font-medium">Table served</span>
        </div>
      </div>
    );
  }

  if (queueEntry.status === 'ready') {
    return (
      <div className="rounded-lg p-3 bg-blue-50 border border-blue-200">
        <motion.div 
          className="flex items-center" 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          >
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
          </motion.div>
          <span className="text-blue-700 font-medium">Your table is ready!</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-4 bg-white border border-gray-200 space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Hourglass className="h-5 w-5 text-amber-600 mr-2" strokeWidth={1.5} />
          <span className="font-medium">Wait Time Progress</span>
        </div>
        <span className="text-gray-500 text-sm">
          Est. wait: {queueEntry.estimatedWaitTime} min
        </span>
      </div>
      
      <div className="relative pt-1">
        <Progress value={percentComplete} className="h-3" />
        
        <motion.div
          className="absolute top-1 left-0 h-3 bg-gradient-to-r from-amber-300 to-amber-500 rounded-full"
          style={{ width: '0%' }}
          animate={progressControls}
        />
      </div>
      
      <div className="flex justify-between">
        <div className="text-xs text-gray-500">
          Position: #{queueEntry.position}
        </div>
        
        <motion.div 
          className="text-xs font-medium"
          animate={{
            color: percentComplete < 40 ? "#6B7280" : percentComplete < 70 ? "#92400E" : "#B45309"
          }}
        >
          {timeRemaining > 0 ? (
            <span>~{timeRemaining} min remaining</span>
          ) : (
            <span>Should be ready soon!</span>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default QueueWaitProgress;