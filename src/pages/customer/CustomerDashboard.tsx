import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Search, Package, User, MapPin, Heart, Clock, Calendar, Truck, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { getAvailablePlates, getAvailableSellers } from "@/lib/customer-plates-service";

// Mock data for plates with delivery/pickup options
const MOCK_PLATES = [
  {
    id: "plate1",
    name: "Chicken Alfredo Pasta",
    description: "Creamy pasta with grilled chicken and parmesan",
    price: 12.99,
    seller: "Taste of Home",
    sellerUsername: "tasteofhome",
    location: "Downtown",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    deliveryOptions: {
      available: true,
      fee: 2.99,
      estimatedTime: "30-45 mins"
    },
    pickupOptions: {
      available: true,
      estimatedTime: "15-20 mins",
      address: "123 Main St, Downtown"
    }
  },
  {
    id: "plate2",
    name: "Teriyaki Salmon Bowl",
    description: "Grilled salmon with rice, vegetables, and teriyaki sauce",
    price: 14.99,
    seller: "Healthy Meals",
    sellerUsername: "healthymeals",
    location: "Midtown",
    image: "https://images.unsplash.com/photo-1580554530778-ca36943938b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    deliveryOptions: {
      available: true,
      fee: 3.99,
      estimatedTime: "25-35 mins"
    },
    pickupOptions: {
      available: true,
      estimatedTime: "10-15 mins",
      address: "456 Oak Ave, Midtown"
    }
  },
  {
    id: "plate3",
    name: "Butter Chicken",
    description: "Classic Indian butter chicken with rice and naan",
    price: 13.99,
    seller: "Spice Kitchen",
    sellerUsername: "spicekitchen",
    location: "Uptown",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    deliveryOptions: {
      available: false,
      fee: 0,
      estimatedTime: "N/A"
    },
    pickupOptions: {
      available: true,
      estimatedTime: "20-25 mins",
      address: "789 Pine St, Uptown"
    }
  }
];

// Mock data for sellers with delivery options
const MOCK_SELLERS = [
  {
    id: "seller1",
    name: "Taste of Home",
    username: "tasteofhome",
    description: "Homestyle comfort food with a modern twist",
    location: "Downtown",
    rating: 4.8,
    plateCount: 12,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    deliveryOptions: {
      available: true,
      radius: "5 miles",
      fee: 2.99
    },
    pickupOptions: {
      available: true,
      address: "123 Main St, Downtown",
      hours: "11:00 AM - 9:00 PM"
    }
  },
  {
    id: "seller2",
    name: "Healthy Meals",
    username: "healthymeals", 
    description: "Nutritious meal prep packages for busy professionals",
    location: "Midtown",
    rating: 4.9,
    plateCount: 8,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    deliveryOptions: {
      available: true,
      radius: "10 miles",
      fee: 3.99
    },
    pickupOptions: {
      available: true,
      address: "456 Oak Ave, Midtown",
      hours: "10:00 AM - 8:00 PM"
    }
  },
  {
    id: "seller3",
    name: "Spice Kitchen",
    username: "spicekitchen",
    description: "Authentic Indian cuisine made fresh daily",
    location: "Uptown", 
    rating: 4.7,
    plateCount: 15,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    deliveryOptions: {
      available: false,
      radius: "0 miles",
      fee: 0
    },
    pickupOptions: {
      available: true,
      address: "789 Pine St, Uptown",
      hours: "12:00 PM - 10:00 PM"
    }
  }
];

// Mock data for meal preps with delivery/pickup options
const MOCK_MEAL_PREPS = [
  {
    id: "prep1",
    name: "5-Day Keto Package",
    description: "Low-carb, high-protein meals for the week",
    price: 59.99,
    seller: "Healthy Meals",
    sellerUsername: "healthymeals",
    mealCount: 10,
    image: "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    deliveryOptions: {
      available: true,
      fee: 4.99,
      estimatedTime: "1-2 days"
    },
    pickupOptions: {
      available: true,
      estimatedTime: "Same day",
      address: "456 Oak Ave, Midtown"
    }
  },
  {
    id: "prep2",
    name: "3-Day Vegetarian Package",
    description: "Plant-based meals with protein alternatives",
    price: 34.99,
    seller: "Taste of Home",
    sellerUsername: "tasteofhome",
    mealCount: 6,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    deliveryOptions: {
      available: true,
      fee: 2.99,
      estimatedTime: "1-2 days"
    },
    pickupOptions: {
      available: true,
      estimatedTime: "Same day",
      address: "123 Main St, Downtown"
    }
  }
];

// Mock data for purchased items (current and past)
const MOCK_PURCHASED_PLATES = [
  {
    id: "purchased1",
    plateId: "plate1",
    name: "Chicken Alfredo Pasta",
    seller: "Taste of Home",
    price: 12.99,
    quantity: 2,
    purchasedAt: "2025-07-10T10:30:00Z",
    status: "ready",
    deliveryMethod: "pickup",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "purchased2",
    plateId: "plate2",
    name: "Teriyaki Salmon Bowl",
    seller: "Healthy Meals",
    price: 14.99,
    quantity: 1,
    purchasedAt: "2025-07-09T12:15:00Z",
    status: "delivered",
    deliveryMethod: "delivery",
    image: "https://images.unsplash.com/photo-1580554530778-ca36943938b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "purchased3",
    plateId: "plate3",
    name: "Butter Chicken",
    seller: "Spice Kitchen",
    price: 13.99,
    quantity: 1,
    purchasedAt: "2025-07-08T15:30:00Z",
    status: "delivered",
    deliveryMethod: "pickup",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  }
];

const MOCK_PURCHASED_MEAL_PREPS = [
  {
    id: "purchased_prep1",
    prepId: "prep1",
    name: "5-Day Keto Package",
    seller: "Healthy Meals",
    price: 59.99,
    mealCount: 10,
    purchasedAt: "2025-07-09T14:20:00Z",
    deliveryDate: "2025-07-11",
    status: "confirmed",
    deliveryMethod: "delivery",
    image: "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "purchased_prep2",
    prepId: "prep2",
    name: "3-Day Vegetarian Package",
    seller: "Taste of Home",
    price: 34.99,
    mealCount: 6,
    purchasedAt: "2025-07-05T10:00:00Z",
    deliveryDate: "2025-07-06",
    status: "delivered",
    deliveryMethod: "pickup",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  }
];

// Mock favorite sellers (would come from user preferences)
const MOCK_FAVORITE_SELLERS = ["seller1", "seller2"];

const CustomerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [favoriteSellers, setFavoriteSellers] = useState<string[]>(MOCK_FAVORITE_SELLERS);
  const [realSellers, setRealSellers] = useState<any[]>([]);
  const [realPlates, setRealPlates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { notifyInfo, notifySuccess } = useNotifications();

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Fetching real sellers and plates data...");
        const [sellersData, platesData] = await Promise.all([
          getAvailableSellers(),
          getAvailablePlates()
        ]);
        
        console.log("📊 Fetched sellers:", sellersData);
        console.log("🍽️ Fetched plates:", platesData);
        
        setRealSellers(sellersData);
        setRealPlates(platesData);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        // Fallback to mock data if real data fails
        setRealSellers(MOCK_SELLERS);
        setRealPlates(MOCK_PLATES);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Use real data, fallback to mock if empty
  const sellersToUse = realSellers.length > 0 ? realSellers : MOCK_SELLERS;
  const platesToUse = realPlates.length > 0 ? realPlates : MOCK_PLATES;

  // Filter items based on search
  const filteredSellers = searchQuery
    ? sellersToUse.filter(seller => 
        (seller.businessName || seller.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (seller.bio || seller.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sellersToUse;

  const filteredPlates = searchQuery
    ? platesToUse.filter(plate => 
        plate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plate.seller?.businessName || plate.seller || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : platesToUse;
    
  const filteredMealPreps = searchQuery
    ? MOCK_MEAL_PREPS.filter(prep => 
        prep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prep.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prep.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_MEAL_PREPS;

  // Get favorite sellers data
  const favoriteSellersList = sellersToUse.filter(seller => 
    favoriteSellers.includes(seller.id)
  );

  // Get today's purchases
  const today = new Date().toDateString();
  const todaysPurchasedPlates = MOCK_PURCHASED_PLATES.filter(item => 
    new Date(item.purchasedAt).toDateString() === today
  );
  
  const handleOrderPlate = (plateId: string, plateName: string) => {
    notifyInfo("Order Placed", `Your order for ${plateName} has been placed! 🍽️`);
  };

  const handleViewSellerMenu = (sellerId: string, sellerName: string) => {
    // Navigate to seller's individual plates
    navigate(`/seller/${sellerId}/menu`);
    notifySuccess("Menu Loaded", `Viewing ${sellerName}'s menu`);
  };

  const handleToggleFavorite = (sellerId: string, sellerName: string) => {
    const isFavorite = favoriteSellers.includes(sellerId);
    if (isFavorite) {
      setFavoriteSellers(prev => prev.filter(id => id !== sellerId));
      notifyInfo("Seller Unfavorited", `${sellerName} removed from favorites`);
    } else {
      setFavoriteSellers(prev => [...prev, sellerId]);
      notifySuccess("Seller Favorited", `${sellerName} added to favorites! ❤️`);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case "ready": return "bg-green-500";
      case "confirmed": return "bg-blue-500";
      case "preparing": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
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
              <TabsTrigger value="overview" className="flex-1 text-lg py-3">
                Overview
              </TabsTrigger>
              <TabsTrigger value="sellers" className="flex-1 text-lg py-3">
                Browse Sellers
              </TabsTrigger>
              <TabsTrigger value="plates" className="flex-1 text-lg py-3">
                Individual Plates
              </TabsTrigger>
              <TabsTrigger value="mealpreps" className="flex-1 text-lg py-3">
                Meal Prep Packages
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 text-lg py-3">
                Order History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="animate-fade-in space-y-8">
              {/* Today's Orders */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Calendar className="mr-2 text-nextplate-red" />
                  Today's Orders
                </h2>
                {todaysPurchasedPlates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todaysPurchasedPlates.map(item => (
                      <Card key={item.id} className="bg-nextplate-darkgray border-gray-800">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{item.name}</h3>
                              <p className="text-xs text-gray-400">by {item.seller}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-bold text-nextplate-red">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                <Badge className={`${getStatusBadgeColor(item.status)} text-xs`}>
                                  {item.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-nextplate-darkgray border-gray-800">
                    <CardContent className="p-8 text-center">
                      <Package size={48} className="mx-auto text-gray-500 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No orders today</h3>
                      <p className="text-gray-400 mb-4">Start your day with something delicious!</p>
                      <Button 
                        className="bg-nextplate-red hover:bg-red-600"
                        onClick={() => setActiveTab("plates")}
                      >
                        Browse Plates
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Favorite Sellers */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Heart className="mr-2 text-nextplate-red" />
                  Favorite Sellers
                </h2>
                {favoriteSellersList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteSellersList.map(seller => (
                      <Card key={seller.id} className="bg-nextplate-darkgray border-gray-800 hover:ring-2 hover:ring-nextplate-red transition-all">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{seller.name}</CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-nextplate-red hover:bg-nextplate-red hover:text-white"
                              onClick={() => handleToggleFavorite(seller.id, seller.name)}
                            >
                              <Heart fill="currentColor" size={16} />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-4">
                            <img 
                              src={seller.image} 
                              alt={seller.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-300 mb-2">{seller.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">⭐ {seller.rating}</span>
                                <Button 
                                  size="sm"
                                  className="bg-nextplate-red hover:bg-red-600"
                                  onClick={() => handleViewSellerMenu(seller.id, seller.name)}
                                >
                                  View Menu
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-nextplate-darkgray border-gray-800">
                    <CardContent className="p-8 text-center">
                      <Heart size={48} className="mx-auto text-gray-500 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No favorite sellers yet</h3>
                      <p className="text-gray-400 mb-4">Discover and save your favorite home chefs!</p>
                      <Button 
                        className="bg-nextplate-red hover:bg-red-600"
                        onClick={() => setActiveTab("sellers")}
                      >
                        Browse Sellers
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Recent Meal Preps */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Package className="mr-2 text-nextplate-red" />
                  Recent Meal Preps
                </h2>
                {MOCK_PURCHASED_MEAL_PREPS.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOCK_PURCHASED_MEAL_PREPS.map(prep => (
                      <Card key={prep.id} className="bg-nextplate-darkgray border-gray-800">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <img 
                              src={prep.image} 
                              alt={prep.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{prep.name}</h3>
                              <p className="text-sm text-gray-400 mb-2">by {prep.seller}</p>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-nextplate-red">${prep.price}</span>
                                  <span className="text-sm text-gray-400 ml-2">• {prep.mealCount} meals</span>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-400">Delivery</p>
                                  <p className="text-sm font-medium">{prep.deliveryDate}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-nextplate-darkgray border-gray-800">
                    <CardContent className="p-8 text-center">
                      <Package size={48} className="mx-auto text-gray-500 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No meal preps purchased</h3>
                      <p className="text-gray-400 mb-4">Save time with weekly meal prep packages!</p>
                      <Button 
                        className="bg-nextplate-red hover:bg-red-600"
                        onClick={() => setActiveTab("mealpreps")}
                      >
                        Browse Meal Preps
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
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
                          src={seller.image || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"} 
                          alt={seller.businessName || seller.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 gradient-overlay flex items-end p-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{seller.businessName || seller.name}</h3>
                            <p className="text-sm text-gray-300 flex items-center">
                              <MapPin size={14} className="mr-1" />
                              {seller.location || "Local"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-gray-300 mb-1">📞 {seller.phoneNumber || "Contact via app"}</p>
                        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                          {seller.bio || seller.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-400">
                            ⭐ {seller.rating || 4.5} • {seller.plateCount || 0} plates
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          {(seller.deliveryOptions?.available || seller.offersDelivery) && (
                            <div className="flex items-center text-xs text-gray-400">
                              <Truck size={12} className="mr-1 text-green-500" />
                              Delivery available
                            </div>
                          )}
                          {(seller.pickupOptions?.available || seller.offersPickup) && (
                            <div className="flex items-center text-xs text-gray-400">
                              <MapPin size={12} className="mr-1 text-blue-500" />
                              Pickup available
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-nextplate-red hover:bg-red-600"
                            onClick={() => handleViewSellerMenu(seller.id, seller.businessName || seller.name)}
                          >
                            View Menu
                          </Button>
                          <Button 
                            variant="outline" 
                            className={`border-nextplate-red ${
                              favoriteSellers.includes(seller.id) 
                                ? 'bg-nextplate-red text-white' 
                                : 'text-nextplate-red hover:bg-nextplate-red hover:text-white'
                            }`}
                            onClick={() => handleToggleFavorite(seller.id, seller.businessName || seller.name)}
                          >
                            <Heart fill={favoriteSellers.includes(seller.id) ? "currentColor" : "none"} size={16} />
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
                          src={plate.imageUrl || "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"} 
                          alt={plate.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 gradient-overlay flex items-end p-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{plate.name}</h3>
                            <p className="text-sm text-gray-300">by {plate.seller?.businessName || plate.seller}</p>
                            <p className="text-xs text-gray-400">
                              Available: {plate.quantity} • {plate.size}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                          {plate.nutritionalInfo || "Delicious homemade meal"}
                        </p>
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center text-xs text-gray-400">
                            <Calendar size={12} className="mr-1 text-blue-500" />
                            Available: {new Date(plate.availableDate).toLocaleDateString()}
                          </div>
                        </div>
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
                          <div className="space-y-2 mb-4">
                            {prep.deliveryOptions.available && (
                              <div className="flex items-center text-xs text-gray-400">
                                <Truck size={12} className="mr-1 text-green-500" />
                                Delivery: ${prep.deliveryOptions.fee} • {prep.deliveryOptions.estimatedTime}
                              </div>
                            )}
                            {prep.pickupOptions.available && (
                              <div className="flex items-center text-xs text-gray-400">
                                <Clock size={12} className="mr-1 text-blue-500" />
                                Pickup: {prep.pickupOptions.estimatedTime}
                              </div>
                            )}
                          </div>
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

            <TabsContent value="history" className="animate-fade-in">
              <div className="space-y-8">
                {/* Order History Plates */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <History className="mr-2 text-nextplate-red" />
                    Plate Orders
                  </h2>
                  {MOCK_PURCHASED_PLATES.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {MOCK_PURCHASED_PLATES.map(item => (
                        <Card key={item.id} className="bg-nextplate-darkgray border-gray-800">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm">{item.name}</h3>
                                <p className="text-xs text-gray-400">by {item.seller}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(item.purchasedAt).toLocaleDateString()} • Qty: {item.quantity}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm font-bold text-nextplate-red">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={`${getStatusBadgeColor(item.status)} text-xs`}>
                                      {item.status}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {item.deliveryMethod}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-nextplate-darkgray border-gray-800">
                      <CardContent className="p-8 text-center">
                        <Package size={48} className="mx-auto text-gray-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No plate orders yet</h3>
                        <p className="text-gray-400 mb-4">Start ordering delicious plates!</p>
                        <Button 
                          className="bg-nextplate-red hover:bg-red-600"
                          onClick={() => setActiveTab("plates")}
                        >
                          Browse Plates
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Meal Prep History */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Package className="mr-2 text-nextplate-red" />
                    Meal Prep Orders
                  </h2>
                  {MOCK_PURCHASED_MEAL_PREPS.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {MOCK_PURCHASED_MEAL_PREPS.map(prep => (
                        <Card key={prep.id} className="bg-nextplate-darkgray border-gray-800">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <img 
                                src={prep.image} 
                                alt={prep.name}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{prep.name}</h3>
                                <p className="text-sm text-gray-400 mb-2">by {prep.seller}</p>
                                <p className="text-sm text-gray-400 mb-2">
                                  Ordered: {new Date(prep.purchasedAt).toLocaleDateString()}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-bold text-nextplate-red">${prep.price}</span>
                                    <span className="text-sm text-gray-400 ml-2">• {prep.mealCount} meals</span>
                                  </div>
                                  <div className="text-right">
                                    <Badge className={`${getStatusBadgeColor(prep.status)} text-xs mb-1`}>
                                      {prep.status}
                                    </Badge>
                                    <p className="text-xs text-gray-400">{prep.deliveryMethod}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-nextplate-darkgray border-gray-800">
                      <CardContent className="p-8 text-center">
                        <Package size={48} className="mx-auto text-gray-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No meal prep orders yet</h3>
                        <p className="text-gray-400 mb-4">Try our convenient meal prep packages!</p>
                        <Button 
                          className="bg-nextplate-red hover:bg-red-600"
                          onClick={() => setActiveTab("mealpreps")}
                        >
                          Browse Meal Preps
                        </Button>
                      </CardContent>
                    </Card>
                  )}
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
