
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Search, Package, User, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

// Mock data for plates
const MOCK_PLATES = [
  {
    id: "plate1",
    name: "Chicken Alfredo Pasta",
    description: "Creamy pasta with grilled chicken and parmesan",
    price: 12.99,
    seller: "Taste of Home",
    sellerUsername: "tasteofhome",
    location: "Downtown",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "plate2",
    name: "Teriyaki Salmon Bowl",
    description: "Grilled salmon with rice, vegetables, and teriyaki sauce",
    price: 14.99,
    seller: "Healthy Meals",
    sellerUsername: "healthymeals",
    location: "Midtown",
    image: "https://images.unsplash.com/photo-1580554530778-ca36943938b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "plate3",
    name: "Butter Chicken",
    description: "Classic Indian butter chicken with rice and naan",
    price: 13.99,
    seller: "Spice Kitchen",
    sellerUsername: "spicekitchen",
    location: "Uptown",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  }
];

// Mock data for sellers
const MOCK_SELLERS = [
  {
    id: "seller1",
    name: "Taste of Home",
    username: "tasteofhome",
    description: "Homestyle comfort food with a modern twist",
    location: "Downtown",
    rating: 4.8,
    plateCount: 12,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "seller2",
    name: "Healthy Meals",
    username: "healthymeals", 
    description: "Nutritious meal prep packages for busy professionals",
    location: "Midtown",
    rating: 4.9,
    plateCount: 8,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "seller3",
    name: "Spice Kitchen",
    username: "spicekitchen",
    description: "Authentic Indian cuisine made fresh daily",
    location: "Uptown", 
    rating: 4.7,
    plateCount: 15,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
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
  const [activeTab, setActiveTab] = useState("sellers");
  const navigate = useNavigate();
  const { notifyInfo, notifySuccess } = useNotifications();
  
  // Filter items based on search
  const filteredSellers = searchQuery
    ? MOCK_SELLERS.filter(seller => 
        seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_SELLERS;

  const filteredPlates = searchQuery
    ? MOCK_PLATES.filter(plate => 
        plate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plate.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plate.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plate.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_PLATES;
    
  const filteredMealPreps = searchQuery
    ? MOCK_MEAL_PREPS.filter(prep => 
        prep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prep.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prep.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_MEAL_PREPS;
  
  const handleOrderPlate = (plateId: string, plateName: string) => {
    notifyInfo("Order Placed", `Your order for ${plateName} has been placed! 🍽️`);
  };

  const handleViewSellerMenu = (sellerId: string, sellerName: string) => {
    notifySuccess("Menu Loaded", `Viewing ${sellerName}'s menu`);
    // In future this would navigate to the seller's full menu
  };

  const handleFollowSeller = (sellerId: string, sellerName: string) => {
    notifySuccess("Seller Followed", `You're now following ${sellerName}! 🎉`);
  };
  
  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Welcome to NextPlate!</h1>
            <p className="text-xl text-gray-300 mb-6">
              Discover amazing home chefs in your area and order delicious homemade meals
            </p>
            
            {/* Search Bar */}
            <div className="relative w-full max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for sellers, plates, or locations..."
                className="bg-nextplate-darkgray border-none pl-12 py-4 text-lg text-white rounded-xl"
              />
            </div>
          </div>
          
          {/* Browse Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-nextplate-darkgray mb-8">
              <TabsTrigger value="sellers" className="flex-1 text-lg py-3">
                Browse Sellers
              </TabsTrigger>
              <TabsTrigger value="plates" className="flex-1 text-lg py-3">
                Individual Plates
              </TabsTrigger>
              <TabsTrigger value="mealpreps" className="flex-1 text-lg py-3">
                Meal Prep Packages
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sellers" className="animate-fade-in">
              {filteredSellers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSellers.map(seller => (
                    <div 
                      key={seller.id}
                      className="bg-nextplate-darkgray rounded-xl overflow-hidden hover:ring-2 hover:ring-nextplate-red transition-all cursor-pointer"
                    >
                      <div className="h-48 relative">
                        <img 
                          src={seller.image} 
                          alt={seller.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 gradient-overlay flex items-end p-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{seller.name}</h3>
                            <p className="text-sm text-gray-300 flex items-center">
                              <MapPin size={14} className="mr-1" />
                              {seller.location}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-gray-300 mb-1">@{seller.username}</p>
                        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                          {seller.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-400">
                            ⭐ {seller.rating} • {seller.plateCount} plates
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-nextplate-red hover:bg-red-600"
                            onClick={() => handleViewSellerMenu(seller.id, seller.name)}
                          >
                            View Menu
                          </Button>
                          <Button 
                            variant="outline" 
                            className="border-nextplate-red text-nextplate-red hover:bg-nextplate-red hover:text-white"
                            onClick={() => handleFollowSeller(seller.id, seller.name)}
                          >
                            Follow
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-nextplate-darkgray rounded-xl p-8 text-center">
                  <User size={48} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No sellers found</h3>
                  <p className="text-gray-400">
                    {searchQuery
                      ? `No sellers match your search for "${searchQuery}"`
                      : "No sellers available in your area yet"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="plates" className="animate-fade-in">
              {filteredPlates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlates.map(plate => (
                    <div 
                      key={plate.id}
                      className="bg-nextplate-darkgray rounded-xl overflow-hidden hover:ring-2 hover:ring-nextplate-red transition-all cursor-pointer"
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
                            <p className="text-sm text-gray-300">by {plate.seller}</p>
                            <p className="text-xs text-gray-400 flex items-center mt-1">
                              <MapPin size={12} className="mr-1" />
                              {plate.location}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                          {plate.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg text-nextplate-red">${plate.price}</span>
                          <Button 
                            size="sm" 
                            className="bg-nextplate-red hover:bg-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrderPlate(plate.id, plate.name);
                            }}
                          >
                            Order Now
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
                      : "No plates available from sellers yet"}
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
                      className="bg-nextplate-darkgray rounded-xl overflow-hidden hover:ring-2 hover:ring-nextplate-red transition-all cursor-pointer"
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
                        <div className="p-6 md:w-2/3">
                          <h3 className="text-xl font-bold mb-1">{prep.name}</h3>
                          <p className="text-sm text-gray-300 mb-1">by {prep.seller}</p>
                          <p className="text-sm text-gray-300 mb-4">
                            {prep.description}
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <div>
                              <p className="font-bold text-lg text-nextplate-red">${prep.price}</p>
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
                      : "No meal prep packages available from sellers yet"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
