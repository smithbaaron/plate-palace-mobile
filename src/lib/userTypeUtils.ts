
import { supabase } from "./supabase";

export type UserType = "seller" | "customer" | null;

export const getUserTypeData = async (userId: string | undefined) => {
  if (!userId) return { userType: null, isOnboarded: false };
  
  try {
    console.log("🔍 Fetching user type data for userId:", userId);
    
    // Check if required tables exist for the app functionality
    const tablesExist = await checkRequiredTables();
    console.log("📊 Required tables exist:", tablesExist);
    if (!tablesExist) {
      console.log("❌ Required database tables not found - user needs to complete setup");
      return { userType: null, isOnboarded: false };
    }
    
    let userType: UserType = null;
    let isOnboarded = false;
    
    // PRIORITY 1: Check seller_profiles table first (actual seller profile takes priority)
    try {
      console.log("🔍 Checking seller_profiles table for userId:", userId);
      
      // Add a race condition with timeout to prevent infinite hanging
      const queryPromise = supabase
        .from('seller_profiles')
        .select('id, business_name')
        .eq('user_id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Seller profile query timeout')), 5000)
      );
      
      const { data: sellerProfile, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
      console.log("📊 Seller profile query result:", { data: sellerProfile, error });
        
      if (sellerProfile && !error) {
        userType = 'seller';
        isOnboarded = true;
        console.log('✅ Found seller profile - user is a seller:', { 
          userType, 
          isOnboarded, 
          businessName: sellerProfile.business_name,
          profileId: sellerProfile.id
        });
        return { userType, isOnboarded };
      } else if (error && error.code !== "PGRST116") {
        console.error("❌ Error checking seller profile:", error);
      } else if (error?.code === "PGRST116") {
        console.log("ℹ️ No seller profile found (expected if not a seller)");
      }
    } catch (err: any) {
      if (err.message === 'Seller profile query timeout') {
        console.log("⏰ Seller profile query timed out");
      } else {
        console.error("❌ Exception checking seller profile:", err);
      }
    }
    
    // PRIORITY 2: Check customer_profiles table
    try {
      console.log("🔍 Checking customer_profiles table for userId:", userId);
      
      const queryPromise2 = supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      const timeoutPromise2 = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Customer profile query timeout')), 5000)
      );
      
      const { data: customerProfile, error } = await Promise.race([queryPromise2, timeoutPromise2]) as any;
        
      console.log("📊 Customer profile query result:", { data: customerProfile, error });
        
      if (customerProfile && !error) {
        userType = 'customer';
        isOnboarded = true;
        console.log('✅ Found customer profile - user is a customer:', { userType, isOnboarded });
        return { userType, isOnboarded };
      } else if (error && error.code !== "PGRST116") {
        console.error("❌ Error checking customer profile:", error);
      } else if (error?.code === "PGRST116") {
        console.log("ℹ️ No customer profile found (expected if not a customer)");
      }
    } catch (err: any) {
      if (err.message === 'Customer profile query timeout') {
        console.log("⏰ Customer profile query timed out");
      } else {
        console.error("❌ Exception checking customer profile:", err);
      }
    }
    
    // FALLBACK: Check profiles table for explicit user_type setting
    try {
      console.log("🔍 Checking profiles table for userId:", userId);
      
      const queryPromise3 = supabase
        .from('profiles')
        .select('user_type, is_onboarded')
        .eq('id', userId)
        .single();
      
      const timeoutPromise3 = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 5000)
      );
      
      const { data: profile, error } = await Promise.race([queryPromise3, timeoutPromise3]) as any;
        
      console.log("📊 Profile query result:", { data: profile, error });
        
      if (profile && !error && profile.user_type) {
        userType = profile.user_type as UserType;
        isOnboarded = profile.is_onboarded || false;
        console.log('✅ Found explicit user type in profiles table:', { userType, isOnboarded });
        return { userType, isOnboarded };
      } else if (error && error.code !== "PGRST116") {
        console.error("❌ Error checking profile:", error);
      } else if (error?.code === "PGRST116") {
        console.log("ℹ️ No profile found in profiles table");
      }
    } catch (err: any) {
      if (err.message === 'Profile query timeout') {
        console.log("⏰ Profile query timed out, using fallback username");
      } else {
        console.error("❌ Exception checking profile:", err);
      }
    }
    
    // No profile found in any table - return null to let user choose
    console.log("ℹ️ No user type found in any table - user needs to choose their type");
    return { userType: null, isOnboarded: false };
  } catch (err) {
    console.error("Unexpected error in getUserTypeData:", err);
    return { userType: null, isOnboarded: false };
  }
};

// Check if required tables exist for the seller/customer functionality
const checkRequiredTables = async (): Promise<boolean> => {
  try {
    // Test seller_profiles table
    const { error: sellerError } = await supabase
      .from('seller_profiles')
      .select('id')
      .limit(0);
      
    // Test profiles table  
    const { error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(0);
    
    // If we get table doesn't exist errors, return false
    if (sellerError?.code === "42P01" || profileError?.code === "42P01") {
      return false;
    }
    
    return true;
  } catch (err: any) {
    console.log("Error checking required tables:", err.message);
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
