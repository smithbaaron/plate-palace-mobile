
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plate } from "@/components/seller/PlateFormTypes";
import PlateCard from "./PlateCard";
import EmptyMenuState from "./EmptyMenuState";

interface MenuTabContentProps {
  todayPlates: Plate[];
  onAddPlateClick: () => void;
  onCreateMealPrepClick: () => void;
  mealPrepPlatesCount: number;
}

const MenuTabContent: React.FC<MenuTabContentProps> = ({ 
  todayPlates, 
  onAddPlateClick, 
  onCreateMealPrepClick,
  mealPrepPlatesCount 
}) => {
  const navigate = useNavigate();

  const handleCreateMealPrep = () => {
    navigate("/seller/create-bundle");
  };

  if (todayPlates.length === 0) {
    return <EmptyMenuState 
      onAddPlateClick={onAddPlateClick}
      onCreateMealPrepClick={handleCreateMealPrep}
      mealPrepPlatesCount={mealPrepPlatesCount}
    />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {todayPlates.map((plate) => (
        <PlateCard key={plate.id} plate={plate} />
      ))}
    </div>
  );
};

export default MenuTabContent;
