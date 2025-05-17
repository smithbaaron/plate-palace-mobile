
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
import { Package, MapPin, CalendarCheck } from "lucide-react";

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
  
  // Delivery options
  const [offerPickup, setOfferPickup] = useState(true);
  const [offerDelivery, setOfferDelivery] = useState(false);
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryZipCodes, setDeliveryZipCodes] = useState("");
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?type=seller");
    }
  }, [isAuthenticated, navigate]);
  
  const handleNextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };
  
  const handlePreviousStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };
  
  const handleCompletion = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would save the seller data to a database
      console.log("Seller data:", {
        businessName, bio, phoneNumber,
        offerPickup, offerDelivery, 
        pickupAddress, deliveryZipCodes
      });
      
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
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress steps */}
          <div className="flex justify-between mb-8">
            <div className={`flex-1 text-center ${step >= 1 ? "text-nextplate-orange" : "text-gray-500"}`}>
              <div className={`h-8 w-8 rounded-full ${step >= 1 ? "bg-nextplate-orange" : "bg-gray-700"} mx-auto mb-2 flex-center`}>
                <span className="text-white">1</span>
              </div>
              <span className="text-sm">Basic Info</span>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? "text-nextplate-orange" : "text-gray-500"}`}>
              <div className={`h-8 w-8 rounded-full ${step >= 2 ? "bg-nextplate-orange" : "bg-gray-700"} mx-auto mb-2 flex-center`}>
                <span className="text-white">2</span>
              </div>
              <span className="text-sm">Delivery Options</span>
            </div>
            <div className={`flex-1 text-center ${step >= 3 ? "text-nextplate-orange" : "text-gray-500"}`}>
              <div className={`h-8 w-8 rounded-full ${step >= 3 ? "bg-nextplate-orange" : "bg-gray-700"} mx-auto mb-2 flex-center`}>
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
                    <label className="block text-sm font-medium mb-1">Store Name</label>
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your kitchen or business name"
                      className="bg-black border-nextplate-lightgray text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">This is how customers will find your store</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell customers about your food style, specialties, etc."
                      className="bg-black border-nextplate-lightgray text-white min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Phone</label>
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Phone number for customers to contact you"
                      className="bg-black border-nextplate-lightgray text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleNextStep}
                    className="bg-nextplate-orange hover:bg-orange-600"
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
                        onCheckedChange={(checked) => setOfferPickup(!!checked)}
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
                        onCheckedChange={(checked) => setOfferDelivery(!!checked)} 
                        className="border-nextplate-orange text-nextplate-orange"
                      />
                      <label htmlFor="delivery" className="ml-2 text-sm">
                        Offer delivery
                      </label>
                    </div>
                  </div>
                  
                  {offerPickup && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-medium mb-1">Pickup Address</label>
                      <Textarea
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="Where will customers pick up their food?"
                        className="bg-black border-nextplate-lightgray text-white"
                      />
                    </div>
                  )}
                  
                  {offerDelivery && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-medium mb-1">Delivery Area</label>
                      <Textarea
                        value={deliveryZipCodes}
                        onChange={(e) => setDeliveryZipCodes(e.target.value)}
                        placeholder="List ZIP codes or neighborhoods where you deliver"
                        className="bg-black border-nextplate-lightgray text-white"
                      />
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
                    disabled={!offerPickup && !offerDelivery}
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
                  <div className="w-20 h-20 mx-auto bg-nextplate-orange rounded-full flex-center mb-6">
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
