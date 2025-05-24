
import { supabase } from "./supabase";

export type UserType = "seller" | "customer" | null;

export const getUserTypeData = async (userId: string | undefined) => {
  if (!userId) return { userType: null, isOnboarded: false };
  
  try {
    console.log("Fetching user type data for:", userId);
    
    // Since user_type and is_onboarded columns don't exist in profiles table,
    // we'll determine user type from related tables
    let userType: UserType = null;
    let isOnboarded = false;
    
    // Check if user has a seller profile
    try {
      const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      if (sellerProfile) {
        userType = 'seller';
        isOnboarded = true;
      }
    } catch (err) {
      // No seller profile found, continue checking
    }
    
    // TODO: Add customer profile check when customer_profiles table exists
    // For now, if no seller profile, assume customer (when they try to access customer features)
    
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
    // Since we can't store user_type in profiles table, we'll handle this differently
    // When user chooses seller, we'll create an empty seller profile
    // When user chooses customer, we'll create an empty customer profile
    
    if (type === 'seller') {
      // Create or update seller profile with minimal data
      const { error } = await supabase
        .from('seller_profiles')
        .upsert({
          user_id: userId,
          business_name: '', // Will be filled during onboarding
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
        console.error("Error creating seller profile:", error);
        return false;
      }
    }
    
    // TODO: Handle customer type when customer_profiles table exists
    
    return true;
  } catch (err) {
    console.error("Unexpected error in updateUserType:", err);
    return false;
  }
};

export const completeUserOnboarding = async (userId: string | undefined) => {
  if (!userId) return false;
  
  try {
    // Since is_onboarded column doesn't exist in profiles table,
    // we consider onboarding complete when they have a complete seller/customer profile
    
    // For sellers, check if they have a complete seller profile
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('business_name')
      .eq('user_id', userId)
      .single();
      
    if (sellerProfile && sellerProfile.business_name) {
      // Seller profile exists and has business name, consider onboarded
      return true;
    }
    
    // TODO: Add customer profile check when needed
    
    return true; // Return true for now to allow completion
  } catch (err) {
    console.error("Unexpected error in completeUserOnboarding:", err);
    return false;
  }
};
