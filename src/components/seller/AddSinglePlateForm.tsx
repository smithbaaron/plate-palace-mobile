
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, ImageIcon, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define the form schema with validation rules
const formSchema = z.object({
  name: z.string().min(3, { message: "Plate name must be at least 3 characters" }),
  quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1" }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than 0" }),
  nutritionalInfo: z.string().optional(),
  availableDate: z.date({
    required_error: "Available date is required",
  }).refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: "Date cannot be in the past",
  }),
  imageUrl: z.string().optional(),
});

export type Plate = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  nutritionalInfo?: string;
  availableDate: Date;
  imageUrl?: string;
  soldCount: number;
};

export type PlateFormValues = z.infer<typeof formSchema>;

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
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (data: PlateFormValues) => {
    // Add image preview to the form data if available
    if (imagePreview) {
      data.imageUrl = imagePreview;
    }

    console.log("Form submitted:", data);
    
    // Call the onSubmit callback if it exists
    if (onSubmit) {
      onSubmit({
        name: data.name,
        quantity: data.quantity,
        price: data.price,
        nutritionalInfo: data.nutritionalInfo,
        availableDate: data.availableDate,
        imageUrl: data.imageUrl,
      });
    }
    
    // Show success toast
    toast({
      title: "Plate added successfully!",
      description: `${data.name} has been added to your menu.`,
    });
    
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
            <div className="space-y-2">
              <FormLabel className="text-gray-300">Plate Image</FormLabel>
              <div className="flex items-center gap-4">
                <div 
                  className={cn(
                    "h-32 w-32 border-2 border-dashed rounded-md flex-center flex-col cursor-pointer",
                    imagePreview ? "border-nextplate-orange" : "border-gray-600"
                  )}
                  onClick={() => document.getElementById("plate-image")?.click()}
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Plate preview" 
                      className="h-full w-full object-cover rounded-md"
                    />
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-gray-500" />
                      <span className="text-xs text-gray-500 mt-2">Upload Image</span>
                    </>
                  )}
                  <input
                    id="plate-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">
                    Upload an appetizing image of your dish (optional)
                  </p>
                  <p className="text-xs text-gray-500">
                    Max size: 5MB. Recommended: Square aspect ratio.
                  </p>
                </div>
              </div>
            </div>
            
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
            
            {/* Nutritional Info Field */}
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
            
            {/* Available Date Field */}
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
