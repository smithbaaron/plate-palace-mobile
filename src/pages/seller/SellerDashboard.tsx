
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/use-notifications";
import AddSinglePlateForm from "@/components/seller/AddSinglePlateForm";

// Import refactored components
import DashboardHeader from "@/components/seller/dashboard/DashboardHeader";
import MenuTabContent from "@/components/seller/dashboard/MenuTabContent";
import OrdersTabContent from "@/components/seller/dashboard/OrdersTabContent";
import ScheduleTabContent from "@/components/seller/dashboard/ScheduleTabContent";
import CustomersTabContent from "@/components/seller/dashboard/CustomersTabContent";
import DashboardStats from "@/components/seller/dashboard/DashboardStats";
import LoadingState from "@/components/seller/dashboard/LoadingState";
import DatabaseSetupRequired from "@/components/seller/dashboard/DatabaseSetupRequired";

// Import custom hooks
import { useSellerPlates } from "@/hooks/seller/use-seller-plates";

const SellerDashboard = () => {
  const { notifyInfo } = useNotifications();
  const [isAddPlateOpen, setIsAddPlateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");
  
  const {
    todayPlates,
    futurePlates,
    mealPrepPlates,
    platesByDate,
    sortedDates,
    isLoading,
    error,
    tableExists,
    loadPlates,
    handleAddPlate,
  } = useSellerPlates();
  
  const handleCreateMealPrep = () => {
    notifyInfo("Coming soon!", "This feature will be available in the next update.");
  };

  // Only show loading for tabs that depend on plates data
  const platesDataTabs = ["menu", "schedule"];
  const showLoadingForCurrentTab = platesDataTabs.includes(activeTab) && isLoading;

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <DashboardHeader 
            onAddPlateClick={() => setIsAddPlateOpen(true)} 
            onCreateMealPrepClick={handleCreateMealPrep}
            mealPrepPlatesCount={mealPrepPlates.length}
          />
          
          {/* Error message if plates failed to load */}
          {error && tableExists !== false && (
            <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg">
              <p className="text-red-300">{error}</p>
              <button 
                onClick={() => loadPlates()} 
                className="mt-2 text-white border border-red-500 hover:bg-red-900 px-4 py-2 rounded"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-nextplate-darkgray mb-6">
              <TabsTrigger value="menu" className="flex-1">Menu</TabsTrigger>
              <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1">Schedule</TabsTrigger>
              <TabsTrigger value="customers" className="flex-1">Customers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu" className="animate-fade-in">
              {showLoadingForCurrentTab ? (
                <LoadingState />
              ) : tableExists === false ? (
                <DatabaseSetupRequired onRetryClick={loadPlates} />
              ) : (
                <MenuTabContent 
                  todayPlates={todayPlates}
                  onAddPlateClick={() => setIsAddPlateOpen(true)}
                  onCreateMealPrepClick={handleCreateMealPrep}
                />
              )}
            </TabsContent>
            
            <TabsContent value="orders" className="animate-fade-in">
              <OrdersTabContent />
            </TabsContent>
            
            <TabsContent value="schedule" className="animate-fade-in">
              {showLoadingForCurrentTab ? (
                <LoadingState />
              ) : (
                <ScheduleTabContent
                  platesByDate={platesByDate}
                  sortedDates={sortedDates}
                />
              )}
            </TabsContent>
            
            <TabsContent value="customers" className="animate-fade-in">
              <CustomersTabContent />
            </TabsContent>
          </Tabs>
          
          {/* Stats Overview */}
          <DashboardStats 
            todayPlatesCount={todayPlates.length}
            futurePlatesCount={futurePlates.length}
          />
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
