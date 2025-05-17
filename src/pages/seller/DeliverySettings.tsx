
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import DeliveryAddressManager from "@/components/seller/DeliveryAddressManager";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const DeliverySettings = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deliveryZipCodes, setDeliveryZipCodes] = useState("");

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?type=seller");
    }

    // Load saved delivery ZIP codes
    const savedZipCodes = localStorage.getItem("deliveryZipCodes");
    if (savedZipCodes) {
      setDeliveryZipCodes(savedZipCodes);
    }
  }, [isAuthenticated, navigate]);

  const saveDeliveryZipCodes = () => {
    localStorage.setItem("deliveryZipCodes", deliveryZipCodes);
    toast({
      title: "Delivery areas updated",
      description: "Your delivery ZIP codes have been saved.",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <MapPin className="mr-2 text-nextplate-orange" />
              Delivery Settings
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your pickup locations and delivery options
            </p>
          </div>
          
          <div className="space-y-8">
            <Card className="bg-nextplate-darkgray border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 text-nextplate-orange" />
                  Pickup Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryAddressManager />
              </CardContent>
            </Card>
            
            <Card className="bg-nextplate-darkgray border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 text-nextplate-orange" />
                  Delivery Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Delivery ZIP Codes or Neighborhoods
                    </label>
                    <Textarea
                      value={deliveryZipCodes}
                      onChange={(e) => setDeliveryZipCodes(e.target.value)}
                      placeholder="Enter ZIP codes or neighborhoods where you deliver (e.g. 90210, Hollywood, Downtown)"
                      className="bg-black border-nextplate-lightgray text-white"
                      rows={4}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Enter each delivery area on a new line or separate with commas
                    </p>
                  </div>
                  
                  <Button onClick={saveDeliveryZipCodes} className="bg-nextplate-orange hover:bg-orange-600">
                    Save Delivery Areas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <Link to="/profile">
              <Button variant="outline" className="mr-2">
                Back to Profile
              </Button>
            </Link>
            <Link to="/seller/dashboard">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySettings;
