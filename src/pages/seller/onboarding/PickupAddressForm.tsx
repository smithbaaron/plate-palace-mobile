
import React from "react";
import { AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PickupAddress {
  address: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface PickupAddressFormProps {
  address: PickupAddress;
  index: number;
  handleRemovePickupAddress: (index: number) => void;
  handlePickupAddressChange: (index: number, field: string, value: string | any) => void;
  deliveryOptionsErrors: {
    noOptionSelected: boolean;
    pickupAddressesEmpty: boolean;
  };
  pickupAddresses: PickupAddress[];
}

const PickupAddressForm: React.FC<PickupAddressFormProps> = ({
  address,
  index,
  handleRemovePickupAddress,
  handlePickupAddressChange,
  deliveryOptionsErrors,
  pickupAddresses
}) => {
  return (
    <div className="space-y-2 bg-black bg-opacity-30 p-3 rounded-md">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Pickup Location {index + 1}</h4>
        {pickupAddresses.length > 1 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleRemovePickupAddress(index)}
            className="h-8 text-red-400 hover:text-red-300 hover:bg-transparent p-0"
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>
      
      <div>
        <label className="block text-xs text-gray-400 mb-1">Location Name</label>
        <Input
          value={address.label}
          onChange={(e) => handlePickupAddressChange(index, 'label', e.target.value)}
          placeholder="E.g., Main Kitchen, Downtown Location"
          className="bg-black border-nextplate-lightgray text-white"
        />
      </div>
      
      <div>
        <label className="block text-xs text-gray-400 mb-1">Street Address <span className="text-red-500">*</span></label>
        <Input
          value={address.street || ""}
          onChange={(e) => {
            const street = e.target.value;
            handlePickupAddressChange(index, 'components', {
              street,
              city: address.city || "",
              state: address.state || "",
              zipCode: address.zipCode || ""
            });
          }}
          placeholder="123 Main St"
          className="bg-black border-nextplate-lightgray text-white mb-2"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">City <span className="text-red-500">*</span></label>
          <Input
            value={address.city || ""}
            onChange={(e) => {
              const city = e.target.value;
              handlePickupAddressChange(index, 'components', {
                street: address.street || "",
                city,
                state: address.state || "",
                zipCode: address.zipCode || ""
              });
            }}
            placeholder="City"
            className="bg-black border-nextplate-lightgray text-white"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-1">
          <div>
            <label className="block text-xs text-gray-400 mb-1">State <span className="text-red-500">*</span></label>
            <Input
              value={address.state || ""}
              onChange={(e) => {
                const state = e.target.value;
                handlePickupAddressChange(index, 'components', {
                  street: address.street || "",
                  city: address.city || "",
                  state,
                  zipCode: address.zipCode || ""
                });
              }}
              placeholder="ST"
              maxLength={2}
              className="bg-black border-nextplate-lightgray text-white"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">ZIP <span className="text-red-500">*</span></label>
            <Input
              value={address.zipCode || ""}
              onChange={(e) => {
                // Only allow digits and hyphen
                const zipCode = e.target.value.replace(/[^\d-]/g, '');
                handlePickupAddressChange(index, 'components', {
                  street: address.street || "",
                  city: address.city || "",
                  state: address.state || "",
                  zipCode
                });
              }}
              placeholder="12345"
              maxLength={10}
              className="bg-black border-nextplate-lightgray text-white"
            />
          </div>
        </div>
      </div>
      
      {deliveryOptionsErrors.pickupAddressesEmpty && !address.address.trim() && (
        <p className="text-xs text-red-500 mt-1 flex items-center">
          <AlertCircle size={12} className="mr-1" /> Complete address is required
        </p>
      )}
    </div>
  );
};

export default PickupAddressForm;
