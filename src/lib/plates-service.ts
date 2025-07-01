

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
  // Remove all new columns until migrations are applied
  // is_single: boolean;
  // is_bundle: boolean;
  // is_available: boolean;
  // delivery_available: boolean | null;
  // pickup_time: string | null;
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
  // Remove all new columns until migrations are applied
  // is_single: plate.isSingle,
  // is_bundle: plate.isBundle,
  // is_available: plate.isAvailable,
  // delivery_available: plate.deliveryAvailable ?? false,
  // pickup_time: plate.pickupTime || null,
});

// Helper function to get seller profile ID from auth user ID
const getSellerProfileId = async (authUserId: string): Promise<string> => {
  console.log('🔍 Getting seller profile ID for auth user:', authUserId);
  
  try {
    // First, let's check if the user exists in auth.users
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔐 Current authenticated user:', user?.id, 'Expected:', authUserId);
    
    if (authError) {
      console.error('❌ Authentication error:', authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }
    
    if (!user || user.id !== authUserId) {
      console.error('❌ User authentication mismatch. Current user:', user?.id, 'Expected:', authUserId);
      throw new Error('User authentication mismatch');
    }
    
    // Now get the seller profile with more detailed debugging
    console.log('🔍 Querying seller_profiles table for user_id:', authUserId);
    
    // First, let's see if there are any seller profiles at all
    const { data: allProfiles, error: allError } = await supabase
      .from('seller_profiles')
      .select('id, user_id, business_name')
      .limit(10);
    
    console.log('📊 All seller profiles in database:', allProfiles);
    if (allError) {
      console.log('❌ Error fetching all profiles:', allError);
    }
    
    // Now try to get this specific user's profile
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('id, business_name, created_at')
      .eq('user_id', authUserId)
      .single();
      
    console.log('📊 Seller profile query result:', { data, error });
      
    if (error) {
      console.error('❌ Error fetching seller profile:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Handle specific error cases
      if (error.code === 'PGRST116') {
        // No seller profile found - let's try to create one if needed
        console.log('❌ No seller profile found. Let me check if we can create one...');
        
        // Check if user has completed any onboarding steps
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUserId)
          .single();
          
        console.log('👤 User profile data:', profileData);
        
        if (profileData?.is_onboarded) {
          console.log('🔄 User appears onboarded but missing seller profile. This might be a data consistency issue.');
          throw new Error('Your seller profile seems to be missing. Please try completing the seller onboarding process again, or contact support if this persists.');
        } else {
          throw new Error('You need to complete seller onboarding first. Please go to the seller onboarding page to set up your seller profile.');
        }
      } else if (error.code === '42P01') {
        // Table doesn't exist
        throw new Error('Seller profiles table does not exist. Please contact support or check your database setup.');
      } else {
        throw new Error(`Failed to fetch seller profile: ${error.message}`);
      }
    }
    
    if (!data) {
      console.error('❌ No seller profile found for user_id:', authUserId);
      throw new Error('You need to complete seller onboarding first. Please go to the seller onboarding page to set up your seller profile.');
    }
    
    console.log('✅ Found seller profile ID:', data.id, 'Business name:', data.business_name);
    return data.id;
  } catch (error) {
    console.error('❌ Error in getSellerProfileId:', error);
    throw error;
  }
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
  
  // Add a new plate
  addPlate: async (plate: Omit<Plate, 'id' | 'soldCount'>, authUserId: string) => {
    try {
      console.log('🍽️ Starting addPlate process...');
      console.log('👤 Auth user ID:', authUserId);
      console.log('📝 Plate data to add:', plate);
      
      // Step 1: Get seller profile ID (this will throw if no seller profile exists)
      console.log('🔍 Step 1: Getting seller profile ID...');
      const sellerProfileId = await getSellerProfileId(authUserId);
      console.log('✅ Step 1 complete. Seller profile ID:', sellerProfileId);
      
      // Step 2: Convert plate data to DB format
      console.log('🔄 Step 2: Converting plate data to DB format...');
      const dbPlate = plateToDbPlate(plate, sellerProfileId);
      console.log('✅ Step 2 complete. DB plate data:', dbPlate);
      
      // Step 3: Validate required fields
      console.log('✅ Step 3: Validating required fields...');
      if (!dbPlate.name || !dbPlate.seller_id || !dbPlate.available_date) {
        const missingFields = [];
        if (!dbPlate.name) missingFields.push('name');
        if (!dbPlate.seller_id) missingFields.push('seller_id');
        if (!dbPlate.available_date) missingFields.push('available_date');
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      console.log('✅ Step 3 complete. All required fields present.');
      
      // Step 4: Check if plates table exists and is accessible
      console.log('🔍 Step 4: Testing plates table access...');
      const { error: testError } = await supabase
        .from('plates')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ Cannot access plates table:', testError);
        throw new Error(`Cannot access plates table: ${testError.message}`);
      }
      console.log('✅ Step 4 complete. Plates table is accessible.');
      
      // Step 5: Insert the plate
      console.log('💾 Step 5: Inserting plate into database...');
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
        
        // Provide more specific error messages
        if (error.code === '42501') {
          throw new Error('You need to complete seller onboarding first. Please go to the seller onboarding page to set up your seller profile before adding plates.');
        } else if (error.code === '23503') {
          throw new Error('Invalid seller reference: Your seller profile may not be properly set up.');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }
      
      if (!data) {
        console.error('❌ No data returned from insert operation');
        throw new Error('Insert operation succeeded but no data was returned');
      }
      
      console.log('✅ Step 5 complete. Successfully added plate to database:', data);
      
      // Step 6: Convert and return the result
      console.log('🔄 Step 6: Converting result back to frontend format...');
      const convertedPlate = dbPlateToPlate(data);
      console.log('✅ Step 6 complete. Final converted plate:', convertedPlate);
      
      console.log('🎉 addPlate process completed successfully!');
      return convertedPlate;
    } catch (error) {
      console.error('💥 FATAL ERROR in addPlate service:', error);
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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

