import { useEffect, useState } from "react";
import { TimeSlot } from "@/types";

interface TimeSlotsProps {
  selectedDate: string;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

const TimeSlots = ({ selectedDate, selectedTime, onTimeSelect }: TimeSlotsProps) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;

    setIsLoading(true);

    // In a real app, this would fetch available time slots from the API
    // For this demo, we'll simulate some available time slots
    const slots: TimeSlot[] = [
      { time: "5:00 PM", available: true },
      { time: "5:30 PM", available: true },
      { time: "6:00 PM", available: true },
      { time: "6:30 PM", available: true },
      { time: "7:00 PM", available: true },
      { time: "7:30 PM", available: true },
      { time: "8:00 PM", available: true },
      { time: "8:30 PM", available: true },
      { time: "9:00 PM", available: true },
    ];

    // Simulate some slots being unavailable
    const unavailableIndex = Math.floor(Math.random() * slots.length);
    slots[unavailableIndex].available = false;

    setTimeout(() => {
      setTimeSlots(slots);
      setIsLoading(false);
    }, 500);
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div
            key={index}
            className="h-10 bg-gray-200 rounded-md animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (!selectedDate) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        Please select a date first
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        No available time slots for this date
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {timeSlots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          disabled={!slot.available}
          onClick={() => slot.available && onTimeSelect(slot.time)}
          className={`py-2 px-3 rounded-md text-sm ${
            !slot.available
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : selectedTime === slot.time
              ? "border border-primary bg-primary text-white"
              : "border border-gray-300 hover:border-primary"
          }`}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
};

export default TimeSlots;
