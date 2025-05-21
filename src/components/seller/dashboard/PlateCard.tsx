
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Plate } from "@/components/seller/PlateFormTypes";

interface PlateCardProps {
  plate: Plate;
  showQuantity?: boolean;
}

const PlateCard: React.FC<PlateCardProps> = ({ plate, showQuantity = true }) => {
  return (
    <Card key={plate.id} className="bg-nextplate-darkgray overflow-hidden">
      <div className="h-32 w-full bg-gray-800 flex items-center justify-center overflow-hidden">
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
          {showQuantity && (
            <span className="text-sm text-gray-400">
              {plate.quantity - plate.soldCount} available
            </span>
          )}
        </div>
        {plate.nutritionalInfo && (
          <p className="text-xs text-gray-400 mt-2">
            {plate.nutritionalInfo}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PlateCard;
