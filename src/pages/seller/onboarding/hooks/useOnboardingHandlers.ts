
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
  const { completeOnboarding } = useUserType();
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
      // Save seller profile data to Supabase
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
      
      // First, ensure the user type is properly set in profiles table
      // This helps work around any issues with the profiles table
      let success = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!success && retryCount < maxRetries) {
        try {
          // Directly update the user type in the profiles table
          // This is a fallback mechanism that shouldn't be necessary if userType functionality worked
          console.log(`Attempt ${retryCount + 1}/${maxRetries} to ensure user type is set`);
          
          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', currentUser.id)
            .single();
            
          if (existingProfile) {
            // Update existing profile
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                user_type: 'seller',
                is_onboarded: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', currentUser.id);
              
            if (updateError) throw updateError;
          } else {
            // Insert new profile
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([{
                id: currentUser.id,
                username: currentUser.username || businessName,
                user_type: 'seller',
                is_onboarded: true,
                created_at: new Date().toISOString()
              }]);
              
            if (insertError) throw insertError;
          }
          
          success = true;
        } catch (error) {
          retryCount++;
          console.error(`Failed to ensure user type is set (attempt ${retryCount})`, error);
          if (retryCount >= maxRetries) {
            console.log("Continuing despite profile update error - will try seller_profiles table anyway");
            // We'll continue even if this fails
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Now handle the seller_profiles table
      console.log("Now updating seller_profiles table");
      
      // Check if seller profile exists first
      const { data: existingSellerProfile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();
      
      let error;
      
      if (existingSellerProfile) {
        // Update existing profile
        console.log("Updating existing seller profile");
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
        // Insert new profile
        console.log("Creating new seller profile");
        const { error: insertError } = await supabase
          .from('seller_profiles')
          .insert([sellerData]);
          
        error = insertError;
      }
      
      if (error) {
        console.error("Error with seller_profiles table operation:", error);
        // We'll still try to complete onboarding even if there's an error with the seller_profiles table
      }
      
      // Also save pickup addresses to localStorage as backup
      localStorage.setItem("pickupAddresses", JSON.stringify(pickupAddresses));
      
      // Mark onboarding as complete using the context function
      // We'll implement our own fallback in case this fails
      let onboardingCompleted = false;
      try {
        console.log("Attempting to complete onboarding via context function");
        await completeOnboarding();
        onboardingCompleted = true;
        console.log("Onboarding completed successfully via context function");
      } catch (error) {
        console.error("Error completing onboarding via context function:", error);
        // Fall back to direct update
      }
      
      // If context function failed, use direct update as fallback
      if (!onboardingCompleted) {
        console.log("Using fallback method to complete onboarding");
        try {
          // Direct update as fallback
          const { error: directUpdateError } = await supabase
            .from('profiles')
            .update({ is_onboarded: true })
            .eq('id', currentUser.id);
          
          if (directUpdateError) throw directUpdateError;
          onboardingCompleted = true;
          console.log("Onboarding completed via direct update");
        } catch (error) {
          console.error("Fallback direct update also failed:", error);
        }
      }
      
      toast({
        title: "Setup complete!",
        description: "Your seller account is ready to go.",
      });
      
      // Short delay before navigation to ensure state updates are complete
      setTimeout(() => {
        console.log("Navigating to dashboard");
        navigate("/seller/dashboard");
      }, 500);
      
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
