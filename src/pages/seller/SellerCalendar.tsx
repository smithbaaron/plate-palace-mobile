
import React, { useState } from "react";
import { Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { useSellerPlates } from "@/hooks/seller/use-seller-plates";
import CalendarView from "@/components/seller/calendar/CalendarView";
import ScheduleEventModal from "@/components/seller/calendar/ScheduleEventModal";

const SellerCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [view, setView] = useState<'month' | 'week'>('month');
  
  const { plates, todayPlates, platesByDate, isLoading } = useSellerPlates();

  const handlePrevious = () => {
    setCurrentDate(view === 'month' ? subMonths(currentDate, 1) : addDays(currentDate, -7));
  };

  const handleNext = () => {
    setCurrentDate(view === 'month' ? addMonths(currentDate, 1) : addDays(currentDate, 7));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsEventModalOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedDate(new Date());
    setIsEventModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="pt-20 px-4">
          <div className="max-w-7xl mx-auto flex-center">
            <div className="text-center">
              <Calendar size={48} className="mx-auto text-nextplate-orange mb-4" />
              <p className="text-gray-400">Loading your calendar...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Calendar Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold mb-2">Kitchen Calendar</h1>
              <p className="text-gray-400">Manage your meal schedule and pickup times</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-nextplate-darkgray rounded-lg p-1">
                <Button
                  variant={view === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('month')}
                  className={view === 'month' ? 'bg-nextplate-orange' : ''}
                >
                  Month
                </Button>
                <Button
                  variant={view === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('week')}
                  className={view === 'week' ? 'bg-nextplate-orange' : ''}
                >
                  Week
                </Button>
              </div>
              
              <Button
                onClick={handleAddEvent}
                className="bg-nextplate-orange hover:bg-orange-600"
              >
                <Plus size={18} className="mr-2" />
                Schedule Item
              </Button>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex justify-between items-center mb-6 bg-nextplate-darkgray rounded-lg p-4">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              className="text-white hover:bg-gray-700"
            >
              <ChevronLeft size={20} />
            </Button>
            
            <div className="text-center">
              <h2 className="text-xl font-bold">
                {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
              </h2>
              {view === 'week' && (
                <p className="text-sm text-gray-400">
                  {format(startOfWeek(currentDate), 'MMM d')} - {format(endOfWeek(currentDate), 'MMM d, yyyy')}
                </p>
              )}
            </div>
            
            <Button
              variant="ghost"
              onClick={handleNext}
              className="text-white hover:bg-gray-700"
            >
              <ChevronRight size={20} />
            </Button>
          </div>

          {/* Calendar View */}
          <CalendarView
            currentDate={currentDate}
            view={view}
            platesByDate={platesByDate}
            onDateClick={handleDateClick}
          />

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-nextplate-darkgray rounded-lg p-4">
              <h3 className="font-bold mb-2">Today's Menu</h3>
              <p className="text-2xl font-bold text-nextplate-orange">{todayPlates.length}</p>
              <p className="text-sm text-gray-400">items scheduled</p>
            </div>
            
            <div className="bg-nextplate-darkgray rounded-lg p-4">
              <h3 className="font-bold mb-2">This Week</h3>
              <p className="text-2xl font-bold text-nextplate-orange">
                {Object.keys(platesByDate).filter(dateStr => {
                  const date = new Date(dateStr);
                  const weekStart = startOfWeek(new Date());
                  const weekEnd = endOfWeek(new Date());
                  return date >= weekStart && date <= weekEnd;
                }).length}
              </p>
              <p className="text-sm text-gray-400">days with items</p>
            </div>
            
            <div className="bg-nextplate-darkgray rounded-lg p-4">
              <h3 className="font-bold mb-2">Total Scheduled</h3>
              <p className="text-2xl font-bold text-nextplate-orange">{plates.length}</p>
              <p className="text-sm text-gray-400">total items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Event Modal */}
      <ScheduleEventModal
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
        selectedDate={selectedDate}
        existingPlates={selectedDate ? platesByDate[format(selectedDate, 'yyyy-MM-dd')] || [] : []}
      />
    </div>
  );
};

export default SellerCalendar;
