
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyMenuStateProps {
  onAddPlateClick: () => void;
  onCreateMealPrepClick: () => void;
}

const EmptyMenuState: React.FC<EmptyMenuStateProps> = ({ onAddPlateClick, onCreateMealPrepClick }) => {
  return (
    <div className="bg-nextplate-darkgray rounded-xl p-6 text-center">
      <div className="py-20">
        <h3 className="text-xl font-bold mb-4">Your menu is empty</h3>
        <p className="text-gray-400 mb-6">
          Start by adding single plates or meal prep packages to your menu.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={onAddPlateClick}
            className="bg-nextplate-orange hover:bg-orange-600"
          >
            <Plus size={16} className="mr-1" />
            Add Single Plate
          </Button>
          <Button
            onClick={onCreateMealPrepClick}
            className="bg-nextplate-orange hover:bg-orange-600"
          >
            <Plus size={16} className="mr-1" />
            Add Meal Prep Package
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyMenuState;
