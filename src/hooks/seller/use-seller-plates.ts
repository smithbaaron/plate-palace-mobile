
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

  // Find plates available for meal prep bundles
  const mealPrepPlates = plates.filter(plate => {
    console.log('Filtering meal prep plates:', {
      plateName: plate.name,
      isBundle: plate.isBundle,
      isAvailable: plate.isAvailable,
      eligible: plate.isBundle && plate.isAvailable
    });
    return plate.isBundle && plate.isAvailable;
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
    } catch (err) {
      console.error("Error loading plates:", err);
      setError("Failed to load your menu. Please try again.");
      notifyError("Error loading plates", "Could not load your menu. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new plate
  const handleAddPlate = async (newPlateData: Omit<Plate, "id" | "soldCount">) => {
    try {
      console.log('Adding new plate:', newPlateData);
      
      // Check if table exists before attempting to add
      if (tableExists === false) {
        throw new Error("Plates table does not exist. Please set up your database first.");
      }
      
      // Save the plate to Supabase
      const savedPlate = await addPlate(newPlateData);
      console.log('Plate saved to database:', savedPlate);
      
      // Update local state with the new plate
      setPlates(prevPlates => {
        const updatedPlates = [...prevPlates, savedPlate];
        console.log('Updated local plates state:', updatedPlates);
        return updatedPlates;
      });
      
      // Notify user of success
      notifyPlateAdded(newPlateData.name);
      
      return savedPlate;
    } catch (err) {
      console.error("Error adding plate:", err);
      notifyError("Error adding plate", "Could not save your plate. Please try again.");
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
