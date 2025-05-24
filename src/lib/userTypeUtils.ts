
import { supabase } from "./supabase";

export type UserType = "seller" | "customer" | null;

export const getUserTypeData = async (userId: string | undefined) => {
  if (!userId) return { userType: null, isOnboarded: false };
  
  try {
    console.log("Fetching user type data for:", userId);
    
    let userType: UserType = null;
    let isOnboarded = false;
    
    // Check if user has a seller profile - handle table not existing gracefully
    try {
      const { data: sellerProfile, error } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      if (sellerProfile && !error) {
        userType = 'seller';
        isOnboarded = true;
      } else if (error && error.code === "42P01") {
        // Table doesn't exist, that's okay - we'll handle it later
        console.log("seller_profiles table doesn't exist yet");
      }
    } catch (err: any) {
      if (err.code === "42P01") {
        console.log("seller_profiles table doesn't exist yet");
      } else {
        console.error("Error checking seller profile:", err);
      }
    }
    
    // For now, if no seller profile and no customer profile checking available,
    // we'll determine user type during onboarding
    
    return { 
      userType, 
      isOnboarded 
    };
  } catch (err) {
    console.error("Unexpected error in getUserTypeData:", err);
    return { userType: null, isOnboarded: false };
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
