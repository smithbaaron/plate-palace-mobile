
import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { PlateFormValues } from "./PlateFormTypes";

interface PlateSizeSelectorProps {
  form: UseFormReturn<PlateFormValues>;
}

const PlateSizeSelector: React.FC<PlateSizeSelectorProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="size"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-gray-300">Plate Size *</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-row space-x-4"
            >
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="S" className="border-nextplate-orange text-nextplate-orange" />
                </FormControl>
                <FormLabel className="font-normal text-gray-300 cursor-pointer">
                  Small
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="M" className="border-nextplate-orange text-nextplate-orange" />
                </FormControl>
                <FormLabel className="font-normal text-gray-300 cursor-pointer">
                  Medium
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="L" className="border-nextplate-orange text-nextplate-orange" />
                </FormControl>
                <FormLabel className="font-normal text-gray-300 cursor-pointer">
                  Large
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormDescription className="text-gray-500">
            Select the size of your plate offering
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PlateSizeSelector;
