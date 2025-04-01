import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "@/components/reservation/DatePicker";
import TimeSlots from "@/components/reservation/TimeSlots";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const reservationSchema = z.object({
  date: z.string().nonempty("Please select a date"),
  time: z.string().nonempty("Please select a time"),
  partySize: z.string().nonempty("Please select party size"),
  notes: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

const ReservationForm = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      date: "",
      time: "",
      partySize: "2",
      notes: "",
    },
  });

  const onSubmit = async (values: ReservationFormValues) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Please log in",
        description: "You must be logged in to make a reservation",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      const reservation = {
        userId: user.id,
        date: values.date,
        time: values.time,
        partySize: parseInt(values.partySize),
        notes: values.notes,
        restaurantId: 1, // Default restaurant
      };

      await apiRequest("POST", "/api/reservations", reservation);

      toast({
        title: "Reservation confirmed!",
        description: `Your table is booked for ${values.date} at ${values.time}`,
      });

      form.reset();
    } catch (error) {
      console.error("Error making reservation:", error);
      toast({
        title: "Failed to make reservation",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    form.setValue("date", date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="font-heading font-semibold text-lg mb-4">Select Date & Time</h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DatePicker selectedDate={selectedDate} onDateSelect={handleDateChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <TimeSlots
                    selectedDate={selectedDate}
                    selectedTime={field.value}
                    onTimeSelect={(time) => field.onChange(time)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="partySize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Party Size</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select party size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 person</SelectItem>
                    <SelectItem value="2">2 people</SelectItem>
                    <SelectItem value="3">3 people</SelectItem>
                    <SelectItem value="4">4 people</SelectItem>
                    <SelectItem value="5">5 people</SelectItem>
                    <SelectItem value="6">6 people</SelectItem>
                    <SelectItem value="7">7 people</SelectItem>
                    <SelectItem value="8">8+ people (call restaurant)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requests (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="E.g., Window seat, high chair, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Reserve Table"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ReservationForm;
