
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Clock, User, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createOrder } from "@/lib/orders-service";
import { useAuth } from "@/context/AuthContext";

// Mock plate data as fallback
const MOCK_PLATE = {
  id: "plate1",
  name: "Chicken Alfredo Pasta",
  description: "Creamy pasta with grilled chicken and parmesan cheese. Made with fresh ingredients and our homemade alfredo sauce that's been perfected over years.",
  price: 12.99,
  seller: "Taste of Home",
  sellerUsername: "tasteofhome",
  seller_id: "mock-seller-id",
  seller_user_id: "mock-seller-user-id",
  image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
  ingredients: "Pasta, chicken, heavy cream, parmesan cheese, butter, garlic, salt, pepper, parsley",
  availableDate: "2025-05-20",
  availableSizes: ["Small", "Medium", "Large"],
  allergies: "Contains: dairy, gluten",
  pickupTime: "5:00 PM - 7:00 PM"
};

const PlateDetails = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [selectedSize, setSelectedSize] = React.useState("Medium");
  const [quantity, setQuantity] = React.useState(1);
  const [plate, setPlate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);
  
  useEffect(() => {
    const fetchPlate = async () => {
      if (!id) {
        setError("No plate ID provided");
        setLoading(false);
        return;
      }

      try {
        // Show mock data immediately for better UX
        setPlate(MOCK_PLATE);
        
        const { data, error } = await supabase
          .from('plates')
          .select(`
            id,
            name,
            price,
            image_url,
            size,
            nutritional_info,
            available_date,
            quantity,
            seller_id,
            seller_profiles!inner (
              id,
              user_id,
              business_name,
              bio
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error("❌ Error fetching plate:", error);
          setError("Plate not found");
          return;
        }

        // Handle both array and object formats for seller_profiles
        const sellerProfile = Array.isArray(data.seller_profiles) 
          ? data.seller_profiles[0] 
          : data.seller_profiles;

        const transformedPlate = {
          id: data.id,
          name: data.name,
          description: data.nutritional_info || "Delicious homemade plate",
          price: data.price,
          seller: sellerProfile?.business_name || "Unknown Seller",
          sellerUsername: sellerProfile?.business_name?.toLowerCase().replace(/\s+/g, '') || "unknown",
          seller_id: data.seller_id,
          seller_user_id: sellerProfile?.user_id,
          image: data.image_url || MOCK_PLATE.image,
          ingredients: "Check with seller for ingredients",
          availableDate: data.available_date,
          availableSizes: ["Small", "Medium", "Large"],
          allergies: "Please check with seller for allergen information",
          pickupTime: "Contact seller for pickup details"
        };

        setPlate(transformedPlate);
      } catch (err) {
        console.error("❌ Error:", err);
        setError("Failed to load plate details");
      } finally {
        setLoading(false);
      }
    };

    fetchPlate();
  }, [id]);
  
  // Use real plate data or fallback to mock data
  const currentPlate = plate || MOCK_PLATE;
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleAddToCart = async () => {
    if (!currentUser) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to place an order.",
        variant: "destructive",
      });
      return;
    }

    if (!plate) {
      toast({
        title: "Error",
        description: "Plate information not available.",
        variant: "destructive",
      });
      return;
    }

    setIsOrdering(true);
    try {
      const unitPrice = sizePrice[selectedSize as keyof typeof sizePrice];
      const totalAmount = unitPrice * quantity;

      console.log('🔍 Order creation data:', {
        customerId: currentUser.id,
        sellerId: plate.seller_user_id,
        plateId: plate.id,
        sellerProfileId: plate.seller_id,
        actualSellerUserId: plate.seller_user_id
      });

      await createOrder({
        customerId: currentUser.id,
        sellerId: plate.seller_user_id || currentPlate.seller_user_id || currentUser.id, // Use the actual user_id
        items: [{
          plateId: plate.id,
          quantity: quantity,
          unitPrice: unitPrice,
        }],
        totalAmount: totalAmount,
        deliveryType: 'pickup', // Default to pickup
        notes: `Size: ${selectedSize}`,
      });

      toast({
        title: "Order placed!",
        description: `${quantity} ${selectedSize} ${currentPlate.name} ordered successfully.`,
      });

      // Navigate to orders page after successful order
      setTimeout(() => {
        navigate('/customer/orders');
      }, 1500);

    } catch (error) {
      console.error('❌ Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOrdering(false);
    }
  };
  
  const sizePrice = {
    Small: currentPlate.price - 2,
    Medium: currentPlate.price,
    Large: currentPlate.price + 3
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pb-20">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading plate details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pb-20">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={handleBack} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navigation />
      
      <div className="pt-16">
        {/* Hero image */}
        <div className="w-full h-64 md:h-96 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img 
            src={currentPlate.image} 
            alt={currentPlate.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-overlay"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
          <div className="bg-nextplate-darkgray rounded-xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                {/* Plate details */}
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-nextplate-red mr-2 flex-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-sm">@{currentPlate.sellerUsername}</span>
                </div>
                
                <h1 className="text-3xl font-bold mb-2">{currentPlate.name}</h1>
                <p className="text-gray-300 mb-6">{currentPlate.description}</p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Ingredients</h3>
                    <p className="text-gray-300">{currentPlate.ingredients}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Allergies</h3>
                    <p className="text-gray-300">{currentPlate.allergies}</p>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="mr-2 text-nextplate-red" size={18} />
                    <div>
                      <span className="block text-sm">Available on {new Date(currentPlate.availableDate).toLocaleDateString()}</span>
                      <span className="block text-sm">Pickup: {currentPlate.pickupTime}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/3 bg-black rounded-lg p-4">
                {/* Order form */}
                <h3 className="text-xl font-bold mb-4">Order Details</h3>
                
                <div className="mb-4">
                  <h4 className="text-sm mb-2">Select Size</h4>
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="grid grid-cols-3 gap-3">
                    {currentPlate.availableSizes.map((size) => (
                      <div key={size} className="flex-center">
                        <RadioGroupItem
                          value={size}
                          id={`size-${size}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`size-${size}`}
                          className="flex flex-col items-center justify-center rounded-md border-2 border-gray-700 bg-nextplate-lightgray px-4 py-2 hover:bg-gray-800 hover:text-white peer-data-[state=checked]:border-nextplate-red peer-data-[state=checked]:text-white cursor-pointer w-full text-center"
                        >
                          {size}
                          <span className="mt-1 font-bold">${sizePrice[size as keyof typeof sizePrice].toFixed(2)}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm mb-2">Quantity</h4>
                  <div className="flex">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-gray-700"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <div className="flex-1 flex-center font-bold text-lg">
                      {quantity}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-gray-700"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Price</span>
                    <span>${(sizePrice[selectedSize as keyof typeof sizePrice] * quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${(sizePrice[selectedSize as keyof typeof sizePrice] * quantity).toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  className="w-full bg-nextplate-red hover:bg-red-600"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isOrdering}
                >
                  {isOrdering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Placing Order...
                    </>
                  ) : (
                    "Add to Order"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlateDetails;
