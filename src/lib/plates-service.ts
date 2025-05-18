import { supabase } from './supabase';
import { Plate } from '@/components/seller/AddSinglePlateForm';
import { useAuth } from '@/context/AuthContext';

// Type definition for database plates
export type DBPlate = {
  id?: string;
  seller_id: string;
  name: string;
  quantity: number;
  price: number;
  nutritional_info: string | null;
  available_date: string;
  image_url: string | null;
  sold_count: number;
  size: string; // Added size field
};

// Convert a DB plate to a frontend plate
export const dbPlateToPlate = (dbPlate: any): Plate => ({
  id: dbPlate.id,
  name: dbPlate.name,
  quantity: dbPlate.quantity,
  price: dbPlate.price,
  nutritionalInfo: dbPlate.nutritional_info || '',
  availableDate: new Date(dbPlate.available_date),
  imageUrl: dbPlate.image_url,
  soldCount: dbPlate.sold_count || 0,
  size: dbPlate.size || 'M',
});

// Convert a frontend plate to a DB plate
export const plateToDbPlate = (plate: Omit<Plate, 'id' | 'soldCount'>, sellerId: string): Omit<DBPlate, 'id'> => ({
  name: plate.name,
  quantity: plate.quantity,
  price: plate.price,
  nutritional_info: plate.nutritionalInfo || null,
  available_date: plate.availableDate.toISOString(),
  image_url: plate.imageUrl || null,
  seller_id: sellerId,
  sold_count: 0,
  size: plate.size,
});

// Service functions for interacting with plates in Supabase
export const platesService = {
  // Get all plates for a seller
  getSellerPlates: async (sellerId: string) => {
    try {
      const { data, error } = await supabase
        .from('plates')
        .select('*')
        .eq('seller_id', sellerId)
        .order('available_date', { ascending: true });
        
      if (error) throw error;
      
      // Convert DB plates to frontend plates
      return data.map(dbPlateToPlate);
    } catch (error) {
      console.error('Error fetching plates:', error);
      throw error;
    }
  },
  
  // Add a new plate
  addPlate: async (plate: Omit<Plate, 'id' | 'soldCount'>, sellerId: string) => {
    try {
      const dbPlate = plateToDbPlate(plate, sellerId);
      
      const { data, error } = await supabase
        .from('plates')
        .insert(dbPlate)
        .select()
        .single();
        
      if (error) throw error;
      
      return dbPlateToPlate(data);
    } catch (error) {
      console.error('Error adding plate:', error);
      throw error;
    }
  },
  
  // Update a plate
  updatePlate: async (plate: Plate, sellerId: string) => {
    try {
      const dbPlate = plateToDbPlate(plate, sellerId);
      
      const { data, error } = await supabase
        .from('plates')
        .update(dbPlate)
        .eq('id', plate.id)
        .eq('seller_id', sellerId) // Security: ensure the plate belongs to this seller
        .select()
        .single();
        
      if (error) throw error;
      
      return dbPlateToPlate(data);
    } catch (error) {
      console.error('Error updating plate:', error);
      throw error;
    }
  },
  
  // Delete a plate
  deletePlate: async (plateId: string, sellerId: string) => {
    try {
      const { error } = await supabase
        .from('plates')
        .delete()
        .eq('id', plateId)
        .eq('seller_id', sellerId); // Security: ensure the plate belongs to this seller
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting plate:', error);
      throw error;
    }
  }
};

// React hook for accessing plates
export const usePlates = () => {
  const { currentUser } = useAuth();
  
  const fetchPlates = async () => {
    if (!currentUser?.id) {
      console.error('User ID not available');
      return [];
    }
    
    return await platesService.getSellerPlates(currentUser.id);
  };
  
  const addPlate = async (plate: Omit<Plate, 'id' | 'soldCount'>) => {
    if (!currentUser?.id) {
      console.error('User ID not available');
      throw new Error('User not authenticated');
    }
    
    return await platesService.addPlate(plate, currentUser.id);
  };

  return { fetchPlates, addPlate };
};
