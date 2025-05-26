
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
import { Checkbox } from "@/components/ui/checkbox";

interface PlateAvailabilityOptionsProps {
  form: UseFormReturn<PlateFormValues>;
}

const PlateAvailabilityOptions: React.FC<PlateAvailabilityOptionsProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Availability Options</h3>
        <p className="text-sm text-gray-400 mb-4">Choose how this plate can be sold (at least one option must be selected)</p>
      </div>
      
      <div className="space-y-3">
        <FormField
          control={form.control}
          name="isSingle"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-nextplate-orange data-[state=checked]:border-nextplate-orange"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-white cursor-pointer">
                  Available as a Single Plate
                </FormLabel>
                <p className="text-sm text-gray-400">
                  Customers can order this plate individually
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isBundle"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-nextplate-orange data-[state=checked]:border-nextplate-orange"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-white cursor-pointer">
                  Available for Meal Prep Bundles
                </FormLabel>
                <p className="text-sm text-gray-400">
                  This plate can be included in meal prep bundles
                </p>
              </div>
            </FormItem>
          )}
        />
      </div>
      
      <FormMessage />
    </div>
  );
};

export default PlateAvailabilityOptions;
