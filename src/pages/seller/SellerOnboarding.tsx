
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Package, MapPin, CalendarCheck, Plus, Trash2, AlertCircle } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const SellerOnboarding = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { completeOnboarding } = useUserType();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Seller information
  const [businessName, setBusinessName] = useState(currentUser?.username || "");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    businessName: false,
    bio: false,
    phoneNumber: false
  });
  
  // Delivery options
  const [offerPickup, setOfferPickup] = useState(true);
  const [offerDelivery, setOfferDelivery] = useState(false);
  const [pickupAddresses, setPickupAddresses] = useState([{ address: "", label: "" }]);
  const [deliveryZipCodes, setDeliveryZipCodes] = useState("");
  
  // Delivery options validation
  const [deliveryOptionsErrors, setDeliveryOptionsErrors] = useState({
    noOptionSelected: false,
    pickupAddressesEmpty: false,
    deliveryZipCodesEmpty: false
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?type=seller");
    }
  }, [isAuthenticated, navigate]);
  
  const validateBasicInfo = () => {
    const errors = {
      businessName: !businessName.trim(),
      bio: !bio.trim(),
      phoneNumber: !phoneNumber.trim()
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };
  
  const validateDeliveryOptions = () => {
    const errors = {
      noOptionSelected: !offerPickup && !offerDelivery,
      pickupAddressesEmpty: offerPickup && pickupAddresses.some(addr => !addr.address.trim()),
      deliveryZipCodesEmpty: offerDelivery && !deliveryZipCodes.trim()
    };
    
    setDeliveryOptionsErrors(errors);
    return !Object.values(errors).some(Boolean);
  };
  
  const handleNextStep = () => {
    if (step === 1 && !validateBasicInfo()) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && !validateDeliveryOptions()) {
      toast({
        title: "Delivery Options Required",
        description: "Please select at least one delivery option and provide the required information.",
        variant: "destructive",
      });
      return;
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
      setPickupAddresses([...pickupAddresses, { address: "", label: "" }]);
    } else {
      toast({
        title: "Maximum reached",
        description: "You can have up to 5 pickup locations.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePickupAddress = (index) => {
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

  const handlePickupAddressChange = (index, field, value) => {
    const newAddresses = [...pickupAddresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setPickupAddresses(newAddresses);
    
    // Clear error when user starts typing
    if (deliveryOptionsErrors.pickupAddressesEmpty) {
      setDeliveryOptionsErrors({
        ...deliveryOptionsErrors,
        pickupAddressesEmpty: false
      });
    }
  };
  
  const handleDeliveryZipCodesChange = (e) => {
    setDeliveryZipCodes(e.target.value);
    
    // Clear error when user starts typing
    if (deliveryOptionsErrors.deliveryZipCodesEmpty) {
      setDeliveryOptionsErrors({
        ...deliveryOptionsErrors,
        deliveryZipCodesEmpty: false
      });
    }
  };
  
  const handleDeliveryOptionChange = (option, value) => {
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
    setIsSubmitting(true);
    
    try {
      // In a real app, this would save the seller data to a database
      console.log("Seller data:", {
        businessName, 
        bio, 
        phoneNumber,
        offerPickup, 
        offerDelivery, 
        pickupAddresses, 
        deliveryZipCodes
      });
      
      // Save pickup addresses to localStorage for settings page
      localStorage.setItem("pickupAddresses", JSON.stringify(pickupAddresses));
      
      // Mark onboarding as complete
      completeOnboarding();
      
      toast({
        title: "Setup complete!",
        description: "Your seller account is ready to go.",
      });
      
      navigate("/seller/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem completing your setup.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if all required fields are filled
  const isBasicInfoComplete = businessName.trim() && bio.trim() && phoneNumber.trim();
  
  // Check if delivery options are valid
  const isDeliveryOptionsValid = (offerPickup || offerDelivery) && 
    (!offerPickup || (offerPickup && !pickupAddresses.some(addr => !addr.address.trim()))) &&
    (!offerDelivery || (offerDelivery && deliveryZipCodes.trim() !== ""));
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress steps */}
          <div className="flex justify-between mb-8">
            <div className={`flex-1 text-center ${step >= 1 ? "text-nextplate-orange" : "text-gray-500"}`}>
              <div className={`h-8 w-8 rounded-full ${step >= 1 ? "bg-nextplate-orange" : "bg-gray-700"} mx-auto mb-2 flex items-center justify-center`}>
                <span className="text-white">1</span>
              </div>
              <span className="text-sm">Basic Info</span>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? "text-nextplate-orange" : "text-gray-500"}`}>
              <div className={`h-8 w-8 rounded-full ${step >= 2 ? "bg-nextplate-orange" : "bg-gray-700"} mx-auto mb-2 flex items-center justify-center`}>
                <span className="text-white">2</span>
              </div>
              <span className="text-sm">Delivery Options</span>
            </div>
            <div className={`flex-1 text-center ${step >= 3 ? "text-nextplate-orange" : "text-gray-500"}`}>
              <div className={`h-8 w-8 rounded-full ${step >= 3 ? "bg-nextplate-orange" : "bg-gray-700"} mx-auto mb-2 flex items-center justify-center`}>
                <span className="text-white">3</span>
              </div>
              <span className="text-sm">Complete</span>
            </div>
          </div>
          
          <div className="bg-nextplate-darkgray rounded-xl p-6 shadow-xl">
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Package className="mr-2 text-nextplate-orange" />
                  Basic Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Store Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        setFormErrors({...formErrors, businessName: false});
                      }}
                      placeholder="Your kitchen or business name"
                      className={`bg-black border-nextplate-lightgray text-white ${formErrors.businessName ? 'border-red-500' : ''}`}
                      required
                    />
                    {formErrors.businessName && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" /> Store name is required
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">This is how customers will find your store</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={bio}
                      onChange={(e) => {
                        setBio(e.target.value);
                        setFormErrors({...formErrors, bio: false});
                      }}
                      placeholder="Tell customers about your food style, specialties, etc."
                      className={`bg-black border-nextplate-lightgray text-white min-h-[100px] ${formErrors.bio ? 'border-red-500' : ''}`}
                      required
                    />
                    {formErrors.bio && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" /> Description is required
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setFormErrors({...formErrors, phoneNumber: false});
                      }}
                      placeholder="Phone number for customers to contact you"
                      className={`bg-black border-nextplate-lightgray text-white ${formErrors.phoneNumber ? 'border-red-500' : ''}`}
                      required
                    />
                    {formErrors.phoneNumber && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" /> Contact phone is required
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleNextStep}
                    className="bg-nextplate-orange hover:bg-orange-600"
                    disabled={!isBasicInfoComplete}
                  >
                    Next: Delivery Options
                  </Button>
                </div>
              </div>
            )}
            
            {step === 2 && (
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
                        <div key={index} className="space-y-2 bg-black bg-opacity-30 p-3 rounded-md">
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
                            <label className="block text-xs text-gray-400 mb-1">Full Address <span className="text-red-500">*</span></label>
                            <Textarea
                              value={address.address}
                              onChange={(e) => handlePickupAddressChange(index, 'address', e.target.value)}
                              placeholder="Enter the full address for pickup"
                              className={`bg-black border-nextplate-lightgray text-white ${
                                deliveryOptionsErrors.pickupAddressesEmpty && !address.address.trim() ? 'border-red-500' : ''
                              }`}
                              rows={2}
                            />
                            {deliveryOptionsErrors.pickupAddressesEmpty && !address.address.trim() && (
                              <p className="text-xs text-red-500 mt-1 flex items-center">
                                <AlertCircle size={12} className="mr-1" /> Address is required
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <p className="text-xs text-gray-400 mt-1">
                        You'll be able to select which locations are available for each pickup time slot.
                      </p>
                    </div>
                  )}
                  
                  {offerDelivery && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-medium mb-1">Delivery Area <span className="text-red-500">*</span></label>
                      <Textarea
                        value={deliveryZipCodes}
                        onChange={handleDeliveryZipCodesChange}
                        placeholder="List ZIP codes or neighborhoods where you deliver"
                        className={`bg-black border-nextplate-lightgray text-white ${
                          deliveryOptionsErrors.deliveryZipCodesEmpty ? 'border-red-500' : ''
                        }`}
                      />
                      {deliveryOptionsErrors.deliveryZipCodesEmpty && (
                        <p className="text-xs text-red-500 mt-1 flex items-center">
                          <AlertCircle size={12} className="mr-1" /> Delivery area is required
                        </p>
                      )}
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
            )}
            
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <CalendarCheck className="mr-2 text-nextplate-orange" />
                  Ready to Start Selling!
                </h2>
                
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-nextplate-orange rounded-full flex items-center justify-center mb-6">
                    <Package size={40} className="text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4">Your NextPlate seller account is set up!</h3>
                  <p className="text-gray-300 mb-6">
                    You're ready to start creating your menu and selling to customers.
                    Your next step is to add plates or meal prep packages to your menu.
                  </p>
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
                    onClick={handleCompletion}
                    className="bg-nextplate-orange hover:bg-orange-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Completing..." : "Go to Dashboard"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOnboarding;
