import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Bundle } from "@/lib/bundles-service";

interface BundlePlateSelectorProps {
  bundle: Bundle;
  onSelectionComplete: (selectedPlates: { plateId: string; quantity: number }[]) => void;
  onCancel: () => void;
}

const BundlePlateSelector: React.FC<BundlePlateSelectorProps> = ({
  bundle,
  onSelectionComplete,
  onCancel
}) => {
  const { toast } = useToast();
  const [selectedPlates, setSelectedPlates] = useState<{ [plateId: string]: number }>({});
  
  // Calculate total selected plates
  const totalSelected = Object.values(selectedPlates).reduce((sum, qty) => sum + qty, 0);
  const remainingToSelect = bundle.plate_count - totalSelected;
  
  const handlePlateQuantityChange = (plateId: string, change: number) => {
    const currentQty = selectedPlates[plateId] || 0;
    const newQty = Math.max(0, currentQty + change);
    const availableQty = bundle.bundle_plates?.find(bp => bp.plate_id === plateId)?.quantity || 0;
    
    // Don't allow more than available or more than remaining slots
    const maxAllowed = Math.min(availableQty, remainingToSelect + currentQty);
    const finalQty = Math.min(newQty, maxAllowed);
    
    if (finalQty === 0) {
      const newSelected = { ...selectedPlates };
      delete newSelected[plateId];
      setSelectedPlates(newSelected);
    } else {
      setSelectedPlates(prev => ({
        ...prev,
        [plateId]: finalQty
      }));
    }
  };

  const handleCompleteSelection = () => {
    if (totalSelected !== bundle.plate_count) {
      toast({
        title: "Incomplete Selection",
        description: `Please select exactly ${bundle.plate_count} plates for your bundle.`,
        variant: "destructive",
      });
      return;
    }

    const selectionArray = Object.entries(selectedPlates).map(([plateId, quantity]) => ({
      plateId,
      quantity
    }));

    onSelectionComplete(selectionArray);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-nextplate-darkgray border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-center">
            Select Your {bundle.plate_count} Plates
          </CardTitle>
          <div className="text-center">
            <Badge variant="outline" className="text-nextplate-orange border-nextplate-orange">
              {totalSelected} / {bundle.plate_count} selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bundle.bundle_plates?.map((bundlePlate) => {
            const selectedQty = selectedPlates[bundlePlate.plate_id] || 0;
            const canSelectMore = totalSelected < bundle.plate_count;
            const maxSelectableFromThis = Math.min(
              bundlePlate.quantity,
              remainingToSelect + selectedQty
            );

            return (
              <div key={bundlePlate.plate_id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-white font-medium">{bundlePlate.plates.name}</h4>
                  <p className="text-gray-400 text-sm">
                    ${bundlePlate.plates.price.toFixed(2)} • Size: {bundlePlate.plates.size}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Available: {bundlePlate.quantity}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlateQuantityChange(bundlePlate.plate_id, -1)}
                    disabled={selectedQty === 0}
                    className="w-8 h-8 p-0"
                  >
                    -
                  </Button>
                  
                  <span className="text-white font-medium w-8 text-center">
                    {selectedQty}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlateQuantityChange(bundlePlate.plate_id, 1)}
                    disabled={!canSelectMore || selectedQty >= maxSelectableFromThis}
                    className="w-8 h-8 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-gray-600 text-gray-300"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCompleteSelection}
          disabled={totalSelected !== bundle.plate_count}
          className="bg-nextplate-orange hover:bg-orange-600"
        >
          Add to Cart ({totalSelected}/{bundle.plate_count})
        </Button>
      </div>
    </div>
  );
};

export default BundlePlateSelector;