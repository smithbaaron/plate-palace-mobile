
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

// Helper function to get seller profile ID from auth user ID with improved timeout handling
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
    
    // Now get the seller profile with improved timeout handling
    console.log('🔍 Querying seller_profiles table for user_id:', authUserId);
    
    // Try multiple approaches to get the seller profile
    let sellerProfileData = null;
    let lastError = null;
    
    // Approach 1: Direct query with longer timeout
    try {
      console.log('📡 Attempt 1: Direct seller profile query...');
      const { data, error } = await Promise.race([
        supabase
          .from('seller_profiles')
          .select('id, business_name, created_at')
          .eq('user_id', authUserId)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout after 8 seconds')), 8000)
        )
      ]) as any;
      
      if (data && !error) {
        sellerProfileData = data;
        console.log('✅ Direct query successful:', sellerProfileData);
      } else {
        lastError = error;
        console.log('⚠️ Direct query failed:', error);
      }
    } catch (err: any) {
      lastError = err;
      console.log('⚠️ Direct query timed out or failed:', err.message);
    }
    
    // Approach 2: If direct query failed, try a simpler query
    if (!sellerProfileData) {
      try {
        console.log('📡 Attempt 2: Simplified seller profile query...');
        const { data, error } = await Promise.race([
          supabase
            .from('seller_profiles')
            .select('id')
            .eq('user_id', authUserId)
            .limit(1),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
          )
        ]) as any;
        
        if (data && data.length > 0 && !error) {
          sellerProfileData = data[0];
          console.log('✅ Simplified query successful:', sellerProfileData);
        } else {
          lastError = error;
          console.log('⚠️ Simplified query failed:', error);
        }
      } catch (err: any) {
        lastError = err;
        console.log('⚠️ Simplified query timed out or failed:', err.message);
      }
    }
    
    // Approach 3: Check if this is a database connectivity issue
    if (!sellerProfileData) {
      try {
        console.log('📡 Attempt 3: Testing database connectivity...');
        const { error: connectError } = await Promise.race([
          supabase.from('seller_profiles').select('count').limit(1),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connectivity test timeout')), 3000)
          )
        ]) as any;
        
        if (connectError) {
          console.error('❌ Database connectivity issue:', connectError);
          throw new Error('Database connection problem. Please try again in a moment.');
        } else {
          console.log('✅ Database is accessible, but seller profile not found');
        }
      } catch (err: any) {
        if (err.message.includes('timeout')) {
          console.error('❌ Database appears to be slow or unresponsive');
          throw new Error('Database is currently slow. Please try again in a moment.');
        }
      }
    }
    
    // Final evaluation
    if (!sellerProfileData) {
      console.error('❌ No seller profile found after all attempts');
      console.error('❌ Last error was:', lastError);
      
      // Provide specific error messages based on the last error
      if (lastError?.code === 'PGRST116') {
        throw new Error('Your seller profile was not found. Please complete the seller onboarding process again.');
      } else if (lastError?.code === '42P01') {
        throw new Error('Seller profiles table does not exist. Please contact support.');
      } else if (lastError?.message?.includes('timeout')) {
        throw new Error('Database query timed out. Please try again - the system may be experiencing high load.');
      } else {
        throw new Error('Unable to verify your seller profile. Please try refreshing the page or completing seller onboarding again.');
      }
    }
    
    console.log('✅ Found seller profile ID:', sellerProfileData.id);
    return sellerProfileData.id;
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
  
  // Add a new plate with improved error handling
  addPlate: async (plate: Omit<Plate, 'id' | 'soldCount'>, authUserId: string) => {
    try {
      console.log('🍽️ Starting addPlate process...');
      console.log('👤 Auth user ID:', authUserId);
      console.log('📝 Plate data to add:', plate);
      
      // Step 1: Get seller profile ID with better error handling
      console.log('🔍 Step 1: Getting seller profile ID...');
      let sellerProfileId;
      try {
        sellerProfileId = await getSellerProfileId(authUserId);
        console.log('✅ Step 1 complete. Seller profile ID:', sellerProfileId);
      } catch (profileError) {
        console.error('❌ Failed to get seller profile:', profileError);
        throw profileError; // Re-throw the specific error from getSellerProfileId
      }
      
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
      
      // Step 4: Insert the plate with timeout handling
      console.log('💾 Step 4: Inserting plate into database...');
      const { data, error } = await Promise.race([
        supabase
          .from('plates')
          .insert(dbPlate)
          .select()
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Insert operation timed out')), 10000)
        )
      ]) as any;
        
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
          throw new Error('Permission denied: You may not have the required permissions to add plates. Please check your seller profile setup.');
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
      
      console.log('✅ Step 4 complete. Successfully added plate to database:', data);
      
      // Step 5: Convert and return the result
      console.log('🔄 Step 5: Converting result back to frontend format...');
      const convertedPlate = dbPlateToPlate(data);
      console.log('✅ Step 5 complete. Final converted plate:', convertedPlate);
      
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
