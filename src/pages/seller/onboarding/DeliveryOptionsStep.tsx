
import React from "react";
import { MapPin, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import PickupAddressForm from "./PickupAddressForm";
import { UseFormReturn } from "react-hook-form";

interface PickupAddress {
  address: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface DeliveryOptionsStepProps {
  offerPickup: boolean;
  offerDelivery: boolean;
  handleDeliveryOptionChange: (option: string, value: boolean) => void;
  deliveryOptionsErrors: {
    noOptionSelected: boolean;
    pickupAddressesEmpty: boolean;
  };
  pickupAddresses: PickupAddress[];
  handleAddPickupAddress: () => void;
  handleRemovePickupAddress: (index: number) => void;
  handlePickupAddressChange: (index: number, field: string, value: string | any) => void;
  zipCodeForm: UseFormReturn<{ deliveryZipCodes: string }, any>;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
  isDeliveryOptionsValid: boolean;
}

const DeliveryOptionsStep: React.FC<DeliveryOptionsStepProps> = ({
  offerPickup,
  offerDelivery,
  handleDeliveryOptionChange,
  deliveryOptionsErrors,
  pickupAddresses,
  handleAddPickupAddress,
  handleRemovePickupAddress,
  handlePickupAddressChange,
  zipCodeForm,
  handlePreviousStep,
  handleNextStep,
  isDeliveryOptionsValid
}) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <MapPin className="mr-2 text-nextplate-orange" />
        Delivery Options
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">How will customers get their food?</h3>
          
          <div className="flex items-center mb-3">
            <Checkbox 
              id="pickup"
              checked={offerPickup} 
              onCheckedChange={(checked) => handleDeliveryOptionChange('pickup', !!checked)}
              className="border-nextplate-orange text-nextplate-orange"
            />
            <label htmlFor="pickup" className="ml-2 text-sm">
              Offer pickup
            </label>
          </div>
          
          <div className="flex items-center">
            <Checkbox 
              id="delivery"
              checked={offerDelivery} 
              onCheckedChange={(checked) => handleDeliveryOptionChange('delivery', !!checked)} 
              className="border-nextplate-orange text-nextplate-orange"
            />
            <label htmlFor="delivery" className="ml-2 text-sm">
              Offer delivery
            </label>
          </div>
          
          {deliveryOptionsErrors.noOptionSelected && (
            <p className="text-xs text-red-500 mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" /> Please select at least one delivery option
            </p>
          )}
        </div>
        
        {offerPickup && (
          <div className="animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">Pickup Locations (up to 5)</label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddPickupAddress}
                disabled={pickupAddresses.length >= 5}
                className="border-nextplate-orange text-nextplate-orange hover:bg-nextplate-orange hover:text-white"
              >
                <Plus size={16} className="mr-1" /> Add Location
              </Button>
            </div>
            
            {pickupAddresses.map((address, index) => (
              <PickupAddressForm
                key={index}
                address={address}
                index={index}
                handleRemovePickupAddress={handleRemovePickupAddress}
                handlePickupAddressChange={handlePickupAddressChange}
                deliveryOptionsErrors={deliveryOptionsErrors}
                pickupAddresses={pickupAddresses}
              />
            ))}
            
            <p className="text-xs text-gray-400 mt-1">
              You'll be able to select which locations are available for each pickup time slot.
            </p>
          </div>
        )}
        
        {offerDelivery && (
          <div className="animate-fade-in">
            <Form {...zipCodeForm}>
              <form>
                <FormField
                  control={zipCodeForm.control}
                  name="deliveryZipCodes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery ZIP Codes <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter ZIP codes separated by commas (e.g., 90210, 90211)"
                          className="bg-black border-nextplate-lightgray text-white"
                          onChange={(e) => {
                            // Allow only digits, commas, spaces, hyphens
                            const value = e.target.value.replace(/[^\d,\s-]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-400 mt-1">
                        List all ZIP codes where you offer delivery, separated by commas
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button
          onClick={handlePreviousStep}
          variant="outline"
          className="border-nextplate-lightgray text-white hover:bg-nextplate-lightgray"
        >
          Back
        </Button>
        <Button
          onClick={handleNextStep}
          className="bg-nextplate-orange hover:bg-orange-600"
          disabled={!isDeliveryOptionsValid}
        >
          Next: Complete Setup
        </Button>
      </div>
    </div>
  );
};

export default DeliveryOptionsStep;
