import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { QueueEntry } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import QueueWaitProgress from './QueueWaitProgress';

const QueueStatusCard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showButtons, setShowButtons] = useState(true);
  
  const { data: queueEntry, isLoading } = useQuery<QueueEntry | null>({
    queryKey: ['/api/user-queue-entry', user?.id.toString()],
    enabled: !!user,
  });
  
  const leaveQueueMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/queue-entries/${id}`, { 
        status: 'cancelled' 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-queue-entry'] });
    },
  });
  
  // Temporarily hide action buttons after certain actions
  useEffect(() => {
    if (leaveQueueMutation.isPending) {
      setShowButtons(false);
    } else {
      const timer = setTimeout(() => setShowButtons(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [leaveQueueMutation.isPending]);
  
  const handleLeaveQueue = () => {
    if (queueEntry) {
      leaveQueueMutation.mutate(queueEntry.id);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto animate-pulse">
        <CardHeader>
          <div className="h-5 bg-gray-300 rounded w-2/5 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-200 rounded-lg w-full"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (!queueEntry || queueEntry.status === 'cancelled') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Not in Queue</CardTitle>
          <CardDescription>
            You're not currently waiting in the virtual queue.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const getStatusBadge = () => {
    switch (queueEntry.status) {
      case 'waiting':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Waiting</Badge>;
      case 'ready':
        return (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Badge variant="default" className="bg-blue-600">Ready</Badge>
          </motion.div>
        );
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Queue Status</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Party of {queueEntry.partySize} • Joined {new Date(queueEntry.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <QueueWaitProgress queueEntry={queueEntry} />
        
        {queueEntry.status === 'ready' && (
          <motion.div 
            className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Clock className="text-blue-600 mr-2 h-5 w-5" />
            <span className="text-blue-800 text-sm">
              Please check in with the host within 10 minutes or you may lose your spot.
            </span>
          </motion.div>
        )}
        
        {queueEntry.notes && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start">
            <AlertCircle className="text-gray-500 mr-2 h-4 w-4 mt-0.5" />
            <span className="text-gray-600 text-sm">{queueEntry.notes}</span>
          </div>
        )}
      </CardContent>
      
      {showButtons && queueEntry.status !== 'completed' && (
        <CardFooter className="border-t pt-4 flex justify-between">
          {queueEntry.status === 'waiting' && (
            <Button 
              variant="destructive" 
              onClick={handleLeaveQueue}
              disabled={leaveQueueMutation.isPending}
              className="w-full"
            >
              {leaveQueueMutation.isPending ? 'Leaving Queue...' : 'Leave Queue'}
            </Button>
          )}
          
          {queueEntry.status === 'ready' && (
            <Button 
              variant="default" 
              onClick={() => leaveQueueMutation.mutate(queueEntry.id)}
              disabled={leaveQueueMutation.isPending}
              className="w-full"
            >
              Mark as Seated
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default QueueStatusCard;