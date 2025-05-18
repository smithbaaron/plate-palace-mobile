
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlateFormValues } from "./PlateFormTypes";

interface PlateBasicDetailsProps {
  form: UseFormReturn<PlateFormValues>;
}

const PlateBasicDetails: React.FC<PlateBasicDetailsProps> = ({ form }) => {
  return (
    <>
      {/* Name Field */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">
              Plate Name *
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Homemade Lasagna"
                className="bg-black border-nextplate-lightgray text-white"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Quantity and Price Fields */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">
                Quantity Available *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  className="bg-black border-nextplate-lightgray text-white"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">
                Price per Plate ($) *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  className="bg-black border-nextplate-lightgray text-white"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default PlateBasicDetails;
