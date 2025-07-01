
import { supabase } from './supabase';
import { Plate } from '@/components/seller/PlateFormTypes';
import { useAuth } from '@/context/AuthContext';

// Type definition for database plates - simplified to match original table
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
  // Set default values for missing columns
  isSingle: true,
  isBundle: false,
  isAvailable: true,
  deliveryAvailable: false,
  pickupTime: '',
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
});

// Helper function to validate seller profile - simplified without debug function
const validateSellerProfile = async (authUserId: string): Promise<{ sellerId: string; isValid: boolean; error?: string }> => {
  console.log('🔍 Validating seller profile for user:', authUserId);
  
  try {
    // Query seller profile directly
    const { data: sellerProfile, error: profileError } = await supabase
      .from('seller_profiles')
      .select('id, business_name, user_id')
      .eq('user_id', authUserId)
      .single();
    
    console.log('🔍 Seller profile data:', sellerProfile);
    
    if (profileError) {
      console.error('❌ Error fetching seller profile:', profileError);
      
      if (profileError.code === 'PGRST116') {
        return { sellerId: '', isValid: false, error: 'No seller profile exists. Please complete seller onboarding.' };
      }
      
      return { sellerId: '', isValid: false, error: `Failed to fetch seller profile: ${profileError.message}` };
    }
    
    if (!sellerProfile) {
      return { sellerId: '', isValid: false, error: 'No seller profile found. Please complete seller onboarding.' };
    }
    
    if (!sellerProfile.business_name || sellerProfile.business_name.trim() === '') {
      return { sellerId: '', isValid: false, error: 'Seller profile is incomplete. Please ensure your business name is set in seller onboarding.' };
    }
    
    console.log('✅ Seller profile validation successful:', sellerProfile.id);
    return { sellerId: sellerProfile.id, isValid: true };
    
  } catch (error) {
    console.error('❌ Error validating seller profile:', error);
    return { sellerId: '', isValid: false, error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Helper function to get seller profile ID from auth user ID
const getSellerProfileId = async (authUserId: string): Promise<string> => {
  console.log('🔍 Getting seller profile ID for auth user:', authUserId);
  
  const validation = await validateSellerProfile(authUserId);
  
  if (!validation.isValid) {
    throw new Error(validation.error || 'Seller profile validation failed');
  }
  
  return validation.sellerId;
};

// Service functions for interacting with plates in Supabase
export const platesService = {
  // Get all plates for a seller
  getSellerPlates: async (authUserId: string) => {
    try {
      console.log('📋 Fetching plates for auth user:', authUserId);
      const sellerProfileId = await getSellerProfileId(authUserId);
      console.log('🆔 Using seller profile ID:', sellerProfileId);
      
      const { data, error } = await supabase
        .from('plates')
        .select('*')
        .eq('seller_id', sellerProfileId)
        .order('available_date', { ascending: true });
        
      if (error) {
        console.error('❌ Error fetching plates from database:', error);
        throw error;
      }
      
      console.log('📊 Raw plates data from database:', data);
      
      // Convert DB plates to frontend plates
      const plates = data.map(dbPlateToPlate);
      console.log('✅ Converted plates:', plates);
      return plates;
    } catch (error) {
      console.error('❌ Error in getSellerPlates:', error);
      throw error;
    }
  },
  
  // Add a new plate with improved validation
  addPlate: async (plate: Omit<Plate, 'id' | 'soldCount'>, authUserId: string) => {
    try {
      console.log('🍽️ Starting addPlate process...');
      console.log('👤 Auth user ID:', authUserId);
      console.log('📝 Plate data to add:', plate);
      
      // Step 1: Validate seller profile and get seller ID
      console.log('🔍 Step 1: Validating seller profile...');
      const validation = await validateSellerProfile(authUserId);
      
      if (!validation.isValid) {
        console.error('❌ Seller profile validation failed:', validation.error);
        throw new Error(validation.error || 'Seller profile validation failed');
      }
      
      const sellerProfileId = validation.sellerId;
      console.log('✅ Step 1 complete. Seller profile ID:', sellerProfileId);
      
      // Step 2: Convert plate data to DB format
      console.log('🔄 Step 2: Converting plate data to DB format...');
      const dbPlate = plateToDbPlate(plate, sellerProfileId);
      console.log('✅ Step 2 complete. DB plate data:', dbPlate);
      
      // Step 3: Insert the plate
      console.log('💾 Step 3: Inserting plate into database...');
      const { data, error } = await supabase
        .from('plates')
        .insert(dbPlate)
        .select()
        .single();
        
      console.log('📊 Insert operation result:', { data, error });
        
      if (error) {
        console.error('❌ Error inserting plate into database:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Provide more specific error messages based on error codes
        if (error.code === '42501') {
          throw new Error('Permission denied: Your seller profile may not be properly set up. Please ensure your business name is completed in seller onboarding.');
        } else if (error.code === '23503') {
          throw new Error('Invalid seller reference: Your seller profile was not found. Please complete seller onboarding again.');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }
      
      if (!data) {
        console.error('❌ No data returned from insert operation');
        throw new Error('Insert operation succeeded but no data was returned');
      }
      
      console.log('✅ Step 3 complete. Successfully added plate to database:', data);
      
      // Step 4: Convert and return the result
      console.log('🔄 Step 4: Converting result back to frontend format...');
      const convertedPlate = dbPlateToPlate(data);
      console.log('✅ Step 4 complete. Final converted plate:', convertedPlate);
      
      console.log('🎉 addPlate process completed successfully!');
      return convertedPlate;
    } catch (error) {
      console.error('💥 FATAL ERROR in addPlate service:', error);
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
      console.error('❌ User ID not available for fetching plates');
      return [];
    }
    
    try {
      return await platesService.getSellerPlates(currentUser.id);
    } catch (error) {
      console.error('❌ Error in fetchPlates hook:', error);
      throw error;
    }
  };
  
  const addPlate = async (plate: Omit<Plate, 'id' | 'soldCount'>) => {
    if (!currentUser?.id) {
      console.error('❌ User ID not available for adding plate');
      throw new Error('User not authenticated');
    }
    
    try {
      console.log('🎯 Hook: Starting addPlate with user ID:', currentUser.id);
      const result = await platesService.addPlate(plate, currentUser.id);
      console.log('🎯 Hook: addPlate completed successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in addPlate hook:', error);
      throw error;
    }
  };

  return { fetchPlates, addPlate };
};
