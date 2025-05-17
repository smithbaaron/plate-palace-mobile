
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import DeliveryAddressManager from "@/components/seller/DeliveryAddressManager";
import { MapPin } from "lucide-react";

const DeliverySettings = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?type=seller");
    }
  }, [isAuthenticated, navigate]);

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
          
          <div className="bg-black bg-opacity-30 rounded-xl p-6 shadow-xl">
            <DeliveryAddressManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySettings;
