
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit } from "lucide-react";

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
import PlateAvailabilityOptions from "./PlateAvailabilityOptions";
import PlateDeliveryPickupOptions from "./PlateDeliveryPickupOptions";

// Re-export the types from PlateFormTypes for backward compatibility
export type { PlateSize, Plate } from "./PlateFormTypes";
export { formSchema } from "./PlateFormTypes";

interface AddSinglePlateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: Omit<Plate, "id" | "soldCount">) => void;
  initialPlate?: Plate | null; // New prop for editing/duplicating plates
}

const AddSinglePlateForm: React.FC<AddSinglePlateFormProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit,
  initialPlate 
}) => {
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
      isSingle: true,
      isBundle: false,
      deliveryAvailable: false,
      pickupTime: "",
    },
  });

  // Reset form when dialog opens/closes or when initialPlate changes
  useEffect(() => {
    if (open && initialPlate) {
      // Populate form with initial plate data
      form.reset({
        name: initialPlate.name,
        quantity: initialPlate.quantity,
        price: initialPlate.price,
        nutritionalInfo: initialPlate.nutritionalInfo || "",
        availableDate: initialPlate.availableDate,
        imageUrl: initialPlate.imageUrl || "",
        size: initialPlate.size,
        isSingle: initialPlate.isSingle,
        isBundle: initialPlate.isBundle,
        deliveryAvailable: initialPlate.deliveryAvailable || false,
        pickupTime: initialPlate.pickupTime || "",
      });
      setImagePreview(initialPlate.imageUrl || null);
    } else if (open && !initialPlate) {
      // Reset to default values for new plate
      form.reset({
        name: "",
        quantity: 1,
        price: 0,
        nutritionalInfo: "",
        availableDate: new Date(new Date().setHours(0, 0, 0, 0)),
        imageUrl: "",
        size: "M",
        isSingle: true,
        isBundle: false,
        deliveryAvailable: false,
        pickupTime: "",
      });
      setImagePreview(null);
    }
  }, [open, initialPlate, form]);

  const handleSubmit = (data: PlateFormValues) => {
    // Validate that at least one availability option is selected
    if (!data.isSingle && !data.isBundle) {
      toast({
        title: "Invalid Selection",
        description: "Please select at least one availability option.",
        variant: "destructive",
      });
      return;
    }

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
        isSingle: data.isSingle,
        isBundle: data.isBundle,
        isAvailable: true,
        deliveryAvailable: data.deliveryAvailable,
        pickupTime: data.pickupTime,
      });
    }
    
    // Reset form and close dialog
    form.reset();
    setImagePreview(null);
    onOpenChange(false);
  };

  const isEditing = !!initialPlate;
  const dialogTitle = isEditing ? "Edit Plate" : "Add Single Plate";
  const dialogDescription = isEditing 
    ? "Modify the plate details below. This will create a new plate based on your changes."
    : "Create a new plate for your menu. Required fields are marked with an asterisk (*).";
  const buttonText = isEditing ? "Save Changes" : "Add Plate";
  const buttonIcon = isEditing ? Edit : Plus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-nextplate-darkgray text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{dialogTitle}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {dialogDescription}
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
            
            {/* Availability Options */}
            <PlateAvailabilityOptions form={form} />
            
            {/* Delivery and Pickup Options */}
            <PlateDeliveryPickupOptions form={form} />
            
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
                {React.createElement(buttonIcon, { size: 16, className: "mr-1" })}
                {buttonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSinglePlateForm;
