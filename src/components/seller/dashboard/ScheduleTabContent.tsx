
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Plate } from "@/components/seller/PlateFormTypes";
import PlateCard from "./PlateCard";

interface ScheduleDayProps {
  date: string;
  plates: Plate[];
}

const ScheduleDay: React.FC<ScheduleDayProps> = ({ date, plates }) => {
  return (
    <div className="bg-nextplate-darkgray rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <Calendar size={20} className="mr-2 text-nextplate-orange" />
        {format(new Date(date), 'EEEE, MMMM d, yyyy')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {plates.map((plate) => (
          <Card key={plate.id} className="bg-black overflow-hidden">
            <div className="h-24 w-full bg-gray-800 flex items-center justify-center overflow-hidden">
              {plate.imageUrl ? (
                <img 
                  src={plate.imageUrl} 
                  alt={plate.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-500">No Image</div>
              )}
            </div>
            <CardContent className="p-4">
              <h4 className="font-bold mb-1">{plate.name}</h4>
              <div className="flex justify-between items-center">
                <span className="flex items-center text-nextplate-orange font-medium">
                  <DollarSign size={16} className="mr-1" />
                  {plate.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400">
                  {plate.quantity} total
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface ScheduleTabContentProps {
  platesByDate: Record<string, Plate[]>;
  sortedDates: string[];
}

const ScheduleTabContent: React.FC<ScheduleTabContentProps> = ({ platesByDate, sortedDates }) => {
  if (sortedDates.length === 0) {
    return (
      <div className="bg-nextplate-darkgray rounded-xl p-6 flex-center">
        <div className="text-center py-16">
          <Calendar size={64} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-bold mb-1">No scheduled items</h3>
          <p className="text-gray-400">
            Your upcoming meal schedule will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map(dateStr => (
        <ScheduleDay key={dateStr} date={dateStr} plates={platesByDate[dateStr]} />
      ))}
    </div>
  );
};

export default ScheduleTabContent;
