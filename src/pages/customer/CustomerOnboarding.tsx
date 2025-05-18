
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Search, Check, User } from "lucide-react";

// Mock seller data
const MOCK_SELLERS = [
  { id: "seller1", username: "tasteofhome", name: "Taste of Home", bio: "Homestyle comfort food with a modern twist" },
  { id: "seller2", username: "healthymeals", name: "Healthy Meals", bio: "Nutritious meal prep packages for busy professionals" },
  { id: "seller3", username: "spicekitchen", name: "Spice Kitchen", bio: "Authentic Indian and Pakistani cuisine" },
  { id: "seller4", username: "pastaparadise", name: "Pasta Paradise", bio: "Fresh handmade pasta and Italian classics" },
];

const CustomerOnboarding = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { completeOnboarding } = useUserType();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerSearch, setSellerSearch] = useState("");
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  
  // Load existing customer preferences if available
  useEffect(() => {
    const loadCustomerProfile = async () => {
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase
            .from('customer_profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
            
          if (data && !error) {
            // Populate form with existing data
            if (data.followed_sellers) {
              setSelectedSellers(data.followed_sellers);
            }
          }
        } catch (err) {
          console.error("Error loading customer profile:", err);
        }
      }
    };
    
    if (isAuthenticated) {
      loadCustomerProfile();
    }
  }, [currentUser, isAuthenticated]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?type=customer");
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
  
  const handleSellerSelect = (sellerId: string) => {
    if (selectedSellers.includes(sellerId)) {
      setSelectedSellers(selectedSellers.filter(id => id !== sellerId));
    } else {
      setSelectedSellers([...selectedSellers, sellerId]);
    }
  };
  
  const handleCompletion = async () => {
    if (!currentUser?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to complete setup.",
        variant: "destructive",
      });
      navigate('/auth?type=customer');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save customer profile data to Supabase
      const customerData = {
        user_id: currentUser.id,
        followed_sellers: selectedSellers,
        created_at: new Date().toISOString()
      };
      
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();
      
      let error;
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('customer_profiles')
          .update({
            followed_sellers: selectedSellers,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentUser.id);
          
        error = updateError;
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('customer_profiles')
          .insert([customerData]);
          
        error = insertError;
      }
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Mark onboarding as complete
      await completeOnboarding();
      
      toast({
        title: "Setup complete!",
        description: "Your customer account is ready to go.",
      });
      
      navigate("/customer/dashboard");
    } catch (error) {
      console.error("Error saving customer profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem completing your setup.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter sellers based on search term
  const filteredSellers = MOCK_SELLERS.filter(seller => 
    seller.username.toLowerCase().includes(sellerSearch.toLowerCase()) ||
    seller.name.toLowerCase().includes(sellerSearch.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress steps */}
          <div className="flex justify-between mb-8">
            <div className={`flex-1 text-center ${step >= 1 ? "text-nextplate-red" : "text-gray-500"}`}>
              <div className={`h-8 w-8 rounded-full ${step >= 1 ? "bg-nextplate-red" : "bg-gray-700"} mx-auto mb-2 flex-center`}>
                <span className="text-white">1</span>
              </div>
              <span className="text-sm">Find Sellers</span>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? "text-nextplate-red" : "text-gray-500"}`}>
              <div className={`h-8 w-8 rounded-full ${step >= 2 ? "bg-nextplate-red" : "bg-gray-700"} mx-auto mb-2 flex-center`}>
                <span className="text-white">2</span>
              </div>
              <span className="text-sm">Complete</span>
            </div>
          </div>
          
          <div className="bg-nextplate-darkgray rounded-xl p-6 shadow-xl">
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Search className="mr-2 text-nextplate-red" />
                  Find Your Favorite Food Sellers
                </h2>
                
                <div className="space-y-6">
                  <p className="text-gray-300">
                    Search for food sellers by username or store name to add them to your favorites.
                  </p>
                  
                  <div>
                    <Input
                      value={sellerSearch}
                      onChange={(e) => setSellerSearch(e.target.value)}
                      placeholder="Search by username or store name"
                      className="bg-black border-nextplate-lightgray text-white"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-3">
                      {sellerSearch ? "Search Results" : "Popular Sellers"}
                    </h3>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {filteredSellers.map(seller => (
                        <div 
                          key={seller.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            selectedSellers.includes(seller.id)
                              ? "bg-nextplate-red bg-opacity-20 border border-nextplate-red"
                              : "bg-black hover:bg-opacity-70"
                          }`}
                          onClick={() => handleSellerSelect(seller.id)}
                        >
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-nextplate-red flex-center mr-3">
                              <User size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{seller.name}</p>
                              <p className="text-sm text-gray-400">@{seller.username}</p>
                            </div>
                            {selectedSellers.includes(seller.id) && (
                              <div className="h-6 w-6 rounded-full bg-nextplate-red flex-center">
                                <Check size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 mt-1 ml-13">{seller.bio}</p>
                        </div>
                      ))}
                      
                      {filteredSellers.length === 0 && (
                        <div className="text-center py-6 text-gray-400">
                          No sellers found matching "{sellerSearch}"
                        </div>
                      )}
                    </div>
                    
                    {selectedSellers.length > 0 && (
                      <div className="mt-4 text-sm text-nextplate-red">
                        {selectedSellers.length} {selectedSellers.length === 1 ? "seller" : "sellers"} added to your favorites
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleNextStep}
                    className="bg-nextplate-red hover:bg-red-600"
                  >
                    {selectedSellers.length > 0 ? "Continue" : "Skip for now"}
                  </Button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Check className="mr-2 text-nextplate-red" />
                  Ready to Order!
                </h2>
                
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-nextplate-red rounded-full flex-center mb-6">
                    <User size={40} className="text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4">Your NextPlate account is set up!</h3>
                  <p className="text-gray-300 mb-6">
                    {selectedSellers.length > 0
                      ? `You're following ${selectedSellers.length} ${
                          selectedSellers.length === 1 ? "seller" : "sellers"
                        }. You can now browse their menus and order delicious food.`
                      : "You're ready to start exploring and ordering delicious food from local sellers."}
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
                    className="bg-nextplate-red hover:bg-red-600"
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

export default CustomerOnboarding;
