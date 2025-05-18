
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
import { useNotifications } from "@/hooks/use-notifications";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlateNutritionalInfoProps {
  form: UseFormReturn<PlateFormValues>;
}

const PlateNutritionalInfo: React.FC<PlateNutritionalInfoProps> = ({ form }) => {
  const { notifyInfo } = useNotifications();

  const handleInfoClick = () => {
    notifyInfo(
      "Nutritional Information", 
      "Add details like calories, proteins, fats, carbs, and allergens to help customers make informed choices."
    );
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <FormLabel className="text-gray-300">
          Nutritional Info & Allergens
        </FormLabel>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={handleInfoClick}
          className="h-8 w-8 p-0 text-gray-400"
        >
          <AlertCircle size={16} />
        </Button>
      </div>
      
      <FormField
        control={form.control}
        name="nutritionalInfo"
        render={({ field }) => (
          <FormItem>
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
    </div>
  );
};

export default PlateNutritionalInfo;
