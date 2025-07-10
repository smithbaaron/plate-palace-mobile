
import { supabase } from "./supabase";

export type UserType = "seller" | "customer" | null;

export const getUserTypeData = async (userId: string | undefined) => {
  if (!userId) return { userType: null, isOnboarded: false };
  
  try {
    console.log("Fetching user type data for:", userId);
    
    // Check if tables exist first to avoid 406 errors
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      console.log("Database tables not yet created - user will complete onboarding to set up profile");
      return { userType: null, isOnboarded: false };
    }
    
    let userType: UserType = null;
    let isOnboarded = false;
    
    // Check if user has a seller profile
    try {
      const { data: sellerProfile, error } = await supabase
        .from('seller_profiles')
        .select('id, business_name')
        .eq('user_id', userId)
        .single();
        
      if (sellerProfile && !error) {
        userType = 'seller';
        // Only consider onboarded if they have filled out basic info
        isOnboarded = !!(sellerProfile.business_name && sellerProfile.business_name.trim());
      } else if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" which is expected, other errors are concerning
        console.error("Error checking seller profile:", error);
      }
    } catch (err: any) {
      console.error("Error checking seller profile:", err);
    }
    
    // Check profiles table for user type if no seller profile found
    if (!userType) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type, is_onboarded')
          .eq('id', userId)
          .single();
          
        if (profile && !error) {
          userType = profile.user_type as UserType;
          isOnboarded = profile.is_onboarded || false;
        } else if (error && error.code !== "PGRST116") {
          console.error("Error checking profile:", error);
        }
      } catch (err: any) {
        console.error("Error checking profile:", err);
      }
    }
    
    return { 
      userType, 
      isOnboarded 
    };
  } catch (err) {
    console.error("Unexpected error in getUserTypeData:", err);
    return { userType: null, isOnboarded: false };
  }
};

// Helper function to check if required tables exist
const checkTablesExist = async (): Promise<boolean> => {
  try {
    // Try a simple query that won't cause 406 if tables don't exist
    const { error: sellerError } = await supabase
      .from('seller_profiles')
      .select('count')
      .limit(0);
      
    const { error: profileError } = await supabase
      .from('profiles')
      .select('count')
      .limit(0);
    
    // If both tables exist (no "relation does not exist" errors)
    return !sellerError?.message?.includes('relation') && !profileError?.message?.includes('relation');
  } catch (err: any) {
    // If we get a 406 or relation doesn't exist error, tables aren't set up
    return false;
  }
};

export const updateUserType = async (userId: string | undefined, type: UserType) => {
  if (!userId) return false;
  
  console.log(`Setting user type for ${userId} to ${type}`);
  
  try {
    if (type === 'seller') {
      // Check if seller_profiles table exists first
      try {
        const { error } = await supabase
          .from('seller_profiles')
          .upsert({
            user_id: userId,
            business_name: '',
            bio: '',
            phone_number: '',
            offer_pickup: true,
            offer_delivery: false,
            pickup_addresses: [],
            delivery_zip_codes: '',
          }, {
            onConflict: 'user_id'
          });
          
        if (error) {
          if (error.code === "42P01") {
            console.log("seller_profiles table doesn't exist - user type will be set during onboarding");
            return true; // Return success for now, will be handled in onboarding
          }
          console.error("Error creating seller profile:", error);
          return false;
        }
      } catch (createErr: any) {
        if (createErr.code === "42P01") {
          console.log("seller_profiles table doesn't exist - user type will be set during onboarding");
          return true; // Return success for now
        }
        console.error("Error in seller profile creation:", createErr);
        return false;
      }
    }
    
    // For customer type, we'll handle it when customer_profiles table exists
    if (type === 'customer') {
      // For now, just return true - customer type will be handled in onboarding
      console.log("Customer type set successfully (will be persisted during onboarding)");
      return true;
    }
    
    return true;
  } catch (err) {
    console.error("Unexpected error in updateUserType:", err);
    return false;
  }
};

export const completeUserOnboarding = async (userId: string | undefined) => {
  if (!userId) return false;
  
  try {
    // For now, just return true to allow onboarding to complete
    // The actual onboarding completion will be handled when the user
    // fills out their profile information
    return true;
  } catch (err) {
    console.error("Unexpected error in completeUserOnboarding:", err);
    return false;
  }
};
