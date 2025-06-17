import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, Phone, MapPin, Calendar, AlertCircle } from "lucide-react";

interface QueueEntry {
  id: number;
  userId: number;
  partySize: number;
  position: number;
  estimatedWaitTime: number;
  actualWaitTime?: number;
  joinedAt: string;
  phone?: string;
  note?: string;
  seatingPreference?: string;
  specialRequests?: string;
  status: 'waiting' | 'called' | 'seated' | 'cancelled';
  smsNotifications: boolean;
  user?: {
    name: string;
    email: string;
  };
}

const WaitlistManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [waitlist, setWaitlist] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageTableTurnover, setAverageTableTurnover] = useState(25);

  useEffect(() => {
    if (user?.restaurantId) {
      fetchWaitlist();
    }
  }, [user]);

  const fetchWaitlist = async () => {
    try {
      const response = await fetch('/api/queue-entries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWaitlist(data.filter((entry: QueueEntry) => entry.status === 'waiting'));
      }
    } catch (error) {
      console.error('Failed to fetch waitlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const callCustomer = async (entryId: number) => {
    try {
      const response = await fetch(`/api/waitlist/${entryId}/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Customer Called",
          description: "SMS notification sent to customer",
        });
        fetchWaitlist();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to call customer",
        variant: "destructive"
      });
    }
  };

  const seatCustomer = async (entryId: number, tableSection?: string) => {
    try {
      const response = await fetch(`/api/waitlist/${entryId}/seat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tableSection })
      });

      if (response.ok) {
        toast({
          title: "Customer Seated",
          description: "Visit recorded and waitlist updated",
        });
        fetchWaitlist();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seat customer",
        variant: "destructive"
      });
    }
  };

  const cancelEntry = async (entryId: number) => {
    try {
      const response = await fetch(`/api/waitlist/${entryId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Entry Cancelled",
          description: "Waitlist updated",
        });
        fetchWaitlist();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel entry",
        variant: "destructive"
      });
    }
  };

  const updateWaitTimes = async () => {
    try {
      const response = await fetch(`/api/waitlist/${user?.restaurantId}/update-times`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ averageTableTurnover })
      });

      if (response.ok) {
        toast({
          title: "Wait Times Updated",
          description: "All customers will receive updated estimates",
        });
        fetchWaitlist();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wait times",
        variant: "destructive"
      });
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'called': return 'bg-blue-100 text-blue-800';
      case 'seated': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading waitlist...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Waitlist Management</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="turnover">Avg Table Turnover (min):</Label>
            <Input
              id="turnover"
              type="number"
              value={averageTableTurnover}
              onChange={(e) => setAverageTableTurnover(parseInt(e.target.value))}
              className="w-20"
              min="5"
              max="120"
            />
            <Button onClick={updateWaitTimes} size="sm">
              Update Times
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Current Waitlist ({waitlist.length} parties)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {waitlist.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No customers currently waiting</p>
            ) : (
              <div className="space-y-4">
                {waitlist.map((entry) => (
                  <Card key={entry.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-lg font-bold">
                              #{entry.position}
                            </Badge>
                            <span className="font-semibold">
                              {entry.user?.name || `Customer ${entry.userId}`}
                            </span>
                            <Badge className={getStatusColor(entry.status)}>
                              {entry.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>Party of {entry.partySize}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>Est. {formatTime(entry.estimatedWaitTime)}</span>
                            </div>
                            {entry.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-4 w-4" />
                                <span>{entry.phone}</span>
                              </div>
                            )}
                          </div>

                          {entry.seatingPreference && (
                            <div className="flex items-center space-x-1 text-sm">
                              <MapPin className="h-4 w-4" />
                              <span>Prefers: {entry.seatingPreference}</span>
                            </div>
                          )}

                          {entry.specialRequests && (
                            <div className="flex items-center space-x-1 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span>Note: {entry.specialRequests}</span>
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Joined: {new Date(entry.joinedAt).toLocaleTimeString()}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <Button
                            onClick={() => callCustomer(entry.id)}
                            size="sm"
                            variant="outline"
                            disabled={entry.status === 'called'}
                          >
                            {entry.status === 'called' ? 'Called' : 'Call Customer'}
                          </Button>
                          
                          <Select onValueChange={(value) => seatCustomer(entry.id, value)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Seat Customer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="main_dining">Main Dining</SelectItem>
                              <SelectItem value="booth">Booth</SelectItem>
                              <SelectItem value="window">Window</SelectItem>
                              <SelectItem value="bar">Bar</SelectItem>
                              <SelectItem value="outdoor">Outdoor</SelectItem>
                              <SelectItem value="quiet">Quiet Area</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            onClick={() => cancelEntry(entry.id)}
                            size="sm"
                            variant="destructive"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaitlistManager;