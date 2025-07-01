
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

// Enhanced seller profile validation with detailed logging
const validateSellerProfile = async (authUserId: string): Promise<{ sellerId: string; isValid: boolean; error?: string }> => {
  console.log('🔍 Validating seller profile for user:', authUserId);
  
  try {
    // First, check if the user exists in auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 Current auth user:', user?.id, 'Expected:', authUserId);
    
    if (authError || !user) {
      console.error('❌ Auth error or no user:', authError);
      return { sellerId: '', isValid: false, error: 'User not authenticated' };
    }
    
    if (user.id !== authUserId) {
      console.error('❌ User ID mismatch:', user.id, 'vs', authUserId);
      return { sellerId: '', isValid: false, error: 'User ID mismatch' };
    }
    
    // Query seller profile with detailed logging
    console.log('🔍 Querying seller_profiles table for user_id:', authUserId);
    const { data: sellerProfile, error: profileError } = await supabase
      .from('seller_profiles')
      .select('id, business_name, user_id')
      .eq('user_id', authUserId)
      .single();
    
    console.log('📊 Seller profile query result:', {
      data: sellerProfile,
      error: profileError,
      errorCode: profileError?.code,
      errorMessage: profileError?.message
    });
    
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.error('❌ No seller profile found for user:', authUserId);
        return { 
          sellerId: '', 
          isValid: false, 
          error: 'No seller profile exists. Please complete seller onboarding first.' 
        };
      }
      
      console.error('❌ Database error fetching seller profile:', profileError);
      return { 
        sellerId: '', 
        isValid: false, 
        error: `Database error: ${profileError.message}` 
      };
    }
    
    if (!sellerProfile) {
      console.error('❌ Seller profile query returned null');
      return { 
        sellerId: '', 
        isValid: false, 
        error: 'No seller profile found. Please complete seller onboarding.' 
      };
    }
    
    console.log('✅ Seller profile found:', {
      id: sellerProfile.id,
      business_name: sellerProfile.business_name,
      user_id: sellerProfile.user_id
    });
    
    // Check if business name is properly set
    if (!sellerProfile.business_name || sellerProfile.business_name.trim() === '') {
      console.error('❌ Business name is empty or null');
      return { 
        sellerId: sellerProfile.id, 
        isValid: false, 
        error: 'Seller profile is incomplete. Please set your business name in seller onboarding.' 
      };
    }
    
    console.log('✅ Seller profile validation successful:', sellerProfile.id);
    return { sellerId: sellerProfile.id, isValid: true };
    
  } catch (error) {
    console.error('❌ Unexpected error in seller profile validation:', error);
    return { 
      sellerId: '', 
      isValid: false, 
      error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
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
  
  // Add a new plate with enhanced validation and debugging
  addPlate: async (plate: Omit<Plate, 'id' | 'soldCount'>, authUserId: string) => {
    try {
      console.log('🍽️ Starting addPlate process...');
      console.log('👤 Auth user ID:', authUserId);
      console.log('📝 Plate data to add:', plate);
      
      // Step 1: Enhanced seller profile validation
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
      
      // Step 3: Test RLS policy by checking if we can query seller_profiles
      console.log('🔐 Step 3: Testing RLS access...');
      const { data: testQuery, error: testError } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', authUserId)
        .single();
        
      console.log('🔐 RLS test result:', { data: testQuery, error: testError });
      
      if (testError || !testQuery) {
        console.error('❌ RLS test failed - user cannot access their seller profile');
        throw new Error('Permission error: Cannot access seller profile. Please log out and log back in.');
      }
      
      // Step 4: Insert the plate with detailed error handling
      console.log('💾 Step 4: Inserting plate into database...');
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
        
        // Provide specific error messages based on error codes
        if (error.code === '42501') {
          // Check if the issue is with the seller_id reference
          console.log('🔍 Checking if seller_id exists in seller_profiles...');
          const { data: sellerCheck } = await supabase
            .from('seller_profiles')
            .select('id')
            .eq('id', sellerProfileId)
            .single();
            
          if (!sellerCheck) {
            throw new Error('Seller profile ID is invalid. Please complete seller onboarding again.');
          }
          
          throw new Error(`RLS Policy Error: Your seller profile exists but the database security policy is blocking the insert. Please contact support or try logging out and back in.`);
        } else if (error.code === '23503') {
          throw new Error('Invalid seller reference: Your seller profile was not found. Please complete seller onboarding again.');
        } else {
          throw new Error(`Database error (${error.code}): ${error.message}`);
        }
      }
      
      if (!data) {
        console.error('❌ No data returned from insert operation');
        throw new Error('Insert operation succeeded but no data was returned');
      }
      
      console.log('✅ Step 4 complete. Successfully added plate to database:', data);
      
      // Step 5: Convert and return the result
      console.log('🔄 Step 5: Converting result back to frontend format...');
      const convertedPlate = dbPlateToPlate(data);
      console.log('✅ Step 5 complete. Final converted plate:', convertedPlate);
      
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
