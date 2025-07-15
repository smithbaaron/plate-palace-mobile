
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { validateBasicInfo, validateDeliveryOptions } from "../utils/validation";
import { UseFormReturn } from "react-hook-form";

interface PickupAddress {
  address: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface OnboardingHandlersProps {
  businessName: string;
  bio: string;
  phoneNumber: string;
  setFormErrors: React.Dispatch<React.SetStateAction<{
    businessName: boolean;
    bio: boolean;
    phoneNumber: boolean;
  }>>;
  offerPickup: boolean;
  offerDelivery: boolean;
  setOfferPickup: React.Dispatch<React.SetStateAction<boolean>>;
  setOfferDelivery: React.Dispatch<React.SetStateAction<boolean>>;
  pickupAddresses: PickupAddress[];
  setPickupAddresses: React.Dispatch<React.SetStateAction<PickupAddress[]>>;
  zipCodeForm: UseFormReturn<{ deliveryZipCodes: string }, any>;
  deliveryOptionsErrors: {
    noOptionSelected: boolean;
    pickupAddressesEmpty: boolean;
  };
  setDeliveryOptionsErrors: React.Dispatch<React.SetStateAction<{
    noOptionSelected: boolean;
    pickupAddressesEmpty: boolean;
  }>>;
}

export const useOnboardingHandlers = ({
  businessName,
  bio,
  phoneNumber,
  setFormErrors,
  offerPickup,
  offerDelivery,
  setOfferPickup,
  setOfferDelivery,
  pickupAddresses,
  setPickupAddresses,
  zipCodeForm,
  deliveryOptionsErrors,
  setDeliveryOptionsErrors
}: OnboardingHandlersProps) => {
  const { currentUser } = useAuth();
  const { completeOnboarding, resyncUserTypeData } = useUserType();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleNextStep = () => {
    if (step === 1) {
      const { errors, isValid } = validateBasicInfo(businessName, bio, phoneNumber);
      setFormErrors(errors);
      
      if (!isValid) {
        toast({
          title: "Required Fields",
          description: "Please fill in all required fields before proceeding.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (step === 2) {
      const { errors, isValid } = validateDeliveryOptions(
        offerPickup, 
        offerDelivery, 
        pickupAddresses, 
        zipCodeForm.formState.isValid
      );
      
      setDeliveryOptionsErrors(errors);
      
      if (!isValid) {
        toast({
          title: "Delivery Options Required",
          description: "Please select at least one delivery option and provide the required information.",
          variant: "destructive",
        });
        
        if (offerDelivery && !zipCodeForm.formState.isValid) {
          zipCodeForm.trigger();
        }
        
        return;
      }
    }
    
    setStep(step + 1);
    window.scrollTo(0, 0);
  };
  
  const handlePreviousStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };
  
  const handleAddPickupAddress = () => {
    if (pickupAddresses.length < 5) {
      setPickupAddresses([...pickupAddresses, { address: "", label: "", street: "", city: "", state: "", zipCode: "" }]);
    } else {
      toast({
        title: "Maximum reached",
        description: "You can have up to 5 pickup locations.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePickupAddress = (index: number) => {
    if (pickupAddresses.length > 1) {
      const newAddresses = [...pickupAddresses];
      newAddresses.splice(index, 1);
      setPickupAddresses(newAddresses);
    } else {
      toast({
        description: "You need at least one pickup location.",
      });
    }
  };

  const handlePickupAddressChange = (index: number, field: string, value: any) => {
    const newAddresses = [...pickupAddresses];
    
    if (field === 'address') {
      newAddresses[index] = { ...newAddresses[index], [field]: value };
    } else if (field === 'components') {
      // Update structured components and regenerate full address
      const { street, city, state, zipCode } = value;
      const fullAddress = `${street}, ${city}, ${state} ${zipCode}`;
      newAddresses[index] = { 
        ...newAddresses[index], 
        address: fullAddress,
        street,
        city,
        state,
        zipCode
      };
    } else {
      newAddresses[index] = { ...newAddresses[index], [field]: value };
    }
    
    setPickupAddresses(newAddresses);
    
    // Clear error when user starts typing
    if (deliveryOptionsErrors.pickupAddressesEmpty) {
      setDeliveryOptionsErrors({
        ...deliveryOptionsErrors,
        pickupAddressesEmpty: false
      });
    }
  };
  
  const handleDeliveryOptionChange = (option: string, value: boolean) => {
    if (option === 'pickup') {
      setOfferPickup(value);
    } else {
      setOfferDelivery(value);
    }
    
    // Clear the no option selected error if at least one option is selected
    if (deliveryOptionsErrors.noOptionSelected && (
      (option === 'pickup' && value) || 
      (option === 'delivery' && value) || 
      (option === 'pickup' && !value && offerDelivery) || 
      (option === 'delivery' && !value && offerPickup)
    )) {
      setDeliveryOptionsErrors({
        ...deliveryOptionsErrors,
        noOptionSelected: false
      });
    }
  };
  
  const handleCompletion = async () => {
    if (!currentUser?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to complete setup.",
        variant: "destructive",
      });
      navigate('/auth?type=seller');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Starting seller onboarding completion process");
      
      const sellerData = {
        user_id: currentUser.id,
        business_name: businessName,
        bio: bio,
        phone_number: phoneNumber,
        offer_pickup: offerPickup,
        offer_delivery: offerDelivery,
        pickup_addresses: pickupAddresses,
        delivery_zip_codes: zipCodeForm.getValues().deliveryZipCodes,
        created_at: new Date().toISOString()
      };
      
      console.log("Saving seller profile data:", sellerData);
      
      // Save to seller_profiles table
      const { data: existingSellerProfile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();
      
      let error;
      
      if (existingSellerProfile) {
        const { error: updateError } = await supabase
          .from('seller_profiles')
          .update({
            business_name: businessName,
            bio: bio,
            phone_number: phoneNumber,
            offer_pickup: offerPickup,
            offer_delivery: offerDelivery,
            pickup_addresses: pickupAddresses,
            delivery_zip_codes: zipCodeForm.getValues().deliveryZipCodes,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentUser.id);
          
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('seller_profiles')
          .insert([sellerData]);
          
        error = insertError;
      }
      
      if (error) {
        console.error("Error with seller_profiles table operation:", error);
        throw error;
      }

      // Update profiles table to mark as onboarded
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          username: currentUser.username || businessName,
          user_type: 'seller',
          is_onboarded: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      console.log("Successfully saved profile data, completing onboarding...");

      // Wait for database to commit the transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Complete onboarding in context
      await completeOnboarding();
      
      // Wait before resyncing to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Resync user data to ensure everything is up to date
      await resyncUserTypeData();
      
      // Final wait to ensure all state is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("Onboarding completed, navigating to dashboard...");
      
      toast({
        title: "Setup complete!",
        description: "Your seller account is ready. You can now add plates to your menu!",
      });
      
      // Use window.location.href to force navigation
      window.location.href = "/seller/dashboard";
      
    } catch (error) {
      console.error("Error saving seller profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem completing your setup.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    isSubmitting,
    handleNextStep,
    handlePreviousStep,
    handleAddPickupAddress,
    handleRemovePickupAddress,
    handlePickupAddressChange,
    handleDeliveryOptionChange,
    handleCompletion
  };
};
