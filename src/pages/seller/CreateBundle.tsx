import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Calendar, Package, Plus, Copy } from "lucide-react";
import { format } from "date-fns";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { usePlates } from "@/lib/plates-service";
import { useAuth } from "@/context/AuthContext";
import { BundleFormValues, Plate } from "@/components/seller/PlateFormTypes";
import AddSinglePlateForm from "@/components/seller/AddSinglePlateForm";

const bundleSchema = z.object({
  name: z.string().min(3, "Bundle name must be at least 3 characters"),
  plateCount: z.coerce.number().min(2, "Bundle must contain at least 2 plates").max(10, "Bundle cannot exceed 10 plates"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  availableDate: z.date({
    required_error: "Available date is required",
  }).refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: "Date cannot be in the past",
  }),
  availabilityScope: z.enum(["day", "week"]),
  selectedPlateIds: z.array(z.string()).min(1, "At least one plate must be selected"),
}).refine((data) => data.selectedPlateIds.length === data.plateCount, {
  message: "Number of selected plates must match the declared plate count",
  path: ["selectedPlateIds"],
});

type BundleFormSchema = z.infer<typeof bundleSchema>;

const CreateBundle = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { fetchPlates, addPlate } = usePlates();
  
  const [availablePlates, setAvailablePlates] = useState<any[]>([]);
  const [allPlates, setAllPlates] = useState<any[]>([]); // Store all plates for duplication
  const [selectedPlateIds, setSelectedPlateIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPlateForm, setShowAddPlateForm] = useState(false);
  const [plateToEdit, setPlateToEdit] = useState<Plate | null>(null);

  const form = useForm<BundleFormSchema>({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      name: "",
      plateCount: 2,
      price: 0,
      availableDate: new Date(new Date().setHours(0, 0, 0, 0)),
      availabilityScope: "day",
      selectedPlateIds: [],
    },
  });

  // Function to refresh plates data
  const refreshPlatesData = async () => {
    try {
      console.log('Refreshing plates data...');
      const plates = await fetchPlates();
      console.log('Fetched plates:', plates);
      
      setAllPlates(plates); // Store all plates for duplication
      
      // Filter plates that are available for bundles and currently available
      const bundlePlates = plates.filter(plate => {
        const isEligible = plate.isBundle && plate.isAvailable;
        console.log(`Plate ${plate.name} - isBundle: ${plate.isBundle}, isAvailable: ${plate.isAvailable}, eligible: ${isEligible}`);
        return isEligible;
      });
      
      console.log('Bundle eligible plates:', bundlePlates);
      setAvailablePlates(bundlePlates);
    } catch (error) {
      console.error("Error refreshing plates:", error);
      toast({
        title: "Error",
        description: "Failed to refresh plates. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load available plates for bundles
  React.useEffect(() => {
    if (currentUser) {
      refreshPlatesData();
    }
  }, [currentUser, fetchPlates, toast]);

  const handlePlateSelection = (plateId: string, checked: boolean) => {
    const plateCount = form.getValues("plateCount");
    
    if (checked) {
      if (selectedPlateIds.length < plateCount) {
        const newSelection = [...selectedPlateIds, plateId];
        setSelectedPlateIds(newSelection);
        form.setValue("selectedPlateIds", newSelection);
      } else {
        toast({
          title: "Selection Limit Reached",
          description: `You can only select ${plateCount} plates for this bundle.`,
          variant: "destructive",
        });
      }
    } else {
      const newSelection = selectedPlateIds.filter(id => id !== plateId);
      setSelectedPlateIds(newSelection);
      form.setValue("selectedPlateIds", newSelection);
    }
  };

  const handleAddPlate = async (newPlateData: Omit<Plate, "id" | "soldCount">) => {
    try {
      console.log('Adding new plate:', newPlateData);
      const savedPlate = await addPlate(newPlateData);
      console.log('Plate saved successfully:', savedPlate);
      
      // Refresh the plates data to include the new plate
      await refreshPlatesData();
      
      toast({
        title: "Plate Added",
        description: `${savedPlate.name} has been added to your menu and is available for bundles.`,
      });
    } catch (error) {
      console.error("Error adding plate:", error);
      toast({
        title: "Error",
        description: "Failed to add plate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicatePlate = (plateId: string) => {
    const plateToClone = allPlates.find(plate => plate.id === plateId);
    if (plateToClone) {
      // Create a copy of the plate with modified name and reset some fields
      const duplicatedPlate: Plate = {
        ...plateToClone,
        id: '', // Will be generated when saved
        name: `${plateToClone.name} (Copy)`,
        availableDate: new Date(new Date().setHours(0, 0, 0, 0)), // Set to today
        soldCount: 0,
        isBundle: true, // Ensure it's available for bundles
        isAvailable: true,
      };
      
      setPlateToEdit(duplicatedPlate);
      setShowAddPlateForm(true);
    }
  };

  const handleFormClose = () => {
    setShowAddPlateForm(false);
    setPlateToEdit(null);
  };

  const onSubmit = async (data: BundleFormSchema) => {
    if (data.selectedPlateIds.length !== data.plateCount) {
      toast({
        title: "Invalid Selection",
        description: "Number of selected plates must match the declared plate count.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Here you would implement the bundle creation logic
      // For now, we'll just show a success message
      toast({
        title: "Bundle Created!",
        description: `${data.name} has been created successfully.`,
      });
      
      navigate("/seller/dashboard");
    } catch (error) {
      console.error("Error creating bundle:", error);
      toast({
        title: "Error",
        description: "Failed to create bundle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-8 w-8 text-nextplate-orange" />
            <div>
              <h1 className="text-3xl font-bold">Create Meal Prep Bundle</h1>
              <p className="text-gray-400">Group multiple plates together for a special price</p>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Bundle Details */}
              <Card className="bg-nextplate-darkgray border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Bundle Details</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure your meal prep bundle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bundle Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Bundle Name *</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="e.g., Weekly Protein Pack"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  {/* Plate Count */}
                  <div className="space-y-2">
                    <Label htmlFor="plateCount" className="text-white">Number of Plates *</Label>
                    <Input
                      id="plateCount"
                      type="number"
                      min="2"
                      max="10"
                      {...form.register("plateCount", {
                        onChange: () => {
                          setSelectedPlateIds([]);
                          form.setValue("selectedPlateIds", []);
                        }
                      })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {form.formState.errors.plateCount && (
                      <p className="text-sm text-red-400">{form.formState.errors.plateCount.message}</p>
                    )}
                  </div>

                  {/* Bundle Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-white">Bundle Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register("price")}
                      placeholder="0.00"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {form.formState.errors.price && (
                      <p className="text-sm text-red-400">{form.formState.errors.price.message}</p>
                    )}
                  </div>

                  {/* Available Date */}
                  <div className="space-y-2">
                    <Label className="text-white">Available Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
                            !form.watch("availableDate") && "text-gray-400"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {form.watch("availableDate") ? (
                            format(form.watch("availableDate"), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={form.watch("availableDate")}
                          onSelect={(date) => date && form.setValue("availableDate", date)}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.availableDate && (
                      <p className="text-sm text-red-400">{form.formState.errors.availableDate.message}</p>
                    )}
                  </div>

                  {/* Availability Scope */}
                  <div className="space-y-3">
                    <Label className="text-white">Availability Scope *</Label>
                    <RadioGroup
                      value={form.watch("availabilityScope")}
                      onValueChange={(value) => form.setValue("availabilityScope", value as "day" | "week")}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="day" id="day" className="border-gray-600" />
                        <Label htmlFor="day" className="text-white cursor-pointer">
                          Available for one day only
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="week" id="week" className="border-gray-600" />
                        <Label htmlFor="week" className="text-white cursor-pointer">
                          Available for the entire week
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Plate Selection */}
              <Card className="bg-nextplate-darkgray border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Select Plates</CardTitle>
                      <CardDescription className="text-gray-400">
                        Choose {form.watch("plateCount")} plates for your bundle
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setShowAddPlateForm(true)}
                        className="bg-nextplate-orange hover:bg-orange-600"
                        size="sm"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Create New
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {availablePlates.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">
                        No plates available for bundles. Create plates that are marked as "Available for Meal Prep Bundles".
                      </p>
                      <div className="flex justify-center gap-3">
                        <Button
                          type="button"
                          onClick={() => setShowAddPlateForm(true)}
                          className="bg-nextplate-orange hover:bg-orange-600"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Plate
                        </Button>
                        {allPlates.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              // Show the first plate as an example for duplication
                              handleDuplicatePlate(allPlates[0].id);
                            }}
                            className="text-gray-300 border-gray-700"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate Existing
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {availablePlates.map((plate) => (
                        <div
                          key={plate.id}
                          className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg"
                        >
                          <Checkbox
                            id={plate.id}
                            checked={selectedPlateIds.includes(plate.id)}
                            onCheckedChange={(checked) => 
                              handlePlateSelection(plate.id, checked as boolean)
                            }
                            className="data-[state=checked]:bg-nextplate-orange data-[state=checked]:border-nextplate-orange"
                          />
                          <div className="flex-1">
                            <Label htmlFor={plate.id} className="text-white cursor-pointer font-medium">
                              {plate.name}
                            </Label>
                            <p className="text-sm text-gray-400">
                              ${plate.price.toFixed(2)} • Size: {plate.size} • Qty: {plate.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleDuplicatePlate(plate.id)}
                              className="text-gray-400 border-gray-600 hover:bg-gray-700"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            {plate.imageUrl && (
                              <img
                                src={plate.imageUrl}
                                alt={plate.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show duplication option for all plates */}
                  {allPlates.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                          Want to modify an existing plate?
                        </p>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-gray-300 border-gray-700"
                            >
                              <Copy className="mr-1 h-4 w-4" />
                              Duplicate & Edit
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 bg-gray-800 border-gray-700">
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              <h4 className="font-medium text-white">Select plate to duplicate:</h4>
                              {allPlates.map((plate) => (
                                <button
                                  key={plate.id}
                                  type="button"
                                  onClick={() => handleDuplicatePlate(plate.id)}
                                  className="w-full text-left p-2 hover:bg-gray-700 rounded text-sm text-white"
                                >
                                  {plate.name} - ${plate.price.toFixed(2)}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                  
                  {form.formState.errors.selectedPlateIds && (
                    <p className="text-sm text-red-400 mt-2">
                      {form.formState.errors.selectedPlateIds.message}
                    </p>
                  )}
                  
                  <div className="mt-4 text-sm text-gray-400">
                    Selected: {selectedPlateIds.length} / {form.watch("plateCount")} plates
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/seller/dashboard")}
                className="text-gray-300 border-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-nextplate-orange hover:bg-orange-600"
              >
                {isLoading ? (
                  <>Creating Bundle...</>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Bundle
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Plate Form Modal */}
      <AddSinglePlateForm
        open={showAddPlateForm}
        onOpenChange={handleFormClose}
        onSubmit={handleAddPlate}
        initialPlate={plateToEdit}
      />
    </div>
  );
};

export default CreateBundle;
