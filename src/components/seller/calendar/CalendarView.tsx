
import React from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, startOfDay } from "date-fns";
import { Plate } from "@/components/seller/PlateFormTypes";
import { Card } from "@/components/ui/card";

interface CalendarViewProps {
  currentDate: Date;
  view: 'month' | 'week';
  platesByDate: Record<string, Plate[]>;
  onDateClick: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  view,
  platesByDate,
  onDateClick
}) => {
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    // Header row with day names
    const dayNames = [];
    for (let i = 0; i < 7; i++) {
      dayNames.push(
        <div key={i} className="p-2 text-center text-sm font-medium text-gray-400">
          {format(addDays(startOfWeek(new Date()), i), 'EEE')}
        </div>
      );
    }
    rows.push(
      <div key="header" className="grid grid-cols-7 border-b border-gray-700">
        {dayNames}
      </div>
    );

    // Calendar days
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayPlates = platesByDate[dateKey] || [];
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isCurrentDay = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            className={`
              min-h-[120px] p-2 border-r border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors
              ${isCurrentMonth ? 'bg-black' : 'bg-gray-900 opacity-50'}
              ${isCurrentDay ? 'bg-nextplate-orange bg-opacity-10 border-nextplate-orange' : ''}
            `}
            onClick={() => onDateClick(cloneDay)}
          >
            <div className={`
              text-sm font-medium mb-1
              ${isCurrentDay ? 'text-nextplate-orange' : isCurrentMonth ? 'text-white' : 'text-gray-500'}
            `}>
              {format(day, dateFormat)}
            </div>
            
            <div className="space-y-1">
              {dayPlates.slice(0, 3).map((plate, index) => (
                <div
                  key={plate.id}
                  className="text-xs bg-nextplate-orange bg-opacity-20 text-nextplate-orange px-2 py-1 rounded truncate"
                >
                  {plate.name}
                </div>
              ))}
              {dayPlates.length > 3 && (
                <div className="text-xs text-gray-400">
                  +{dayPlates.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      
      if (days.length === 7) {
        rows.push(
          <div key={day.toString()} className="grid grid-cols-7 border-b border-gray-700">
            {days}
          </div>
        );
        days = [];
      }
    }

    return <div className="border border-gray-700 rounded-lg overflow-hidden">{rows}</div>;
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayPlates = platesByDate[dateKey] || [];
      const isCurrentDay = isSameDay(day, new Date());

      days.push(
        <Card
          key={day.toString()}
          className={`
            p-4 cursor-pointer hover:bg-gray-800 transition-colors bg-nextplate-darkgray border-gray-700
            ${isCurrentDay ? 'border-nextplate-orange bg-nextplate-orange bg-opacity-5' : ''}
          `}
          onClick={() => onDateClick(day)}
        >
          <div className="mb-3">
            <div className={`
              text-sm font-medium
              ${isCurrentDay ? 'text-nextplate-orange' : 'text-gray-400'}
            `}>
              {format(day, 'EEE')}
            </div>
            <div className={`
              text-2xl font-bold
              ${isCurrentDay ? 'text-nextplate-orange' : 'text-white'}
            `}>
              {format(day, 'd')}
            </div>
          </div>
          
          <div className="space-y-2">
            {dayPlates.map((plate) => (
              <div
                key={plate.id}
                className="text-sm bg-nextplate-orange bg-opacity-20 text-nextplate-orange px-2 py-1 rounded"
              >
                <div className="font-medium truncate">{plate.name}</div>
                <div className="text-xs opacity-75">{plate.quantity} servings</div>
              </div>
            ))}
            {dayPlates.length === 0 && (
              <div className="text-sm text-gray-500 italic">No items scheduled</div>
            )}
          </div>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days}
      </div>
    );
  };

  return view === 'month' ? renderMonthView() : renderWeekView();
};

export default CalendarView;
