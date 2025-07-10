
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, User, Upload, Camera } from "lucide-react";
import DeliveryAddressManager from "@/components/seller/DeliveryAddressManager";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { userType } = useUserType();
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryZipCodes, setDeliveryZipCodes] = useState("");
  const [businessProfile, setBusinessProfile] = useState({
    businessName: "",
    bio: "",
    phoneNumber: "",
    profileImageUrl: ""
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Load saved delivery zip codes and business profile
  useEffect(() => {
    if (userType === "seller") {
      const savedZipCodes = localStorage.getItem("deliveryZipCodes");
      if (savedZipCodes) {
        setDeliveryZipCodes(savedZipCodes);
      }
      loadBusinessProfile();
    }
  }, [userType]);

  const loadBusinessProfile = async () => {
    if (!currentUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('business_name, bio, phone_number, profile_image_url')
        .eq('user_id', currentUser.id)
        .single();
      
      if (error) {
        console.error('Error loading business profile:', error);
        return;
      }
      
      if (data) {
        setBusinessProfile({
          businessName: data.business_name || "",
          bio: data.bio || "",
          phoneNumber: data.phone_number || "",
          profileImageUrl: data.profile_image_url || ""
        });
      }
    } catch (error) {
      console.error('Error loading business profile:', error);
    }
  };

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

  const updateBusinessProfile = async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('seller_profiles')
        .update({
          business_name: businessProfile.businessName,
          bio: businessProfile.bio,
          phone_number: businessProfile.phoneNumber,
          profile_image_url: businessProfile.profileImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error('Error updating business profile:', error);
        toast({
          title: "Error",
          description: "Failed to update business profile.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Profile updated",
        description: "Your business profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating business profile:', error);
      toast({
        title: "Error",
        description: "Failed to update business profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessProfile({
      ...businessProfile,
      profileImageUrl: e.target.value
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
              <>
                <TabsTrigger value="business">Business Profile</TabsTrigger>
                <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
              </>
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
            <TabsContent value="business">
              <Card className="bg-nextplate-darkgray border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 text-nextplate-red" />
                    Business Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Image Section */}
                  <div className="space-y-4">
                    <Label className="text-sm text-gray-300">Profile Picture</Label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                        {businessProfile.profileImageUrl ? (
                          <img 
                            src={businessProfile.profileImageUrl} 
                            alt="Business profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="text-gray-400" size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="imageUrl" className="text-sm text-gray-300">
                          Image URL
                        </Label>
                        <Input
                          id="imageUrl"
                          type="url"
                          value={businessProfile.profileImageUrl}
                          onChange={handleImageUrlChange}
                          placeholder="https://example.com/your-business-photo.jpg"
                          className="bg-black border-nextplate-lightgray text-white mt-1"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Enter a URL to your business photo or logo
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Business Name */}
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm text-gray-300">
                      Business Name
                    </Label>
                    <Input
                      id="businessName"
                      value={businessProfile.businessName}
                      onChange={(e) => setBusinessProfile({
                        ...businessProfile,
                        businessName: e.target.value
                      })}
                      placeholder="Your business name"
                      className="bg-black border-nextplate-lightgray text-white"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm text-gray-300">
                      Business Description
                    </Label>
                    <Textarea
                      id="bio"
                      value={businessProfile.bio}
                      onChange={(e) => setBusinessProfile({
                        ...businessProfile,
                        bio: e.target.value
                      })}
                      placeholder="Tell customers about your business..."
                      className="bg-black border-nextplate-lightgray text-white"
                      rows={4}
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm text-gray-300">
                      Contact Phone
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={businessProfile.phoneNumber}
                      onChange={(e) => setBusinessProfile({
                        ...businessProfile,
                        phoneNumber: e.target.value
                      })}
                      placeholder="(555) 123-4567"
                      className="bg-black border-nextplate-lightgray text-white"
                    />
                  </div>

                  <Button 
                    onClick={updateBusinessProfile} 
                    className="bg-nextplate-red hover:bg-red-600 w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update Business Profile"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
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
