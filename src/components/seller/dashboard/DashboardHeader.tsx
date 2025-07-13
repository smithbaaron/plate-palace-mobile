
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  onAddPlateClick: () => void;
  onCreateMealPrepClick: () => void;
  mealPrepPlatesCount: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onAddPlateClick, 
  onCreateMealPrepClick, 
  mealPrepPlatesCount 
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleCreateBundle = () => {
    navigate("/seller/create-bundle");
  };

  const canCreateMealPrep = mealPrepPlatesCount >= 1;

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
        {canCreateMealPrep && (
          <Button
            onClick={handleCreateBundle}
            className="bg-green-600 hover:bg-green-700 flex items-center"
          >
            <Package size={16} className="mr-1" />
            Create Meal Prep Package
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
