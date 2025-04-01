import { useState, useEffect } from "react";
import { addDays, format, startOfMonth, getDay, getDaysInMonth } from "date-fns";

interface DatePickerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const DatePicker = ({ selectedDate, onDateSelect }: DatePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dates, setDates] = useState<{ date: Date; formatted: string; }[]>([]);

  useEffect(() => {
    const now = new Date();
    const startDate = now;
    const endDate = addDays(now, 30);
    
    const allDates: { date: Date; formatted: string; }[] = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push({
        date: new Date(d),
        formatted: format(d, "yyyy-MM-dd"),
      });
    }
    
    setDates(allDates);
  }, []);

  // Calculate the first day of the month to determine empty cells
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startDay = getDay(firstDayOfMonth); // 0 = Sunday, 1 = Monday, etc.
  const daysInMonth = getDaysInMonth(currentMonth);

  // Create empty cells for days before the 1st of the month
  const emptyCells = Array.from({ length: startDay }).map((_, index) => (
    <div key={`empty-${index}`} className="h-10"></div>
  ));

  // Generate the calendar grid
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-xs text-gray-600">
            {day}
          </div>
        ))}

        {emptyCells}

        {dates.map((dateObj) => {
          const isSelected = dateObj.formatted === selectedDate;
          const isCurrentMonth = dateObj.date.getMonth() === currentMonth.getMonth();
          
          if (!isCurrentMonth) return null;
          
          return (
            <button
              key={dateObj.formatted}
              type="button"
              onClick={() => onDateSelect(dateObj.formatted)}
              className={`h-10 rounded-full flex items-center justify-center text-sm ${
                isSelected
                  ? "border border-primary bg-primary text-white font-medium"
                  : "border border-gray-300 hover:border-primary"
              }`}
            >
              {dateObj.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;
