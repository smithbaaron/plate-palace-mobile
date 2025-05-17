
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { CalendarCheck, Clock } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface DeliveryAddress {
  address: string;
  label: string;
}

interface PickupSchedulerProps {
  onSchedule?: (pickup: {
    date: Date;
    timeWindow: string;
    locationIndex: number;
    location: DeliveryAddress;
  }) => void;
  className?: string;
}

const PickupScheduler = ({ onSchedule, className }: PickupSchedulerProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeWindow, setTimeWindow] = useState("");
  const [locationIndex, setLocationIndex] = useState<string>("0");
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load saved addresses from localStorage
    const savedAddresses = localStorage.getItem("pickupAddresses");
    if (savedAddresses) {
      try {
        const parsedAddresses = JSON.parse(savedAddresses);
        setAddresses(parsedAddresses);
      } catch (error) {
        console.error("Error parsing saved addresses:", error);
        setAddresses([]);
      }
    }
  }, []);
  
  const handleSchedule = () => {
    setIsLoading(true);
    
    try {
      if (!date) {
        toast({
          title: "Date required",
          description: "Please select a pickup date",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!timeWindow) {
        toast({
          title: "Time required",
          description: "Please enter a pickup time window",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const selectedLocationIndex = parseInt(locationIndex);
      const selectedLocation = addresses[selectedLocationIndex];
      
      if (!selectedLocation) {
        toast({
          title: "Location required",
          description: "Please select a pickup location",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Call the onSchedule callback if provided
      if (onSchedule) {
        onSchedule({
          date: date,
          timeWindow,
          locationIndex: selectedLocationIndex,
          location: selectedLocation
        });
      }
      
      // Reset form
      setTimeWindow("");
      
      toast({
        title: "Pickup scheduled",
        description: `Pickup scheduled for ${format(date, "PPP")} at ${selectedLocation.label}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem scheduling the pickup.",
        variant: "destructive",
      });
      console.error("Error scheduling pickup:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`bg-nextplate-darkgray rounded-lg p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <CalendarCheck className="mr-2 text-nextplate-orange" />
        <h2 className="text-xl font-bold">Schedule Pickup</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Pickup Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                className="w-full justify-start text-left bg-black border-nextplate-lightgray text-white"
              >
                {date ? format(date, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-black border-nextplate-lightgray">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="bg-black text-white"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Pickup Time Window</label>
          <div className="flex items-center">
            <Clock className="mr-2 text-nextplate-orange" size={20} />
            <Input
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              placeholder="e.g., 5:00 PM - 7:00 PM"
              className="bg-black border-nextplate-lightgray text-white"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Specify the time range when customers can pick up their order</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Pickup Location</label>
          <Select 
            value={locationIndex}
            onValueChange={setLocationIndex}
          >
            <SelectTrigger className="bg-black border-nextplate-lightgray text-white">
              <SelectValue placeholder="Select a pickup location" />
            </SelectTrigger>
            <SelectContent className="bg-black border-nextplate-lightgray text-white">
              {addresses.map((address, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {address.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {addresses.length > 0 && locationIndex !== null && (
            <div className="mt-2 text-sm text-gray-400">
              {addresses[parseInt(locationIndex)]?.address}
            </div>
          )}
          
          {addresses.length === 0 && (
            <p className="text-sm text-yellow-500 mt-2">
              No pickup locations found. Please add locations in settings.
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <Button
          onClick={handleSchedule}
          disabled={isLoading || addresses.length === 0}
          className="bg-nextplate-orange hover:bg-orange-600 w-full"
        >
          {isLoading ? "Scheduling..." : "Schedule Pickup"}
        </Button>
      </div>
    </div>
  );
};

export default PickupScheduler;
