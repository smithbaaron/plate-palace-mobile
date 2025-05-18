
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Trash2, Save } from "lucide-react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface DeliveryAddress {
  address: string;
  label: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface DeliveryAddressManagerProps {
  onSave?: (addresses: DeliveryAddress[]) => void;
  className?: string;
}

// Create schema for address validation
const addressSchema = z.object({
  label: z.string().min(1, "Location name is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid 5-digit ZIP code")
});

type AddressFormValues = z.infer<typeof addressSchema>;

const DeliveryAddressManager = ({ onSave, className }: DeliveryAddressManagerProps) => {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Initialize the form
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "",
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });
  
  useEffect(() => {
    // Load saved addresses from localStorage
    const savedAddresses = localStorage.getItem("pickupAddresses");
    if (savedAddresses) {
      try {
        const parsedAddresses = JSON.parse(savedAddresses);
        setAddresses(parsedAddresses);
      } catch (error) {
        console.error("Error parsing saved addresses:", error);
        setAddresses([{ address: "", label: "" }]);
      }
    } else {
      setAddresses([{ address: "", label: "" }]);
    }
  }, []);
  
  const startEditingAddress = (index: number) => {
    setEditingIndex(index);
    const address = addresses[index];
    
    // Try to parse the address into components if it's a legacy address
    const addressParts = parseAddressString(address.address);
    
    form.reset({
      label: address.label || "",
      street: address.street || addressParts.street || "",
      city: address.city || addressParts.city || "",
      state: address.state || addressParts.state || "",
      zipCode: address.zipCode || addressParts.zipCode || ""
    });
  };
  
  // Parse a legacy address string into components
  const parseAddressString = (addressStr: string): { street: string, city: string, state: string, zipCode: string } => {
    // This is a very basic parser - in a real app you might want to use a proper address parser
    const parts = addressStr.split(',').map(part => part.trim());
    return {
      street: parts[0] || "",
      city: parts.length > 1 ? parts[1] : "",
      state: parts.length > 2 ? parts[2].split(' ')[0] : "",
      zipCode: parts.length > 2 ? parts[2].split(' ').slice(1).join(' ') : ""
    };
  };
  
  // Format address components into a full address string
  const formatFullAddress = (data: AddressFormValues): string => {
    return `${data.street}, ${data.city}, ${data.state} ${data.zipCode}`;
  };
  
  const handleAddAddress = () => {
    if (addresses.length < 5) {
      setAddresses([...addresses, { address: "", label: "" }]);
      setEditingIndex(addresses.length);
      form.reset({
        label: "",
        street: "",
        city: "",
        state: "",
        zipCode: ""
      });
    } else {
      toast({
        title: "Maximum reached",
        description: "You can have up to 5 pickup locations.",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveAddress = (index: number) => {
    if (addresses.length > 1) {
      const newAddresses = [...addresses];
      newAddresses.splice(index, 1);
      setAddresses(newAddresses);
      if (editingIndex === index) {
        setEditingIndex(null);
      } else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    } else {
      toast({
        description: "You need at least one pickup location.",
      });
    }
  };
  
  const handleSubmitAddress = (data: AddressFormValues) => {
    if (editingIndex === null) return;
    
    const newAddresses = [...addresses];
    const fullAddress = formatFullAddress(data);
    
    newAddresses[editingIndex] = {
      label: data.label,
      address: fullAddress,
      street: data.street,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode
    };
    
    setAddresses(newAddresses);
    setEditingIndex(null);
    form.reset();
  };
  
  const handleSave = () => {
    setIsLoading(true);
    
    try {
      // Validate addresses
      const emptyAddresses = addresses.filter(addr => !addr.address || !addr.label);
      if (emptyAddresses.length > 0) {
        toast({
          title: "Incomplete information",
          description: "Please fill in all address fields.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Save to localStorage
      localStorage.setItem("pickupAddresses", JSON.stringify(addresses));
      
      // Trigger parent callback if provided
      if (onSave) {
        onSave(addresses);
      }
      
      toast({
        title: "Addresses saved",
        description: "Your pickup locations have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your addresses.",
        variant: "destructive",
      });
      console.error("Error saving addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MapPin className="mr-2 text-nextplate-orange" />
          <h2 className="text-xl font-bold">Pickup Locations</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddAddress}
            disabled={addresses.length >= 5 || editingIndex !== null}
            className="border-nextplate-orange text-nextplate-orange hover:bg-nextplate-orange hover:text-white"
          >
            <Plus size={16} className="mr-1" /> Add Location
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading || editingIndex !== null}
            className="bg-nextplate-orange hover:bg-orange-600"
          >
            <Save size={16} className="mr-1" /> Save Changes
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {addresses.map((address, index) => (
          <div key={index} className="bg-nextplate-darkgray rounded-lg p-4 space-y-3">
            {editingIndex === index ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitAddress)} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Location {index + 1}</h3>
                    {addresses.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAddress(index)}
                        className="h-8 text-red-400 hover:text-red-300 hover:bg-transparent p-0"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-300">Location Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="E.g., Main Kitchen, Downtown Location"
                            className="bg-black border-nextplate-lightgray text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-300">Street Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="123 Main St"
                            className="bg-black border-nextplate-lightgray text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-300">City</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="City"
                              className="bg-black border-nextplate-lightgray text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-300">State</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="State"
                                maxLength={2}
                                className="bg-black border-nextplate-lightgray text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-300">ZIP</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="12345"
                                className="bg-black border-nextplate-lightgray text-white"
                                onChange={(e) => {
                                  // Only allow digits and hyphen for ZIP+4
                                  const value = e.target.value.replace(/[^\d-]/g, '');
                                  field.onChange(value);
                                }}
                                maxLength={10}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingIndex(null)}
                      className="border-nextplate-lightgray text-white"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="bg-nextplate-orange hover:bg-orange-600"
                    >
                      Save Address
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{address.label || `Location ${index + 1}`}</h3>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditingAddress(index)}
                      className="h-8 text-white hover:bg-nextplate-darkgray p-0 mr-1"
                    >
                      Edit
                    </Button>
                    {addresses.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAddress(index)}
                        className="h-8 text-red-400 hover:text-red-300 hover:bg-transparent p-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-white">{address.address}</p>
              </>
            )}
          </div>
        ))}
        
        {addresses.length === 0 && (
          <div className="bg-nextplate-darkgray rounded-lg p-6 text-center">
            <p className="text-gray-400">No pickup locations added yet</p>
            <Button 
              onClick={handleAddAddress} 
              className="mt-2 bg-nextplate-orange hover:bg-orange-600"
              size="sm"
            >
              <Plus size={16} className="mr-1" /> Add Location
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading || editingIndex !== null}
          className="bg-nextplate-orange hover:bg-orange-600"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
      <div className="mt-2">
        <p className="text-xs text-gray-400">
          You can add up to 5 pickup locations. These locations will be available for selection when creating pickup time slots.
        </p>
      </div>
    </div>
  );
};

export default DeliveryAddressManager;
