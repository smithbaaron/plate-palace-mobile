
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PlateFormValues } from "./PlateFormTypes";

interface PlateAvailabilityDateProps {
  form: UseFormReturn<PlateFormValues>;
}

const PlateAvailabilityDate: React.FC<PlateAvailabilityDateProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="availableDate"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-gray-300">
            Available Date *
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "pl-3 text-left font-normal bg-black border-nextplate-lightgray text-white",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-70" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-black border-nextplate-lightgray" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <FormDescription className="text-gray-500">
            Select the date when this plate will be available
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PlateAvailabilityDate;
