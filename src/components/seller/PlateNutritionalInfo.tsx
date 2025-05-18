
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PlateFormValues } from "./PlateFormTypes";

interface PlateNutritionalInfoProps {
  form: UseFormReturn<PlateFormValues>;
}

const PlateNutritionalInfo: React.FC<PlateNutritionalInfoProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="nutritionalInfo"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-300">
            Nutritional Info & Allergens
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="e.g., Contains nuts, dairy. Approx. 450 calories per serving."
              className="bg-black border-nextplate-lightgray text-white min-h-24"
              {...field}
            />
          </FormControl>
          <FormDescription className="text-gray-500">
            Add any nutritional information or allergy warnings
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PlateNutritionalInfo;
