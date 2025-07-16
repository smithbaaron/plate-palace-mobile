
import { useState, useEffect } from 'react';
import { usePlates } from '@/lib/plates-service';
import { Plate } from '@/components/seller/PlateFormTypes';
import { useNotifications } from '@/hooks/use-notifications';
import { format } from 'date-fns';
import { checkIfTableExists, supabase } from '@/lib/supabase';

export const useSellerPlates = () => {
  const { fetchPlates, addPlate } = usePlates();
  const { notifySuccess, notifyError, notifyPlateAdded } = useNotifications();
  const [plates, setPlates] = useState<Plate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  // Find plates available today
  const todayPlates = plates.filter(plate => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const plateDate = new Date(plate.availableDate);
    plateDate.setHours(0, 0, 0, 0);
    
    console.log('Filtering today plates:', {
      plateName: plate.name,
      plateDate: plateDate.toISOString(),
      today: today.toISOString(),
      isToday: plateDate.getTime() === today.getTime()
    });
    
    return plateDate.getTime() === today.getTime();
  });

  // Find future plates
  const futurePlates = plates.filter(plate => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const plateDate = new Date(plate.availableDate);
    plateDate.setHours(0, 0, 0, 0);
    
    console.log('Filtering future plates:', {
      plateName: plate.name,
      plateDate: plateDate.toISOString(),
      today: today.toISOString(),
      isFuture: plateDate.getTime() > today.getTime()
    });
    
    return plateDate.getTime() > today.getTime();
  });

  // Find plates available for meal prep bundles (non-bundle plates that can be used to create meal preps)
  const mealPrepPlates = plates.filter(plate => {
    console.log('Filtering meal prep plates:', {
      plateName: plate.name,
      isBundle: plate.isBundle,
      isAvailable: plate.isAvailable,
      eligible: !plate.isBundle && plate.isAvailable
    });
    return !plate.isBundle && plate.isAvailable;
  });

  // Group plates by date - include both today's and future plates
  const platesByDate = [...todayPlates, ...futurePlates].reduce<Record<string, Plate[]>>((acc, plate) => {
    const dateStr = format(new Date(plate.availableDate), 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(plate);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(platesByDate).sort();

  // Check if plates table exists
  const checkPlatesTable = async () => {
    const exists = await checkIfTableExists('plates');
    setTableExists(exists);
    return exists;
  };

  // Load plates
  const loadPlates = async () => {
    try {
      setIsLoading(true);
      
      // First check if the table exists
      const exists = await checkPlatesTable();
      
      if (!exists) {
        setError("Plates table does not exist. Please set up your database first.");
        return;
      }
      
      const fetchedPlates = await fetchPlates();
      console.log('Loaded plates from database:', fetchedPlates);
      setPlates(fetchedPlates);
      setError(null);
    } catch (err: any) {
      console.error("Error loading plates:", err);
      
      // Handle seller onboarding error specifically
      if (err?.message?.includes('Please complete seller onboarding')) {
        setError("onboarding_required");
        return;
      }
      
      setError("Failed to load your menu. Please try again.");
      notifyError("Error loading plates", "Could not load your menu. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new plate with improved error handling
  const handleAddPlate = async (newPlateData: Omit<Plate, "id" | "soldCount">) => {
    console.log('🚀 Starting handleAddPlate with data:', newPlateData);
    
    try {
      // Validate required fields before proceeding
      if (!newPlateData.name || !newPlateData.name.trim()) {
        throw new Error("Plate name is required");
      }
      
      if (!newPlateData.price || newPlateData.price <= 0) {
        throw new Error("Valid price is required");
      }
      
      if (!newPlateData.quantity || newPlateData.quantity <= 0) {
        throw new Error("Valid quantity is required");
      }
      
      if (!newPlateData.availableDate) {
        throw new Error("Available date is required");
      }
      
      console.log('✅ Validation passed, proceeding with plate addition');
      
      // Check if table exists before attempting to add
      if (tableExists === false) {
        throw new Error("Plates table does not exist. Please set up your database first.");
      }
      
      // Save the plate to Supabase
      console.log('💾 Calling addPlate service...');
      const savedPlate = await addPlate(newPlateData);
      console.log('✅ Plate saved successfully:', savedPlate);
      
      // Update local state with the new plate
      setPlates(prevPlates => {
        const updatedPlates = [...prevPlates, savedPlate];
        console.log('🔄 Updated local plates state:', updatedPlates);
        return updatedPlates;
      });
      
      // Notify user of success
      notifyPlateAdded(newPlateData.name);
      console.log('🎉 Plate addition completed successfully');
      
      return savedPlate;
    } catch (err) {
      console.error("💥 Error in handleAddPlate:", err);
      
      // Show user-friendly error message
      const errorMessage = err instanceof Error ? err.message : "Could not save your plate. Please try again.";
      
      notifyError("Failed to add plate", errorMessage);
      
      // Re-throw the error so the form can handle it
      throw err;
    }
  };

  // Load plates on mount
  useEffect(() => {
    loadPlates();
  }, []);

  // Debug logging for plates state changes
  useEffect(() => {
    console.log('Plates state updated:', {
      totalPlates: plates.length,
      todayPlatesCount: todayPlates.length,
      futurePlatesCount: futurePlates.length,
      mealPrepPlatesCount: mealPrepPlates.length,
      allPlates: plates
    });
  }, [plates, todayPlates, futurePlates, mealPrepPlates]);

  return {
    plates,
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
  };
};
