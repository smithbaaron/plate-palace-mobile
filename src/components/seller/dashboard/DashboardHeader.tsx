
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/use-notifications";

interface DashboardHeaderProps {
  onAddPlateClick: () => void;
  onCreateMealPrepClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onAddPlateClick, onCreateMealPrepClick }) => {
  const { currentUser } = useAuth();
  const { notifyInfo } = useNotifications();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">{currentUser?.username}'s Kitchen</h1>
        <p className="text-gray-400">Seller Dashboard</p>
      </div>
      
      <div className="flex space-x-3 mt-4 md:mt-0">
        <Button
          onClick={onAddPlateClick}
          className="bg-nextplate-orange hover:bg-orange-600 flex items-center"
        >
          <Plus size={16} className="mr-1" />
          New Plate
        </Button>
        <Button
          onClick={onCreateMealPrepClick}
          className="bg-nextplate-orange hover:bg-orange-600 flex items-center"
        >
          <Plus size={16} className="mr-1" />
          Meal Prep
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
