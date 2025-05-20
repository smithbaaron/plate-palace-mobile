
import { supabase } from "./supabase";
import { User } from "./authUtils";

export type UserType = "seller" | "customer" | null;

export const getUserTypeData = async (userId: string | undefined) => {
  if (!userId) return { userType: null, isOnboarded: false };
  
  try {
    console.log("Fetching user type data for:", userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('user_type, is_onboarded')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("Error fetching user type data:", error);
      
      // Check if the profile doesn't exist, which would cause a 406 error
      if (error.code === "PGRST116") {
        console.log("Profile doesn't exist, creating one...");
        
        // Get user data to create a better profile
        const { data: userData } = await supabase.auth.getUser();
        const username = userData?.user?.user_metadata?.username || 
                        userData?.user?.email?.split('@')[0] || 
                        'user_' + userId.substring(0, 8);
        
        // Create a basic profile since it doesn't exist
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: username,
            user_type: null,
            is_onboarded: false
          });
          
        if (createError) {
          console.error("Failed to create profile:", createError);
        } else {
          console.log("Created missing profile for user", userId);
          return { userType: null, isOnboarded: false };
        }
      }
      
      return { userType: null, isOnboarded: false };
    }
    
    if (!data) {
      console.warn("No profile found for user:", userId);
      return { userType: null, isOnboarded: false };
    }
    
    return { 
      userType: data.user_type as UserType, 
      isOnboarded: data.is_onboarded === true // Ensure boolean type
    };
  } catch (err) {
    console.error("Unexpected error in getUserTypeData:", err);
    return { userType: null, isOnboarded: false };
  }
};

export const updateUserType = async (userId: string | undefined, type: UserType) => {
  if (!userId) return false;
  
  console.log(`Updating user type for ${userId} to ${type}`);
  
  try {
    // First make sure the profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', userId)
      .single();
      
    if (!existingProfile) {
      console.log(`No profile found for user ${userId}, creating one`);
      
      // Try to fetch the username from auth.users
      const { data: userData } = await supabase.auth.getUser();
      const username = userData?.user?.user_metadata?.username || 
                      userData?.user?.email?.split('@')[0] || 
                      'user_' + userId.substring(0, 8);
      
      // Create the profile if it doesn't exist
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: username,
          user_type: type,
          is_onboarded: false
        });
        
      if (createError) {
        console.error("Error creating profile:", createError);
        return false;
      }
      
      return true;
    }
    
    // Update existing profile
    const { error } = await supabase
      .from('profiles')
      .update({ user_type: type })
      .eq('id', userId);
      
    if (error) {
      console.error("Error updating user type:", error);
      return false;
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
    const { error } = await supabase
      .from('profiles')
      .update({ is_onboarded: true })
      .eq('id', userId);
      
    if (error) {
      console.error("Error completing onboarding:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Unexpected error in completeUserOnboarding:", err);
    return false;
  }
};
