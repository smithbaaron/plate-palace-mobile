
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import OnboardingSteps from "./onboarding/OnboardingSteps";
import BasicInfoStep from "./onboarding/BasicInfoStep";
import DeliveryOptionsStep from "./onboarding/DeliveryOptionsStep";
import FinalStep from "./onboarding/FinalStep";
import { useSellerProfile } from "./onboarding/hooks/useSellerProfile";
import { useOnboardingHandlers } from "./onboarding/hooks/useOnboardingHandlers";

const SellerOnboarding = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Load seller profile data and state
  const {
    businessName,
    setBusinessName,
    bio,
    setBio,
    phoneNumber,
    setPhoneNumber,
    formErrors,
    setFormErrors,
    offerPickup,
    offerDelivery,
    pickupAddresses,
    setPickupAddresses,
    zipCodeForm,
    deliveryOptionsErrors,
    setDeliveryOptionsErrors,
    setOfferPickup,
    setOfferDelivery
  } = useSellerProfile();
  
  // Setup handlers for steps and form submission
  const {
    step,
    isSubmitting,
    handleNextStep,
    handlePreviousStep,
    handleAddPickupAddress,
    handleRemovePickupAddress,
    handlePickupAddressChange,
    handleDeliveryOptionChange,
    handleCompletion
  } = useOnboardingHandlers({
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
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?type=seller");
    }
  }, [isAuthenticated, navigate]);
  
  // Check if all required fields are filled
  const isBasicInfoComplete = businessName.trim() && bio.trim() && phoneNumber.trim();
  
  // Check if delivery options are valid
  const isDeliveryOptionsValid = (offerPickup || offerDelivery) && 
    (!offerPickup || (offerPickup && !pickupAddresses.some(addr => !addr.address.trim()))) &&
    (!offerDelivery || zipCodeForm.formState.isValid);
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress steps */}
          <OnboardingSteps currentStep={step} />
          
          <div className="bg-nextplate-darkgray rounded-xl p-6 shadow-xl">
            {step === 1 && (
              <BasicInfoStep 
                businessName={businessName}
                setBusinessName={setBusinessName}
                bio={bio}
                setBio={setBio}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
                handleNextStep={handleNextStep}
                isBasicInfoComplete={isBasicInfoComplete}
              />
            )}
            
            {step === 2 && (
              <DeliveryOptionsStep
                offerPickup={offerPickup}
                offerDelivery={offerDelivery}
                handleDeliveryOptionChange={handleDeliveryOptionChange}
                deliveryOptionsErrors={deliveryOptionsErrors}
                pickupAddresses={pickupAddresses}
                handleAddPickupAddress={handleAddPickupAddress}
                handleRemovePickupAddress={handleRemovePickupAddress}
                handlePickupAddressChange={handlePickupAddressChange}
                zipCodeForm={zipCodeForm}
                handlePreviousStep={handlePreviousStep}
                handleNextStep={handleNextStep}
                isDeliveryOptionsValid={isDeliveryOptionsValid}
              />
            )}
            
            {step === 3 && (
              <FinalStep
                handlePreviousStep={handlePreviousStep}
                handleCompletion={handleCompletion}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOnboarding;
