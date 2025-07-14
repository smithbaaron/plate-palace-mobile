
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Calendar, Clock, User, Package, Loader } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { bundleService } from "@/lib/bundles-service";
import { getAvailableSellers } from "@/lib/customer-plates-service";
import { createOrder } from "@/lib/orders-service";
import { useAuth } from "@/context/AuthContext";

// Mock meal prep package data
const MOCK_MEAL_PREP = {
  id: "prep1",
  name: "5-Day Keto Package",
  description: "Low-carb, high-protein meals designed for the keto diet. Each meal is balanced with healthy fats and minimal carbs to keep you in ketosis all week.",
  price: 59.99,
  seller: "Healthy Meals",
  sellerUsername: "healthymeals",
  image: "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
  mealCount: 10,
  withBreakfast: false,
  availableSizes: ["Regular", "Large"],
  startDate: "2025-05-20",
  cutoffDate: "2025-05-18",
  deliveryDays: ["Monday", "Wednesday", "Friday"],
  meals: [
    {
      day: "Monday",
      meals: [
        { type: "Lunch", name: "Keto Chicken Caesar Salad", description: "Grilled chicken, romaine lettuce, parmesan, bacon bits with Caesar dressing" },
        { type: "Dinner", name: "Garlic Butter Steak Bites", description: "Tender steak with zucchini noodles and garlic butter sauce" }
      ]
    },
    {
      day: "Tuesday",
      meals: [
        { type: "Lunch", name: "Tuna Avocado Lettuce Wraps", description: "Tuna salad with avocado in lettuce cups" },
        { type: "Dinner", name: "Keto Chili", description: "Hearty beef chili with minimal beans and rich spices" }
      ]
    },
    {
      day: "Wednesday",
      meals: [
        { type: "Lunch", name: "Egg Salad Stuffed Peppers", description: "Bell peppers stuffed with creamy egg salad" },
        { type: "Dinner", name: "Salmon with Asparagus", description: "Baked salmon filet with roasted asparagus" }
      ]
    },
    {
      day: "Thursday",
      meals: [
        { type: "Lunch", name: "Keto Cobb Salad", description: "Mixed greens with bacon, chicken, egg, avocado and blue cheese" },
        { type: "Dinner", name: "Cauliflower Fried Rice", description: "Cauliflower rice with chicken, eggs, and vegetables" }
      ]
    },
    {
      day: "Friday",
      meals: [
        { type: "Lunch", name: "Turkey and Cheese Roll-Ups", description: "Turkey slices with cheese and avocado" },
        { type: "Dinner", name: "Keto Pizza", description: "Fathead dough pizza with mozzarella, pepperoni, and vegetables" }
      ]
    }
  ]
};

const MealPrepDetails = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [selectedSize, setSelectedSize] = React.useState("Regular");
  const [withBreakfast, setWithBreakfast] = React.useState(false);
  const [expandedDays, setExpandedDays] = React.useState<string[]>([]);
  const [bundle, setBundle] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBundleData = async () => {
      if (!id) {
        setError("Bundle ID not found");
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 Fetching bundle data for ID:", id);
        
        const [bundlesData, sellersData] = await Promise.all([
          bundleService.getAvailableBundles(),
          getAvailableSellers()
        ]);
        
        const foundBundle = bundlesData.find(b => b.id === id);
        console.log("📦 Found bundle:", foundBundle);
        console.log("📊 Available bundles:", bundlesData.map(b => ({ id: b.id, name: b.name })));
        
        if (!foundBundle) {
          setError("Bundle not found");
          setLoading(false);
          return;
        }
        
        // Find seller by checking which seller profile belongs to the user who created this bundle
        // For now, we'll match by any seller in the list and show "Unknown Seller" if not found
        const bundleSeller = sellersData.find(s => {
          // We'll need to improve this matching later, but for now just pick the first seller
          // or match by some other logic
          console.log("🔍 Checking seller:", s.id, "vs bundle seller_id:", foundBundle.seller_id);
          return true; // For now, just use the first seller or fallback
        });
        
        console.log("👤 Bundle seller_id:", foundBundle.seller_id);
        console.log("👤 Using seller:", bundleSeller);
        
        setBundle(foundBundle);
        setSeller(bundleSeller || { businessName: "Unknown Seller", id: "unknown" });
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching bundle data:", error);
        setError("Error loading bundle details");
        setLoading(false);
      }
    };

    fetchBundleData();
  }, [id]);
  
  // In a real app, fetch meal prep data based on the ID
  const mealPrep = bundle ? {
    id: bundle.id,
    name: bundle.name,
    description: `${bundle.plate_count} plates package - ${bundle.availability_scope} availability`,
    price: bundle.price,
    seller: seller?.businessName || "Unknown Seller",
    sellerUsername: seller?.businessName?.toLowerCase().replace(/\s+/g, '') || "seller",
    image: bundle.bundle_plates?.[0]?.plates?.image_url || "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    mealCount: bundle.plate_count,
    withBreakfast: false,
    availableSizes: ["Regular", "Large"],
    startDate: bundle.available_date,
    cutoffDate: new Date(new Date(bundle.available_date).getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days before
    deliveryDays: bundle.availability_scope === 'week' ? ["Monday", "Wednesday", "Friday"] : ["Next Day"],
    meals: bundle.bundle_plates?.map((bp: any, index: number) => ({
      day: bundle.availability_scope === 'week' ? 
        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][index % 5] : 
        `Plate ${index + 1}`,
      meals: [{
        type: "Meal",
        name: bp.plates?.name || `Plate ${index + 1}`,
        description: `Size: ${bp.plates?.size || 'Regular'} - Price: $${bp.plates?.price || 0}`
      }]
    })) || []
  } : MOCK_MEAL_PREP;
  
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

    if (!bundle) {
      toast({
        title: "Error",
        description: "Bundle information not available.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("🛒 Creating order for meal prep bundle:", { 
        bundleId: bundle.id, 
        bundleName: bundle.name, 
        price: finalPrice, 
        sellerId: bundle.seller_id 
      });

      // Create order for the meal prep bundle using the first plate as the primary item
      const primaryPlate = bundle.bundle_plates?.[0]?.plates;
      if (!primaryPlate) {
        throw new Error("Bundle has no plates associated");
      }

      await createOrder({
        customerId: currentUser.id,
        sellerId: bundle.seller_id,
        items: [{
          plateId: primaryPlate.id,
          quantity: 1,
          unitPrice: finalPrice,
        }],
        totalAmount: finalPrice,
        deliveryType: 'delivery', // Default for meal prep bundles
        notes: `Meal prep bundle: ${bundle.name} (${selectedSize}${withBreakfast ? ' with breakfast' : ''}) - ${bundle.plate_count} plates included`,
      });

      toast({
        title: "Order placed successfully!",
        description: `${mealPrep.name} (${selectedSize}${withBreakfast ? ' with breakfast' : ''}) has been ordered.`,
      });

      // Navigate back or to orders page
      navigate('/customer/orders');
    } catch (error) {
      console.error("❌ Error creating meal prep order:", error);
      toast({
        title: "Order failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="pt-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader className="animate-spin h-8 w-8 text-nextplate-red mx-auto mb-4" />
                <p className="text-gray-400">Loading bundle details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="pt-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Bundle Not Found</h1>
              <p className="text-gray-400 mb-6">{error || "The bundle you're looking for doesn't exist."}</p>
              <Button 
                onClick={handleBack}
                className="bg-nextplate-red hover:bg-red-600"
              >
                <ArrowLeft className="mr-2" size={16} />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const toggleDayExpanded = (day: string) => {
    setExpandedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };
  
  const totalMeals = withBreakfast 
    ? mealPrep.mealCount + Math.floor(mealPrep.mealCount / 2)
    : mealPrep.mealCount;
    
  const totalPrice = withBreakfast 
    ? mealPrep.price * 1.4
    : mealPrep.price;
    
  const sizeMultiplier = selectedSize === "Large" ? 1.25 : 1;
  const finalPrice = totalPrice * sizeMultiplier;
  
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navigation />
      
      <div className="pt-16">
        {/* Hero image */}
        <div className="w-full h-48 md:h-72 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img 
            src={mealPrep.image} 
            alt={mealPrep.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-overlay"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
          <div className="bg-nextplate-darkgray rounded-xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                {/* Meal prep details */}
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-nextplate-red mr-2 flex-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-sm">@{mealPrep.sellerUsername}</span>
                </div>
                
                <h1 className="text-3xl font-bold mb-2">{mealPrep.name}</h1>
                <p className="text-gray-300 mb-6">{mealPrep.description}</p>
                
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <Calendar className="mr-2 text-nextplate-red" size={18} />
                    <div>
                      <span className="block">Starts on {new Date(mealPrep.startDate).toLocaleDateString()}</span>
                      <span className="block text-sm text-gray-400">Order by {new Date(mealPrep.cutoffDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Delivery Days</h3>
                    <div className="flex flex-wrap gap-2">
                      {mealPrep.deliveryDays.map(day => (
                        <span 
                          key={day} 
                          className="px-3 py-1 bg-nextplate-lightgray rounded-full text-sm"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">What's Included</h3>
                    
                    <Accordion type="multiple" className="w-full">
                      {mealPrep.meals.map((day) => (
                        <AccordionItem key={day.day} value={day.day} className="border-b border-gray-800">
                          <AccordionTrigger className="hover:bg-nextplate-lightgray hover:bg-opacity-30 rounded px-3">
                            <span className="font-bold">{day.day}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-3">
                            <div className="space-y-4 py-2">
                              {day.meals.map((meal) => (
                                <div key={meal.type} className="border-l-2 border-nextplate-red pl-4">
                                  <h5 className="font-medium">{meal.type}: {meal.name}</h5>
                                  <p className="text-sm text-gray-400">{meal.description}</p>
                                </div>
                              ))}
                              {withBreakfast && (
                                <div className="border-l-2 border-nextplate-red pl-4">
                                  <h5 className="font-medium">Breakfast: Chef's Choice</h5>
                                  <p className="text-sm text-gray-400">Rotating breakfast item based on chef's selection</p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/3 bg-black rounded-lg p-4">
                {/* Order form */}
                <h3 className="text-xl font-bold mb-4">Package Options</h3>
                
                <div className="mb-4">
                  <h4 className="text-sm mb-2">Meal Plan</h4>
                  <RadioGroup defaultValue="withoutBreakfast" className="grid grid-cols-1 gap-3">
                    <div className="flex">
                      <RadioGroupItem
                        value="withoutBreakfast"
                        id="withoutBreakfast"
                        checked={!withBreakfast}
                        onClick={() => setWithBreakfast(false)}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="withoutBreakfast"
                        className="flex flex-col justify-center rounded-md border-2 border-gray-700 bg-nextplate-lightgray p-3 hover:bg-gray-800 peer-data-[state=checked]:border-nextplate-red peer-data-[state=checked]:text-white cursor-pointer w-full"
                      >
                        <div className="flex justify-between">
                          <span>Without Breakfast</span>
                          <span className="font-bold">${mealPrep.price.toFixed(2)}</span>
                        </div>
                        <span className="text-xs text-gray-400">{mealPrep.mealCount} meals total (lunch & dinner)</span>
                      </Label>
                    </div>
                    
                    <div className="flex">
                      <RadioGroupItem
                        value="withBreakfast"
                        id="withBreakfast"
                        checked={withBreakfast}
                        onClick={() => setWithBreakfast(true)}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="withBreakfast"
                        className="flex flex-col justify-center rounded-md border-2 border-gray-700 bg-nextplate-lightgray p-3 hover:bg-gray-800 peer-data-[state=checked]:border-nextplate-red peer-data-[state=checked]:text-white cursor-pointer w-full"
                      >
                        <div className="flex justify-between">
                          <span>With Breakfast</span>
                          <span className="font-bold">${(mealPrep.price * 1.4).toFixed(2)}</span>
                        </div>
                        <span className="text-xs text-gray-400">{mealPrep.mealCount + Math.floor(mealPrep.mealCount / 2)} meals total (breakfast, lunch & dinner)</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm mb-2">Portion Size</h4>
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="grid grid-cols-2 gap-3">
                    {mealPrep.availableSizes.map((size) => (
                      <div key={size} className="flex">
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
                          {size === "Large" && <span className="text-xs text-gray-400">+25%</span>}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Base Price</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  {selectedSize === "Large" && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Large Portion</span>
                      <span>+${(totalPrice * 0.25).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-700">
                    <span>Total</span>
                    <span>${finalPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  className="w-full bg-nextplate-red hover:bg-red-600"
                  size="lg"
                  onClick={handleAddToCart}
                >
                  Order Package
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPrepDetails;
