
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { PlateFormValues } from "./PlateFormTypes";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Clock, Truck } from "lucide-react";

interface PlateDeliveryPickupOptionsProps {
  form: UseFormReturn<PlateFormValues>;
}

const PlateDeliveryPickupOptions: React.FC<PlateDeliveryPickupOptionsProps> = ({ form }) => {
  const deliveryAvailable = form.watch("deliveryAvailable");

  return (
    <div className="space-y-4">
      <div className="border border-gray-700 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Truck size={20} className="mr-2" />
          Delivery & Pickup Options
        </h3>
        
        {/* Delivery Available Field */}
        <FormField
          control={form.control}
          name="deliveryAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base text-white">
                  Delivery Available
                </FormLabel>
                <div className="text-sm text-gray-400">
                  Enable delivery option for this plate
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Pickup Time Field */}
        <FormField
          control={form.control}
          name="pickupTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white flex items-center">
                <Clock size={16} className="mr-2" />
                Pickup Time
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 12:00 PM - 8:00 PM"
                  className="bg-nextplate-darkgray border-gray-700 text-white placeholder:text-gray-500"
                  {...field}
                />
              </FormControl>
              <div className="text-xs text-gray-400">
                Specify when customers can pick up this plate
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default PlateDeliveryPickupOptions;
