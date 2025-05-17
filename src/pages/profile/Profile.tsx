
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { userType } = useUserType();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    logout();
    // No need for redirect as Navigation will handle it
    setIsLoading(false);
  };

  // Determine dashboard URL based on user type
  const dashboardUrl = userType === "seller" ? "/seller/dashboard" : "/customer/dashboard";

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="container max-w-4xl mx-auto pt-24 pb-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        <Card className="mb-8 bg-nextplate-darkgray border-gray-800">
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
              <p className="text-white text-lg capitalize">{userType || "Not Set"}</p>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to={dashboardUrl}>
            <Button variant="outline" className="w-full sm:w-auto">
              Back to Dashboard
            </Button>
          </Link>
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
