
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Clock, User } from "lucide-react";

// Mock plate data
const MOCK_PLATE = {
  id: "plate1",
  name: "Chicken Alfredo Pasta",
  description: "Creamy pasta with grilled chicken and parmesan cheese. Made with fresh ingredients and our homemade alfredo sauce that's been perfected over years.",
  price: 12.99,
  seller: "Taste of Home",
  sellerUsername: "tasteofhome",
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
  const [selectedSize, setSelectedSize] = React.useState("Medium");
  const [quantity, setQuantity] = React.useState(1);
  
  // In a real app, fetch plate data based on the ID
  const plate = MOCK_PLATE;
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleAddToCart = () => {
    toast({
      title: "Added to order!",
      description: `${quantity} ${selectedSize} ${plate.name} added to your order.`,
    });
  };
  
  const sizePrice = {
    Small: plate.price - 2,
    Medium: plate.price,
    Large: plate.price + 3
  };
  
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
            src={plate.image} 
            alt={plate.name} 
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
                  <span className="text-sm">@{plate.sellerUsername}</span>
                </div>
                
                <h1 className="text-3xl font-bold mb-2">{plate.name}</h1>
                <p className="text-gray-300 mb-6">{plate.description}</p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Ingredients</h3>
                    <p className="text-gray-300">{plate.ingredients}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Allergies</h3>
                    <p className="text-gray-300">{plate.allergies}</p>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="mr-2 text-nextplate-red" size={18} />
                    <div>
                      <span className="block text-sm">Available on {new Date(plate.availableDate).toLocaleDateString()}</span>
                      <span className="block text-sm">Pickup: {plate.pickupTime}</span>
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
                    {plate.availableSizes.map((size) => (
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
                >
                  Add to Order
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
