
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Calendar, Clock, User, ChevronDown, ChevronUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  const [selectedSize, setSelectedSize] = React.useState("Regular");
  const [withBreakfast, setWithBreakfast] = React.useState(false);
  const [expandedDays, setExpandedDays] = React.useState<string[]>([]);
  
  // In a real app, fetch meal prep data based on the ID
  const mealPrep = MOCK_MEAL_PREP;
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleAddToCart = () => {
    toast({
      title: "Added to order!",
      description: `${mealPrep.name} (${selectedSize}) added to your order.`,
    });
  };
  
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
