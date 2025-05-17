
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

interface DeliveryAddress {
  address: string;
  label: string;
}

interface DeliveryAddressManagerProps {
  onSave?: (addresses: DeliveryAddress[]) => void;
  className?: string;
}

const DeliveryAddressManager = ({ onSave, className }: DeliveryAddressManagerProps) => {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
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
  
  const handleAddAddress = () => {
    if (addresses.length < 5) {
      setAddresses([...addresses, { address: "", label: "" }]);
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
    } else {
      toast({
        description: "You need at least one pickup location.",
      });
    }
  };
  
  const handleAddressChange = (index: number, field: keyof DeliveryAddress, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setAddresses(newAddresses);
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
            disabled={addresses.length >= 5}
            className="border-nextplate-orange text-nextplate-orange hover:bg-nextplate-orange hover:text-white"
          >
            <Plus size={16} className="mr-1" /> Add Location
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-nextplate-orange hover:bg-orange-600"
          >
            <Save size={16} className="mr-1" /> Save Changes
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {addresses.map((address, index) => (
          <div key={index} className="bg-nextplate-darkgray rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Location {index + 1}</h3>
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
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Location Name</label>
                <Input
                  value={address.label}
                  onChange={(e) => handleAddressChange(index, 'label', e.target.value)}
                  placeholder="E.g., Main Kitchen, Downtown Location"
                  className="bg-black border-nextplate-lightgray text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">Full Address</label>
                <Textarea
                  value={address.address}
                  onChange={(e) => handleAddressChange(index, 'address', e.target.value)}
                  placeholder="Enter the full address for pickup"
                  className="bg-black border-nextplate-lightgray text-white"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
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
