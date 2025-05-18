
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Import the types and components we've extracted
import { PlateFormValues, formSchema, Plate } from "./PlateFormTypes";
import PlateImageUpload from "./PlateImageUpload";
import PlateBasicDetails from "./PlateBasicDetails";
import PlateSizeSelector from "./PlateSizeSelector";
import PlateNutritionalInfo from "./PlateNutritionalInfo";
import PlateAvailabilityDate from "./PlateAvailabilityDate";

// Re-export the types from PlateFormTypes for backward compatibility
export type { PlateSize, Plate } from "./PlateFormTypes";
export { formSchema } from "./PlateFormTypes";

interface AddSinglePlateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: Omit<Plate, "id" | "soldCount">) => void;
}

const AddSinglePlateForm: React.FC<AddSinglePlateFormProps> = ({ open, onOpenChange, onSubmit }) => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<PlateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      price: 0,
      nutritionalInfo: "",
      availableDate: new Date(new Date().setHours(0, 0, 0, 0)),
      imageUrl: "",
      size: "M",
    },
  });

  const handleSubmit = (data: PlateFormValues) => {
    // Add image preview to the form data if available
    if (imagePreview) {
      data.imageUrl = imagePreview;
    }
    
    // Call the onSubmit callback if it exists
    if (onSubmit) {
      onSubmit({
        name: data.name,
        quantity: data.quantity,
        price: data.price,
        nutritionalInfo: data.nutritionalInfo,
        availableDate: data.availableDate,
        imageUrl: data.imageUrl,
        size: data.size,
      });
    }
    
    // Reset form and close dialog
    form.reset();
    setImagePreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-nextplate-darkgray text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Single Plate</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new plate for your menu. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Image Upload Field */}
            <PlateImageUpload 
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
            />
            
            {/* Basic Details (Name, Price, Quantity) */}
            <PlateBasicDetails form={form} />
            
            {/* Plate Size Selection */}
            <PlateSizeSelector form={form} />
            
            {/* Nutritional Info Field */}
            <PlateNutritionalInfo form={form} />
            
            {/* Available Date Field */}
            <PlateAvailabilityDate form={form} />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                className="text-gray-300 border-gray-700" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-nextplate-orange hover:bg-orange-600"
              >
                <Plus size={16} className="mr-1" /> 
                Add Plate
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSinglePlateForm;
