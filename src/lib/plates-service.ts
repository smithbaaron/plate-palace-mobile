import { supabase } from './supabase';
import { Plate } from '@/components/seller/PlateFormTypes';
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
  size: string;
  is_single: boolean;
  is_bundle: boolean;
  is_available: boolean;
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
  isSingle: dbPlate.is_single ?? true,
  isBundle: dbPlate.is_bundle ?? false,
  isAvailable: dbPlate.is_available ?? true,
});

// Convert a frontend plate to a DB plate
export const plateToDbPlate = (plate: Omit<Plate, 'id' | 'soldCount'>, sellerId: string): Omit<DBPlate, 'id'> => ({
  seller_id: sellerId,
  name: plate.name,
  quantity: plate.quantity,
  price: plate.price,
  nutritional_info: plate.nutritionalInfo || null,
  available_date: plate.availableDate.toISOString(),
  image_url: plate.imageUrl || null,
  sold_count: 0,
  size: plate.size,
  is_single: plate.isSingle,
  is_bundle: plate.isBundle,
  is_available: plate.isAvailable,
});

// Helper function to get seller profile ID from auth user ID
const getSellerProfileId = async (authUserId: string): Promise<string> => {
  console.log('Getting seller profile ID for auth user:', authUserId);
  
  try {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('user_id', authUserId)
      .single();
      
    if (error) {
      console.error('Error fetching seller profile:', error);
      throw new Error(`Failed to fetch seller profile: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Seller profile not found. Please complete your seller onboarding first.');
    }
    
    console.log('Found seller profile ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error in getSellerProfileId:', error);
    throw error;
  }
};

// Service functions for interacting with plates in Supabase
export const platesService = {
  // Get all plates for a seller
  getSellerPlates: async (authUserId: string) => {
    try {
      console.log('Fetching plates for auth user:', authUserId);
      const sellerProfileId = await getSellerProfileId(authUserId);
      console.log('Using seller profile ID:', sellerProfileId);
      
      const { data, error } = await supabase
        .from('plates')
        .select('*')
        .eq('seller_id', sellerProfileId)
        .order('available_date', { ascending: true });
        
      if (error) {
        console.error('Error fetching plates from database:', error);
        throw error;
      }
      
      console.log('Raw plates data from database:', data);
      
      // Convert DB plates to frontend plates
      const plates = data.map(dbPlateToPlate);
      console.log('Converted plates:', plates);
      return plates;
    } catch (error) {
      console.error('Error in getSellerPlates:', error);
      throw error;
    }
  },
  
  // Add a new plate
  addPlate: async (plate: Omit<Plate, 'id' | 'soldCount'>, authUserId: string) => {
    try {
      console.log('Adding plate for auth user:', authUserId);
      console.log('Plate data to add:', plate);
      
      const sellerProfileId = await getSellerProfileId(authUserId);
      console.log('Using seller profile ID for new plate:', sellerProfileId);
      
      const dbPlate = plateToDbPlate(plate, sellerProfileId);
      console.log('Prepared DB plate data:', dbPlate);
      
      const { data, error } = await supabase
        .from('plates')
        .insert(dbPlate)
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting plate into database:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Successfully added plate to database:', data);
      const convertedPlate = dbPlateToPlate(data);
      console.log('Converted new plate:', convertedPlate);
      return convertedPlate;
    } catch (error) {
      console.error('Error in addPlate service:', error);
      throw error;
    }
  },
  
  // Update a plate
  updatePlate: async (plate: Plate, authUserId: string) => {
    try {
      const sellerProfileId = await getSellerProfileId(authUserId);
      const dbPlate = plateToDbPlate(plate, sellerProfileId);
      
      const { data, error } = await supabase
        .from('plates')
        .update(dbPlate)
        .eq('id', plate.id)
        .eq('seller_id', sellerProfileId) // Security: ensure the plate belongs to this seller
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
  deletePlate: async (plateId: string, authUserId: string) => {
    try {
      const sellerProfileId = await getSellerProfileId(authUserId);
      
      const { error } = await supabase
        .from('plates')
        .delete()
        .eq('id', plateId)
        .eq('seller_id', sellerProfileId); // Security: ensure the plate belongs to this seller
        
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
      console.error('User ID not available for fetching plates');
      return [];
    }
    
    try {
      return await platesService.getSellerPlates(currentUser.id);
    } catch (error) {
      console.error('Error in fetchPlates hook:', error);
      throw error;
    }
  };
  
  const addPlate = async (plate: Omit<Plate, 'id' | 'soldCount'>) => {
    if (!currentUser?.id) {
      console.error('User ID not available for adding plate');
      throw new Error('User not authenticated');
    }
    
    try {
      return await platesService.addPlate(plate, currentUser.id);
    } catch (error) {
      console.error('Error in addPlate hook:', error);
      throw error;
    }
  };

  return { fetchPlates, addPlate };
};
