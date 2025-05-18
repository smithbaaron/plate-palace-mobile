import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Search, Package, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

// Mock data for plates
const MOCK_PLATES = [
  {
    id: "plate1",
    name: "Chicken Alfredo Pasta",
    description: "Creamy pasta with grilled chicken and parmesan",
    price: 12.99,
    seller: "Taste of Home",
    sellerUsername: "tasteofhome",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "plate2",
    name: "Teriyaki Salmon Bowl",
    description: "Grilled salmon with rice, vegetables, and teriyaki sauce",
    price: 14.99,
    seller: "Healthy Meals",
    sellerUsername: "healthymeals",
    image: "https://images.unsplash.com/photo-1580554530778-ca36943938b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "plate3",
    name: "Butter Chicken",
    description: "Classic Indian butter chicken with rice and naan",
    price: 13.99,
    seller: "Spice Kitchen",
    sellerUsername: "spicekitchen",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  }
];

// Mock data for meal preps
const MOCK_MEAL_PREPS = [
  {
    id: "prep1",
    name: "5-Day Keto Package",
    description: "Low-carb, high-protein meals for the week",
    price: 59.99,
    seller: "Healthy Meals",
    sellerUsername: "healthymeals",
    mealCount: 10,
    image: "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "prep2",
    name: "3-Day Vegetarian Package",
    description: "Plant-based meals with protein alternatives",
    price: 34.99,
    seller: "Taste of Home",
    sellerUsername: "tasteofhome",
    mealCount: 6,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  }
];

const CustomerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter items based on search
  const filteredPlates = searchQuery
    ? MOCK_PLATES.filter(plate => 
        plate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plate.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plate.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_PLATES;
    
  const filteredMealPreps = searchQuery
    ? MOCK_MEAL_PREPS.filter(prep => 
        prep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prep.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prep.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_MEAL_PREPS;
  
  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header with search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">Find Your Next Meal</h1>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plates, meal preps, or sellers"
                className="bg-nextplate-darkgray border-none pl-10 text-white"
              />
            </div>
          </div>
          
          {/* Content Tabs */}
          <Tabs defaultValue="plates">
            <TabsList className="w-full bg-nextplate-darkgray mb-6">
              <TabsTrigger value="plates" className="flex-1">Single Plates</TabsTrigger>
              <TabsTrigger value="mealpreps" className="flex-1">Meal Prep Packages</TabsTrigger>
              <TabsTrigger value="sellers" className="flex-1">My Sellers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plates" className="animate-fade-in">
              {filteredPlates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredPlates.map(plate => (
                    <div 
                      key={plate.id}
                      className="bg-nextplate-darkgray rounded-xl overflow-hidden hover:ring-1 hover:ring-nextplate-red transition-all cursor-pointer"
                      onClick={() => navigate(`/plate/${plate.id}`)}
                    >
                      <div className="h-48 relative">
                        <img 
                          src={plate.image} 
                          alt={plate.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 gradient-overlay flex items-end p-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{plate.name}</h3>
                            <p className="text-sm text-gray-300">by @{plate.sellerUsername}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                          {plate.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg">${plate.price}</span>
                          <Button size="sm" className="bg-nextplate-red hover:bg-red-600">
                            Order
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-nextplate-darkgray rounded-xl p-8 text-center">
                  <Package size={48} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No plates found</h3>
                  <p className="text-gray-400">
                    {searchQuery
                      ? `No plates match your search for "${searchQuery}"`
                      : "No plates available from your sellers yet"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="mealpreps" className="animate-fade-in">
              {filteredMealPreps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMealPreps.map(prep => (
                    <div 
                      key={prep.id}
                      className="bg-nextplate-darkgray rounded-xl overflow-hidden hover:ring-1 hover:ring-nextplate-red transition-all cursor-pointer"
                      onClick={() => navigate(`/mealprep/${prep.id}`)}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 h-40 md:h-auto relative">
                          <img 
                            src={prep.image} 
                            alt={prep.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 md:w-2/3">
                          <h3 className="text-xl font-bold mb-1">{prep.name}</h3>
                          <p className="text-sm text-gray-300 mb-1">by @{prep.sellerUsername}</p>
                          <p className="text-sm text-gray-300 mb-3">
                            {prep.description}
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <div>
                              <p className="font-bold text-lg">${prep.price}</p>
                              <p className="text-sm text-gray-400">{prep.mealCount} meals</p>
                            </div>
                            <Button className="bg-nextplate-red hover:bg-red-600">
                              Order Package
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-nextplate-darkgray rounded-xl p-8 text-center">
                  <Package size={48} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No meal prep packages found</h3>
                  <p className="text-gray-400">
                    {searchQuery
                      ? `No meal prep packages match your search for "${searchQuery}"`
                      : "No meal prep packages available from your sellers yet"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sellers" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mock followed sellers */}
                <div className="bg-nextplate-darkgray rounded-xl p-6 hover:ring-1 hover:ring-nextplate-red transition-all cursor-pointer">
                  <div className="h-16 w-16 rounded-full bg-nextplate-red mx-auto mb-4 flex-center">
                    <User size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-center">Taste of Home</h3>
                  <p className="text-sm text-gray-400 text-center mb-4">@tasteofhome</p>
                  <p className="text-sm text-center text-gray-300 mb-4">
                    Homestyle comfort food with a modern twist
                  </p>
                  <Button className="w-full bg-nextplate-red hover:bg-red-600">
                    View Menu
                  </Button>
                </div>
                
                <div className="bg-nextplate-darkgray rounded-xl p-6 hover:ring-1 hover:ring-nextplate-red transition-all cursor-pointer">
                  <div className="h-16 w-16 rounded-full bg-nextplate-red mx-auto mb-4 flex-center">
                    <User size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-center">Healthy Meals</h3>
                  <p className="text-sm text-gray-400 text-center mb-4">@healthymeals</p>
                  <p className="text-sm text-center text-gray-300 mb-4">
                    Nutritious meal prep packages for busy professionals
                  </p>
                  <Button className="w-full bg-nextplate-red hover:bg-red-600">
                    View Menu
                  </Button>
                </div>
                
                {/* Add seller card */}
                <div className="bg-nextplate-darkgray rounded-xl p-6 border-2 border-dashed border-gray-700 flex-center flex-col min-h-[280px]">
                  <div className="h-16 w-16 rounded-full bg-gray-800 mx-auto mb-4 flex-center">
                    <Plus size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center text-gray-400">Add New Seller</h3>
                  <p className="text-sm text-center text-gray-500 mb-4">
                    Find and follow more home chefs
                  </p>
                  <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    Find Sellers
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
