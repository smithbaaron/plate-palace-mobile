
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, PackageCheck, Bell, Users, Clock } from "lucide-react";
import AddSinglePlateForm from "@/components/seller/AddSinglePlateForm";
import { format } from "date-fns";

// Define the plate type
interface Plate {
  id: string;
  name: string;
  quantity: number;
  price: number;
  nutritionalInfo?: string;
  availableDate: Date;
  imageUrl?: string;
  soldCount: number;
}

const SellerDashboard = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddPlateOpen, setIsAddPlateOpen] = useState(false);
  const [plates, setPlates] = useState<Plate[]>([]);
  
  // Load plates from localStorage on mount
  useEffect(() => {
    const savedPlates = localStorage.getItem("sellerPlates");
    if (savedPlates) {
      // Parse and convert string dates back to Date objects
      const parsedPlates = JSON.parse(savedPlates).map((plate: any) => ({
        ...plate,
        availableDate: new Date(plate.availableDate)
      }));
      setPlates(parsedPlates);
    }
  }, []);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?type=seller");
      return;
    }
  }, [isAuthenticated, navigate]);
  
  const handleCreateMealPrep = () => {
    toast({
      title: "Coming soon!",
      description: "This feature will be available in the next update.",
    });
  };
  
  // Function to handle adding a new plate
  const handleAddPlate = (newPlate: Omit<Plate, 'id' | 'soldCount'>) => {
    const plate: Plate = {
      ...newPlate,
      id: crypto.randomUUID(),
      soldCount: 0,
    };
    
    const updatedPlates = [...plates, plate];
    setPlates(updatedPlates);
    
    // Save to localStorage
    localStorage.setItem("sellerPlates", JSON.stringify(updatedPlates));
    
    toast({
      title: "Plate Added",
      description: `${newPlate.name} has been added to your menu.`,
    });
    
    setIsAddPlateOpen(false);
  };
  
  // Get today's plates (available today)
  const todaysPlates = plates.filter(
    plate => isSameDay(plate.availableDate, new Date())
  );
  
  // Get future plates (available after today)
  const futurePlates = plates.filter(
    plate => isAfterDay(plate.availableDate, new Date())
  );
  
  // Group future plates by date
  const groupedFuturePlates = futurePlates.reduce((acc, plate) => {
    const dateStr = format(plate.availableDate, 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(plate);
    return acc;
  }, {} as Record<string, Plate[]>);
  
  // Helper function to check if two dates are the same day
  function isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  
  // Helper function to check if date1 is after date2
  function isAfterDay(date1: Date, date2: Date): boolean {
    const d1 = new Date(date1);
    d1.setHours(0, 0, 0, 0);
    
    const d2 = new Date(date2);
    d2.setHours(0, 0, 0, 0);
    
    return d1 > d2;
  }
  
  // Plate card component
  const PlateCard = ({ plate }: { plate: Plate }) => (
    <div className="bg-black bg-opacity-40 rounded-lg p-4 flex items-center space-x-3">
      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
        {plate.imageUrl ? (
          <img 
            src={plate.imageUrl} 
            alt={plate.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <span>No image</span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{plate.name}</h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-nextplate-orange font-bold">${plate.price.toFixed(2)}</span>
          <span className="text-sm text-gray-400">{plate.quantity - plate.soldCount} left</span>
        </div>
      </div>
    </div>
  );
  
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
              <div className="bg-nextplate-darkgray rounded-xl p-6">
                {todaysPlates.length > 0 ? (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold">Today's Menu</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {todaysPlates.map(plate => (
                        <PlateCard key={plate.id} plate={plate} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
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
                )}
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
              <div className="bg-nextplate-darkgray rounded-xl p-6">
                {Object.keys(groupedFuturePlates).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(groupedFuturePlates)
                      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                      .map(([dateStr, platesForDate]) => (
                        <div key={dateStr} className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={20} className="text-nextplate-orange" />
                            <h2 className="text-lg font-bold">
                              {format(new Date(dateStr), 'EEEE, MMMM d, yyyy')}
                            </h2>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            {platesForDate.map(plate => (
                              <PlateCard key={plate.id} plate={plate} />
                            ))}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Calendar size={64} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold mb-1">No scheduled items</h3>
                    <p className="text-gray-400">
                      Your upcoming meal schedule will appear here.
                    </p>
                  </div>
                )}
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
                  <p className="text-2xl font-bold">{plates.length}</p>
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
