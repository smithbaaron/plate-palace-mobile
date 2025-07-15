import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Trash2, Calendar, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { bundleService, Bundle } from "@/lib/bundles-service";
import { format } from "date-fns";

const BundlesTabContent: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBundles = async () => {
    try {
      setIsLoading(true);
      const bundlesData = await bundleService.getBundles();
      setBundles(bundlesData);
    } catch (error) {
      console.error("Error loading bundles:", error);
      toast({
        title: "Error",
        description: "Failed to load meal prep bundles.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBundles();
  }, []);

  const handleDeleteBundle = async (bundleId: string, bundleName: string) => {
    try {
      await bundleService.deleteBundle(bundleId);
      setBundles(bundles.filter(bundle => bundle.id !== bundleId));
      toast({
        title: "Bundle Deleted",
        description: `${bundleName} has been removed from your menu.`,
      });
    } catch (error) {
      console.error("Error deleting bundle:", error);
      toast({
        title: "Error",
        description: "Failed to delete bundle. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextplate-orange"></div>
      </div>
    );
  }

  if (bundles.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Meal Prep Bundles</h3>
        <p className="text-gray-400 mb-6">
          Create your first meal prep bundle to offer customers value packages.
        </p>
        <Button
          onClick={() => navigate("/seller/create-bundle")}
          className="bg-nextplate-orange hover:bg-orange-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Bundle
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Meal Prep Bundles</h2>
          <p className="text-gray-400">Manage your meal prep package offerings</p>
        </div>
        <Button
          onClick={() => navigate("/seller/create-bundle")}
          className="bg-nextplate-orange hover:bg-orange-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Bundle
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (
          <Card key={bundle.id} className="bg-nextplate-darkgray border-gray-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{bundle.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {bundle.plate_count} plates
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteBundle(bundle.id, bundle.name)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price and Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-green-400">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-semibold">${bundle.price.toFixed(2)}</span>
                </div>
                <Badge variant="outline" className="text-gray-300 border-gray-600">
                  {bundle.availability_scope === 'day' ? 'Daily' : 'Weekly'}
                </Badge>
              </div>

              {/* Available Date */}
              <div className="flex items-center text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  Available: {format(new Date(bundle.available_date), "MMM d, yyyy")}
                </span>
              </div>

              {/* Plates in Bundle */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Included Plates:</h4>
                <div className="space-y-1">
                  {bundle.bundle_plates?.map((bundlePlate) => (
                    <div key={bundlePlate.plate_id} className="text-xs text-gray-400 flex items-center justify-between">
                      <span>{bundlePlate.plates.name} x{bundlePlate.quantity}</span>
                      <span>${(bundlePlate.plates.price * bundlePlate.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Value Calculation */}
              {bundle.bundle_plates && bundle.bundle_plates.length > 0 && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Individual Total:</span>
                    <span className="text-gray-400">
                      ${bundle.bundle_plates.reduce((sum, bp) => sum + (bp.plates.price * bp.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-green-400">Bundle Savings:</span>
                    <span className="text-green-400">
                      ${(bundle.bundle_plates.reduce((sum, bp) => sum + (bp.plates.price * bp.quantity), 0) - bundle.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BundlesTabContent;