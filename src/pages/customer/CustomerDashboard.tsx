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
import { getAvailablePlates, getAvailableSellers, CustomerPlate, CustomerSeller } from "@/lib/customer-plates-service";

const CustomerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [favoriteSellers, setFavoriteSellers] = useState<string[]>([]);
  const [realPlates, setRealPlates] = useState<CustomerPlate[]>([]);
  const [realSellers, setRealSellers] = useState<CustomerSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { notifyInfo, notifySuccess } = useNotifications();
  
  // Load real data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [plates, sellers] = await Promise.all([
          getAvailablePlates(),
          getAvailableSellers()
        ]);
        
        console.log('📊 Loaded real plates:', plates);
        console.log('📊 Loaded real sellers:', sellers);
        
        setRealPlates(plates);
        setRealSellers(sellers);
      } catch (error) {
        console.error('Error loading customer data:', error);
        notifyInfo("Connection Issue", "Some data may not be up to date");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter items based on search
  const filteredSellers = searchQuery
    ? realSellers.filter(seller => 
        seller.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (seller.bio && seller.bio.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : realSellers;

  const filteredPlates = searchQuery
    ? realPlates.filter(plate => 
        plate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plate.seller.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plate.nutritionalInfo && plate.nutritionalInfo.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : realPlates;
      
  // Get favorite sellers data
  const favoriteSellersList = realSellers.filter(seller => 
    favoriteSellers.includes(seller.id)
  );
  
  const handleOrderPlate = (plateId: string, plateName: string) => {
    notifyInfo("Order Placed", `Your order for ${plateName} has been placed! 🍽️`);
  };

  const handleViewSellerMenu = (sellerId: string, sellerName: string) => {
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
                placeholder="Search for sellers, plates, or cuisines..."
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
            </TabsList>

            <TabsContent value="overview" className="animate-fade-in space-y-8">
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
                            <CardTitle className="text-lg">{seller.businessName}</CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-nextplate-red hover:bg-nextplate-red hover:text-white"
                              onClick={() => handleToggleFavorite(seller.id, seller.businessName)}
                            >
                              <Heart fill="currentColor" size={16} />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-lg bg-nextplate-red flex items-center justify-center">
                              <User size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-300 mb-2">{seller.bio || "Delicious homemade food"}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">⭐ {seller.rating}</span>
                                <Button 
                                  size="sm"
                                  className="bg-nextplate-red hover:bg-red-600"
                                  onClick={() => handleViewSellerMenu(seller.id, seller.businessName)}
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
            </TabsContent>
            
            <TabsContent value="sellers" className="animate-fade-in">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-400">Loading sellers...</div>
                </div>
              ) : filteredSellers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSellers.map(seller => (
                    <div 
                      key={seller.id}
                      className="bg-nextplate-darkgray rounded-xl overflow-hidden hover:ring-2 hover:ring-nextplate-red transition-all cursor-pointer"
                    >
                      <div className="h-48 relative bg-gradient-to-br from-nextplate-orange to-nextplate-red flex items-center justify-center">
                        <User size={48} className="text-white" />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{seller.businessName}</h3>
                        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                          {seller.bio || "Delicious homemade food prepared with love"}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-400">
                            ⭐ {seller.rating} • {seller.plateCount} plates
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-nextplate-red hover:bg-red-600"
                            onClick={() => handleViewSellerMenu(seller.id, seller.businessName)}
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
                            onClick={() => handleToggleFavorite(seller.id, seller.businessName)}
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
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-400">Loading plates...</div>
                </div>
              ) : filteredPlates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlates.map(plate => (
                    <div 
                      key={plate.id}
                      className="bg-nextplate-darkgray rounded-xl overflow-hidden hover:ring-2 hover:ring-nextplate-red transition-all cursor-pointer"
                      onClick={() => navigate(`/plate/${plate.id}`)}
                    >
                      <div className="h-48 relative">
                        {plate.imageUrl ? (
                          <img 
                            src={plate.imageUrl} 
                            alt={plate.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-nextplate-orange to-nextplate-red flex items-center justify-center">
                            <Package size={48} className="text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 gradient-overlay flex items-end p-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{plate.name}</h3>
                            <p className="text-sm text-gray-300">by {plate.seller.businessName}</p>
                            <p className="text-xs text-gray-400 mt-1">Size: {plate.size}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        {plate.nutritionalInfo && (
                          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                            {plate.nutritionalInfo}
                          </p>
                        )}
                        <div className="text-xs text-gray-400 mb-3">
                          Available: {new Date(plate.availableDate).toLocaleDateString()}
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
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;