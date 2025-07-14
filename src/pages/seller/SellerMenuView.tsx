import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Truck, Clock, Calendar, Star, Phone } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAvailablePlates, getAvailableSellers } from "@/lib/customer-plates-service";
import { bundleService } from "@/lib/bundles-service";
import { supabase } from "@/lib/supabase";
import { createOrder } from "@/lib/orders-service";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/use-notifications";

const SellerMenuView = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { notifyInfo, notifySuccess } = useNotifications();
  const { currentUser } = useAuth();
  
  const [seller, setSeller] = useState<any>(null);
  const [plates, setPlates] = useState<any[]>([]);
  const [bundles, setBundles] = useState<any[]>([]);
  const [sellerUserId, setSellerUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        console.log("🔍 Fetching seller menu for seller profile ID:", sellerId);
        
        // First, get the user_id for this seller profile
        const { data: sellerProfile, error: profileError } = await supabase
          .from('seller_profiles')
          .select('user_id')
          .eq('id', sellerId)
          .single();
        
        if (profileError) {
          console.error("❌ Error fetching seller profile:", profileError);
          setLoading(false);
          return;
        }
        
        const sellerUserId = sellerProfile?.user_id;
        setSellerUserId(sellerUserId);
        console.log("🔑 Found seller user_id:", sellerUserId, "for profile ID:", sellerId);
        
        const [sellersData, platesData, bundlesData] = await Promise.all([
          getAvailableSellers(),
          getAvailablePlates(),
          bundleService.getAvailableBundles()
        ]);
        
        const foundSeller = sellersData.find(s => s.id === sellerId);
        const sellerPlates = platesData.filter(p => p.seller?.id === sellerId);
        
        // Filter bundles using the seller's user_id (not profile id)
        const sellerBundles = bundlesData.filter(b => {
          console.log("🔍 Checking bundle:", b.id, "bundle seller_id:", b.seller_id, "vs seller user_id:", sellerUserId);
          return b.seller_id === sellerUserId;
        });
        
        console.log("👤 Found seller:", foundSeller);
        console.log("🍽️ Seller plates:", sellerPlates);
        console.log("📦 Seller bundles found:", sellerBundles);
        console.log("📊 Total bundles in database:", bundlesData.length);
        console.log("📊 Bundles for this seller:", sellerBundles.length);
        
        setSeller(foundSeller);
        setPlates(sellerPlates);
        setBundles(sellerBundles);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching seller data:", error);
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerData();
    }
  }, [sellerId]);

  const handleOrderPlate = async (plateId: string, plateName: string, platePrice: number, sellerId: string) => {
    if (!currentUser) {
      notifyInfo("Login Required", "Please log in to place an order");
      return;
    }

    try {
      console.log("🛒 Creating order for plate:", { plateId, plateName, platePrice, sellerId });
      
      await createOrder({
        customerId: currentUser.id,
        sellerId: sellerId,
        items: [{
          plateId: plateId,
          quantity: 1,
          unitPrice: platePrice
        }],
        totalAmount: platePrice,
        deliveryType: 'pickup', // Default to pickup for now
        notes: `Order for ${plateName}`
      });

      notifySuccess("Order Placed", `Your order for ${plateName} has been placed successfully! 🍽️`);
    } catch (error) {
      console.error("❌ Error creating order:", error);
      notifyInfo("Order Failed", "Failed to place order. Please try again.");
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextplate-red mx-auto mb-4"></div>
                <p className="text-gray-400">Loading seller menu...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="pt-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Seller Not Found</h1>
              <p className="text-gray-400 mb-6">The seller you're looking for doesn't exist.</p>
              <Button 
                onClick={() => navigate(-1)}
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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-white hover:text-nextplate-red mb-6"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Sellers
          </Button>

          {/* Seller Header */}
          <Card className="bg-nextplate-darkgray border-gray-800 mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={seller.image || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"} 
                    alt={seller.businessName || seller.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{seller.businessName || seller.name}</h1>
                      <p className="text-gray-300 mb-4 max-w-2xl">{seller.bio || seller.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Star className="mr-1 text-yellow-400" size={16} />
                          <span>{seller.rating || 4.5} rating</span>
                        </div>
                        <div className="flex items-center">
                          <span>{seller.plateCount || plates.length} plates available</span>
                        </div>
                        {seller.phoneNumber && (
                          <div className="flex items-center">
                            <Phone className="mr-1" size={16} />
                            <span>{seller.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {(seller.deliveryOptions?.available || seller.offersDelivery) && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Truck className="mr-1" size={12} />
                          Delivery Available
                        </Badge>
                      )}
                      {(seller.pickupOptions?.available || seller.offersPickup) && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <MapPin className="mr-1" size={12} />
                          Pickup Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Menu ({plates.length} plates, {bundles.length} bundles)</h2>
            
            {/* Bundles Section */}
            {bundles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-nextplate-red">Meal Prep Bundles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bundles.map(bundle => (
                    <Card key={bundle.id} className="bg-nextplate-darkgray border-gray-800 hover:ring-2 hover:ring-nextplate-red transition-all">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-white mb-1">{bundle.name}</h4>
                            <p className="text-sm text-gray-400">{bundle.plate_count} plates included</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-nextplate-red">${bundle.price}</p>
                            <p className="text-xs text-gray-400">${(bundle.price / bundle.plate_count).toFixed(2)} per plate</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-xs text-gray-400">
                            <Calendar size={12} className="mr-1 text-blue-500" />
                            Available: {new Date(bundle.available_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock size={12} className="mr-1 text-green-500" />
                            {bundle.availability_scope} package
                          </div>
                        </div>

                        {bundle.bundle_plates && bundle.bundle_plates.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-2">Includes:</p>
                            <div className="space-y-1">
                              {bundle.bundle_plates.slice(0, 3).map((bp: any, idx: number) => (
                                <p key={idx} className="text-xs text-gray-300">• {bp.plates?.name || 'Plate'}</p>
                              ))}
                              {bundle.bundle_plates.length > 3 && (
                                <p className="text-xs text-gray-400">• +{bundle.bundle_plates.length - 3} more plates</p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 border-nextplate-red text-nextplate-red hover:bg-nextplate-red hover:text-white"
                            onClick={() => navigate(`/mealprep/${bundle.id}`)}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-nextplate-red hover:bg-red-600"
                            onClick={() => notifyInfo("Bundle Order", `${bundle.name} bundle order started! 📦`)}
                          >
                            Order Bundle
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Individual Plates Section */}
            {plates.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Individual Plates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plates.map(plate => (
                  <Card key={plate.id} className="bg-nextplate-darkgray border-gray-800 hover:ring-2 hover:ring-nextplate-red transition-all">
                    <div className="h-48 relative overflow-hidden rounded-t-lg">
                      <img 
                        src={plate.imageUrl || "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"} 
                        alt={plate.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 gradient-overlay flex items-end p-4">
                        <div>
                          <h3 className="text-lg font-bold mb-1">{plate.name}</h3>
                          <p className="text-xs text-gray-300">
                            {plate.quantity} available • {plate.size}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                        {plate.nutritionalInfo || "Delicious homemade meal"}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-400 mb-3">
                        <Calendar size={12} className="mr-1 text-blue-500" />
                        Available: {new Date(plate.availableDate).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-nextplate-red">${plate.price}</span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-nextplate-red text-nextplate-red hover:bg-nextplate-red hover:text-white"
                            onClick={() => navigate(`/plate/${plate.id}`)}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-nextplate-red hover:bg-red-600"
                            onClick={() => handleOrderPlate(plate.id, plate.name, plate.price, sellerUserId)}
                          >
                            Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>
              </div>
            )}
            
            {/* No Content State */}
            {plates.length === 0 && bundles.length === 0 && (
              <Card className="bg-nextplate-darkgray border-gray-800">
                <CardContent className="p-12 text-center">
                  <div className="text-gray-500 mb-4">
                    <Clock size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Menu Items Available</h3>
                  <p className="text-gray-400">
                    {seller.businessName || seller.name} doesn't have any plates or bundles available right now. 
                    Check back later for delicious options!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerMenuView;