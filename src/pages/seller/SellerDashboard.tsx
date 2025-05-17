
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, PackageCheck, Bell, Users } from "lucide-react";

const SellerDashboard = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?type=seller");
      return;
    }
  }, [isAuthenticated, navigate]);
  
  const handleCreatePlate = () => {
    toast({
      title: "Coming soon!",
      description: "This feature will be available in the next update.",
    });
  };
  
  const handleCreateMealPrep = () => {
    toast({
      title: "Coming soon!",
      description: "This feature will be available in the next update.",
    });
  };
  
  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">{currentUser?.username}'s Kitchen</h1>
              <p className="text-gray-400">Seller Dashboard</p>
            </div>
            
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Button
                onClick={handleCreatePlate}
                className="bg-nextplate-orange hover:bg-orange-600 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                New Plate
              </Button>
              <Button
                onClick={handleCreateMealPrep}
                className="bg-nextplate-orange hover:bg-orange-600 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Meal Prep
              </Button>
            </div>
          </div>
          
          {/* Dashboard Tabs */}
          <Tabs defaultValue="menu">
            <TabsList className="w-full bg-nextplate-darkgray mb-6">
              <TabsTrigger value="menu" className="flex-1">Menu</TabsTrigger>
              <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1">Schedule</TabsTrigger>
              <TabsTrigger value="customers" className="flex-1">Customers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu" className="animate-fade-in">
              <div className="bg-nextplate-darkgray rounded-xl p-6 text-center">
                <div className="py-20">
                  <h3 className="text-xl font-bold mb-4">Your menu is empty</h3>
                  <p className="text-gray-400 mb-6">
                    Start by adding single plates or meal prep packages to your menu.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      onClick={handleCreatePlate}
                      className="bg-nextplate-orange hover:bg-orange-600"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Single Plate
                    </Button>
                    <Button
                      onClick={handleCreateMealPrep}
                      className="bg-nextplate-orange hover:bg-orange-600"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Meal Prep Package
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="orders" className="animate-fade-in">
              <div className="bg-nextplate-darkgray rounded-xl p-6 flex-center">
                <div className="text-center py-16">
                  <PackageCheck size={64} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-bold mb-1">No orders yet</h3>
                  <p className="text-gray-400">
                    Orders will appear here once customers start purchasing.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="animate-fade-in">
              <div className="bg-nextplate-darkgray rounded-xl p-6 flex-center">
                <div className="text-center py-16">
                  <Calendar size={64} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-bold mb-1">No scheduled items</h3>
                  <p className="text-gray-400">
                    Your upcoming meal schedule will appear here.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="customers" className="animate-fade-in">
              <div className="bg-nextplate-darkgray rounded-xl p-6 flex-center">
                <div className="text-center py-16">
                  <Users size={64} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-bold mb-1">No customers yet</h3>
                  <p className="text-gray-400">
                    Customers who follow your store will appear here.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-nextplate-darkgray rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black bg-opacity-50 rounded-lg">
                  <p className="text-sm text-gray-400">Total Sales</p>
                  <p className="text-2xl font-bold">$0</p>
                </div>
                <div className="p-3 bg-black bg-opacity-50 rounded-lg">
                  <p className="text-sm text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="p-3 bg-black bg-opacity-50 rounded-lg">
                  <p className="text-sm text-gray-400">Menu Items</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="p-3 bg-black bg-opacity-50 rounded-lg">
                  <p className="text-sm text-gray-400">Followers</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-nextplate-darkgray rounded-xl p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Recent Activity</h3>
                <Bell size={18} className="text-gray-400" />
              </div>
              <div className="p-6 flex-center bg-black bg-opacity-50 rounded-lg">
                <p className="text-gray-400">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
