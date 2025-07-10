
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";
import DeliveryAddressManager from "@/components/seller/DeliveryAddressManager";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { userType } = useUserType();
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryZipCodes, setDeliveryZipCodes] = useState("");
  const { toast } = useToast();

  // Load saved delivery zip codes
  useEffect(() => {
    if (userType === "seller") {
      const savedZipCodes = localStorage.getItem("deliveryZipCodes");
      if (savedZipCodes) {
        setDeliveryZipCodes(savedZipCodes);
      }
    }
  }, [userType]);

  const handleLogout = () => {
    setIsLoading(true);
    logout();
    // No need for redirect as Navigation will handle it
    setIsLoading(false);
  };

  const saveDeliveryZipCodes = () => {
    localStorage.setItem("deliveryZipCodes", deliveryZipCodes);
    toast({
      title: "Delivery areas updated",
      description: "Your delivery ZIP codes have been saved.",
    });
  };

  // Determine dashboard URL based on user type
  const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="container max-w-4xl mx-auto pt-24 pb-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        <Tabs defaultValue="account" className="mb-8">
          <TabsList className="bg-nextplate-darkgray border-gray-800">
            <TabsTrigger value="account">Account</TabsTrigger>
            {userType === "seller" && (
              <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="account">
            <Card className="bg-nextplate-darkgray border-gray-800">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-400">Username</p>
                  <p className="text-white text-lg">{currentUser?.username}</p>
                </div>
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="text-white text-lg">{currentUser?.email}</p>
                </div>
                <div>
                  <p className="text-gray-400">Account Type</p>
                  <p className="text-white text-lg capitalize">{userType || "Customer"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {userType === "seller" && (
            <TabsContent value="delivery">
              <Card className="bg-nextplate-darkgray border-gray-800 mb-6">
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
            </TabsContent>
          )}
        </Tabs>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to={dashboardUrl}>
            <Button variant="outline" className="w-full sm:w-auto">
              Back to Dashboard
            </Button>
          </Link>
          {userType === "seller" && (
            <Link to="/seller/delivery-settings">
              <Button variant="outline" className="w-full sm:w-auto">
                Delivery Settings
              </Button>
            </Link>
          )}
          <Button 
            variant="destructive" 
            className="w-full sm:w-auto"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
