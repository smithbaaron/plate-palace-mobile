import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Calendar, 
  PackageCheck, 
  Bell, 
  Users, 
  DollarSign 
} from "lucide-react";
import AddSinglePlateForm, { Plate } from "@/components/seller/AddSinglePlateForm";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

const SellerDashboard = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddPlateOpen, setIsAddPlateOpen] = useState(false);
  const [plates, setPlates] = useState<Plate[]>(() => {
    // Load plates from localStorage if available
    const savedPlates = localStorage.getItem("sellerPlates");
    return savedPlates ? JSON.parse(savedPlates) : [];
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?type=seller");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Save plates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("sellerPlates", JSON.stringify(plates));
  }, [plates]);
  
  const handleCreateMealPrep = () => {
    toast({
      title: "Coming soon!",
      description: "This feature will be available in the next update.",
    });
  };

  const handleAddPlate = (newPlateData: Omit<Plate, "id" | "soldCount">) => {
    const newPlate: Plate = {
      ...newPlateData,
      id: `plate-${Date.now()}`,
      soldCount: 0,
      // Convert date string back to Date object if it's a string
      availableDate: new Date(newPlateData.availableDate)
    };
    
    setPlates(prevPlates => [...prevPlates, newPlate]);
  };

  // Filter plates based on available date
  const todayPlates = plates.filter(plate => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const plateDate = new Date(plate.availableDate);
    plateDate.setHours(0, 0, 0, 0);
    return plateDate.getTime() === today.getTime();
  });

  // Group future plates by date
  const futurePlates = plates.filter(plate => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const plateDate = new Date(plate.availableDate);
    plateDate.setHours(0, 0, 0, 0);
    return plateDate.getTime() > today.getTime();
  });

  // Create a map of dates to plates
  const platesByDate = futurePlates.reduce<Record<string, Plate[]>>((acc, plate) => {
    const dateStr = format(new Date(plate.availableDate), 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(plate);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(platesByDate).sort();

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
                onClick={() => setIsAddPlateOpen(true)}
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
              {todayPlates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {todayPlates.map((plate) => (
                    <Card key={plate.id} className="bg-nextplate-darkgray overflow-hidden">
                      <div 
                        className="h-32 w-full bg-gray-800 flex items-center justify-center overflow-hidden"
                      >
                        {plate.imageUrl ? (
                          <img 
                            src={plate.imageUrl} 
                            alt={plate.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-500">No Image</div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-1">{plate.name}</h3>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center text-nextplate-orange font-medium">
                            <DollarSign size={16} className="mr-1" />
                            {plate.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-400">
                            {plate.quantity - plate.soldCount} available
                          </span>
                        </div>
                        {plate.nutritionalInfo && (
                          <p className="text-xs text-gray-400 mt-2">
                            {plate.nutritionalInfo}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-nextplate-darkgray rounded-xl p-6 text-center">
                  <div className="py-20">
                    <h3 className="text-xl font-bold mb-4">Your menu is empty</h3>
                    <p className="text-gray-400 mb-6">
                      Start by adding single plates or meal prep packages to your menu.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        onClick={() => setIsAddPlateOpen(true)}
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
              )}
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
              {sortedDates.length > 0 ? (
                <div className="space-y-6">
                  {sortedDates.map(dateStr => (
                    <div key={dateStr} className="bg-nextplate-darkgray rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <Calendar size={20} className="mr-2 text-nextplate-orange" />
                        {format(new Date(dateStr), 'EEEE, MMMM d, yyyy')}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {platesByDate[dateStr].map((plate) => (
                          <Card key={plate.id} className="bg-black overflow-hidden">
                            <div 
                              className="h-24 w-full bg-gray-800 flex items-center justify-center overflow-hidden"
                            >
                              {plate.imageUrl ? (
                                <img 
                                  src={plate.imageUrl} 
                                  alt={plate.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-gray-500">No Image</div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <h4 className="font-bold mb-1">{plate.name}</h4>
                              <div className="flex justify-between items-center">
                                <span className="flex items-center text-nextplate-orange font-medium">
                                  <DollarSign size={16} className="mr-1" />
                                  {plate.price.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {plate.quantity} total
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-nextplate-darkgray rounded-xl p-6 flex-center">
                  <div className="text-center py-16">
                    <Calendar size={64} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold mb-1">No scheduled items</h3>
                    <p className="text-gray-400">
                      Your upcoming meal schedule will appear here.
                    </p>
                  </div>
                </div>
              )}
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
                  <p className="text-sm text-gray-400">Current Menu</p>
                  <p className="text-2xl font-bold">{todayPlates.length}</p>
                </div>
                <div className="p-3 bg-black bg-opacity-50 rounded-lg">
                  <p className="text-sm text-gray-400">Future Menu</p>
                  <p className="text-2xl font-bold">{futurePlates.length}</p>
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
      
      {/* Add Single Plate Form Modal */}
      <AddSinglePlateForm 
        open={isAddPlateOpen} 
        onOpenChange={setIsAddPlateOpen}
        onSubmit={handleAddPlate}
      />
    </div>
  );
};

export default SellerDashboard;
