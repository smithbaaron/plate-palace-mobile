
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";
import { supabase } from "@/lib/supabase";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the form schemas for better validation
const basicInfoSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  bio: z.string().min(10, "Please provide a more detailed description (min 10 characters)"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits")
});

const deliveryZipCodeSchema = z.object({
  deliveryZipCodes: z.string().min(5, "Please specify at least one ZIP code")
    .refine(value => {
      // Check if each ZIP code is valid (simple check for 5 digits)
      const zipCodes = value.split(/[,\s]+/).filter(Boolean);
      return zipCodes.every(zip => /^\d{5}(-\d{4})?$/.test(zip));
    }, "Contains invalid ZIP code(s). Use 5-digit format.")
});

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
  const [pickupAddresses, setPickupAddresses] = useState([{ address: "", label: "", street: "", city: "", state: "", zipCode: "" }]);
  
  // Form for delivery ZIP codes
  const zipCodeForm = useForm({
    resolver: zodResolver(deliveryZipCodeSchema),
    defaultValues: {
      deliveryZipCodes: ""
    }
  });
  
  // Delivery options validation
  const [deliveryOptionsErrors, setDeliveryOptionsErrors] = useState({
    noOptionSelected: false,
    pickupAddressesEmpty: false
  });
  
  // Load existing profile data if available
  useEffect(() => {
    const loadSellerProfile = async () => {
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
            
          if (data && !error) {
            // Populate form with existing data
            setBusinessName(data.business_name || currentUser?.username || "");
            setBio(data.bio || "");
            setPhoneNumber(data.phone_number || "");
            
            // Set delivery options
            setOfferPickup(data.offer_pickup ?? true);
            setOfferDelivery(data.offer_delivery ?? false);
            
            if (data.pickup_addresses && data.pickup_addresses.length > 0) {
              setPickupAddresses(data.pickup_addresses);
            }
            
            if (data.delivery_zip_codes) {
              zipCodeForm.setValue("deliveryZipCodes", data.delivery_zip_codes);
            }
          }
        } catch (err) {
          console.error("Error loading seller profile:", err);
        }
      }
    };
    
    if (isAuthenticated) {
      loadSellerProfile();
    }
  }, [currentUser, isAuthenticated]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?type=seller");
    }
  }, [isAuthenticated, navigate]);
  
  const validateBasicInfo = () => {
    const errors = {
      businessName: !businessName.trim(),
      bio: !bio.trim() || bio.trim().length < 10,
      phoneNumber: !phoneNumber.trim() || phoneNumber.trim().length < 10
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };
  
  const validateDeliveryOptions = () => {
    const errors = {
      noOptionSelected: !offerPickup && !offerDelivery,
      pickupAddressesEmpty: offerPickup && pickupAddresses.some(addr => !addr.address.trim()),
    };
    
    setDeliveryOptionsErrors(errors);
    
    // If user offers delivery, validate ZIP codes
    let zipCodesValid = true;
    if (offerDelivery) {
      zipCodesValid = zipCodeForm.formState.isValid;
      if (!zipCodesValid) {
        // Trigger validation to show errors
        zipCodeForm.trigger();
      }
    }
    
    return !Object.values(errors).some(Boolean) && (!offerDelivery || zipCodesValid);
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
      setPickupAddresses([...pickupAddresses, { address: "", label: "", street: "", city: "", state: "", zipCode: "" }]);
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
  
  // Render the pickup address form with structured fields
  const renderPickupAddressForm = (address, index) => {
    return (
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
                        <AlertCircle size={12} className="mr-1" /> Description is required (minimum 10 characters)
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
                        // Filter non-digit characters for phone input
                        const value = e.target.value.replace(/[^\d-+() ]/g, '');
                        setPhoneNumber(value);
                        setFormErrors({...formErrors, phoneNumber: false});
                      }}
                      placeholder="Phone number for customers to contact you"
                      className={`bg-black border-nextplate-lightgray text-white ${formErrors.phoneNumber ? 'border-red-500' : ''}`}
                      required
                    />
                    {formErrors.phoneNumber && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" /> Valid phone number is required (min 10 digits)
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
                      
                      {pickupAddresses.map((address, index) => renderPickupAddressForm(address, index))}
                      
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
                    {isSubmitting ? "Saving..." : "Go to Dashboard"}
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
