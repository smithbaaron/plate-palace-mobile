import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Package, DollarSign, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { bundleService, Bundle } from "@/lib/bundles-service";
import { createBundleOrder } from "@/lib/orders-service";
import { format } from "date-fns";
import Navigation from "@/components/Navigation";
import BundlePlateSelector from "@/components/customer/BundlePlateSelector";

const MealPrepDetails = () => {
  const { bundleId } = useParams<{ bundleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlateSelector, setShowPlateSelector] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    const fetchBundle = async () => {
      if (!bundleId) {
        navigate("/customer/dashboard?tab=mealpreps");
        return;
      }

      try {
        setLoading(true);
        const bundlesData = await bundleService.getAvailableBundles();
        const foundBundle = bundlesData.find(b => b.id === bundleId);
        
        if (!foundBundle) {
          toast({
            title: "Bundle Not Found",
            description: "The meal prep bundle you're looking for doesn't exist.",
            variant: "destructive",
          });
          navigate("/customer/dashboard?tab=mealpreps");
          return;
        }

        // Check if bundle is still available
        const isAvailable = await bundleService.checkBundleAvailability(bundleId);
        if (!isAvailable) {
          toast({
            title: "Bundle Unavailable",
            description: "This bundle is no longer available for purchase.",
            variant: "destructive",
          });
        }

        setBundle(foundBundle);
      } catch (error) {
        console.error("Error fetching bundle:", error);
        toast({
          title: "Error",
          description: "Failed to load bundle details.",
          variant: "destructive",
        });
        navigate("/customer/dashboard?tab=mealpreps");
      } finally {
        setLoading(false);
      }
    };

    fetchBundle();
  }, [bundleId, navigate, toast]);

  const handleStartOrder = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase meal prep bundles.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setShowPlateSelector(true);
  };

  const handlePlateSelectionComplete = async (selectedPlates: { plateId: string; quantity: number }[]) => {
    if (!bundle || !currentUser) return;

    try {
      setIsOrdering(true);
      
      await createBundleOrder({
        customerId: currentUser.id,
        bundleId: bundle.id,
        sellerId: bundle.seller_id,
        selectedPlates,
        bundlePrice: bundle.price,
        deliveryType: 'pickup' // Default for now, could be made selectable
      });

      toast({
        title: "Order Placed Successfully!",
        description: `Your ${bundle.name} bundle has been ordered. You'll receive confirmation shortly.`,
      });

      navigate("/customer/dashboard?tab=history");
    } catch (error: any) {
      console.error("Error creating bundle order:", error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOrdering(false);
      setShowPlateSelector(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextplate-orange"></div>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="pt-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Bundle Not Found</h1>
          <Button onClick={() => navigate("/customer/dashboard?tab=mealpreps")}>
            Back to Meal Preps
          </Button>
        </div>
      </div>
    );
  }

  // Calculate total value and savings
  const totalIndividualValue = bundle.bundle_plates?.reduce((sum, bp) => 
    sum + (bp.plates.price * bp.quantity), 0) || 0;
  const savings = totalIndividualValue - bundle.price;
  const totalAvailablePlates = bundle.bundle_plates?.reduce((sum, bp) => sum + bp.quantity, 0) || 0;
  const maxPossibleBundles = Math.floor(totalAvailablePlates / bundle.plate_count);

  if (showPlateSelector) {
    return (
      <div className="min-h-screen bg-black text-white pb-16">
        <Navigation />
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setShowPlateSelector(false)}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Bundle Details
              </Button>
            </div>
            
            <BundlePlateSelector
              bundle={bundle}
              onSelectionComplete={handlePlateSelectionComplete}
              onCancel={() => setShowPlateSelector(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/customer/dashboard?tab=mealpreps")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Meal Preps
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-nextplate-darkgray">
                <img
                  src={bundle.bundle_plates?.[0]?.plates?.image_url || "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"}
                  alt={bundle.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Bundle Stats */}
              <Card className="bg-nextplate-darkgray border-gray-800">
                <CardHeader className="pb-3">
                  <h3 className="text-white font-medium">Bundle Information</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Plates Available:</span>
                    <span className="text-white">{totalAvailablePlates}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Max Bundles Possible:</span>
                    <span className="text-white">{maxPossibleBundles}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Plates Per Bundle:</span>
                    <span className="text-white">{bundle.plate_count}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{bundle.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold text-nextplate-orange">${bundle.price.toFixed(2)}</span>
                  <Badge variant="outline" className="text-nextplate-orange border-nextplate-orange">
                    {bundle.plate_count} plates
                  </Badge>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Choose {bundle.plate_count} plates from our available selection. Perfect for meal prep!
                </p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Available: {format(new Date(bundle.available_date), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">{bundle.availability_scope}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">${(bundle.price / bundle.plate_count).toFixed(2)}/plate</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Choose your plates</span>
                </div>
              </div>

              {/* Availability Status */}
              {maxPossibleBundles > 0 ? (
                <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                  <p className="text-green-400 font-medium">
                    ✅ Available - {maxPossibleBundles} bundle{maxPossibleBundles !== 1 ? 's' : ''} can be made
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-red-400 font-medium">❌ Currently unavailable</p>
                </div>
              )}

              {/* Savings Information */}
              {savings > 0 && (
                <Card className="bg-nextplate-darkgray border-gray-800">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Individual Plate Value:</span>
                        <span className="text-gray-400">${totalIndividualValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-green-400">Bundle Price:</span>
                        <span className="text-green-400">${bundle.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-green-400">You Save:</span>
                        <span className="text-green-400">${savings.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Button */}
              <div className="space-y-3">
                <Button
                  onClick={handleStartOrder}
                  disabled={maxPossibleBundles === 0 || isOrdering}
                  className="w-full bg-nextplate-orange hover:bg-orange-600 text-white font-medium py-3"
                  size="lg"
                >
                  {isOrdering ? "Processing..." : `Select Your ${bundle.plate_count} Plates - $${bundle.price.toFixed(2)}`}
                </Button>
              </div>
            </div>
          </div>

          {/* Available Plates Preview */}
          <div className="mt-12">
            <Card className="bg-nextplate-darkgray border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Available Plates in this Bundle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bundle.bundle_plates?.map((bundlePlate) => (
                    <div key={bundlePlate.plate_id} className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-1">{bundlePlate.plates.name}</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        ${bundlePlate.plates.price.toFixed(2)} • Size: {bundlePlate.plates.size}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Available:</span>
                        <Badge variant="outline" className="text-nextplate-orange border-nextplate-orange">
                          {bundlePlate.quantity} plates
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPrepDetails;