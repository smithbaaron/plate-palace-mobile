
import { supabase } from "./supabase";
import { User } from "./authUtils";

export type UserType = "seller" | "customer" | null;

export const getUserTypeData = async (userId: string | undefined) => {
  if (!userId) return { userType: null, isOnboarded: false };
  
  const { data, error } = await supabase
    .from('profiles')
    .select('user_type, is_onboarded')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error("Error fetching user type data:", error);
    return { userType: null, isOnboarded: false };
  }
  
  if (!data) {
    console.warn("No profile found for user:", userId);
    return { userType: null, isOnboarded: false };
  }
  
  return { 
    userType: data.user_type as UserType, 
    isOnboarded: data.is_onboarded || false 
  };
};

export const updateUserType = async (userId: string | undefined, type: UserType) => {
  if (!userId) return false;
  
  // First make sure the profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();
    
  if (!existingProfile) {
    console.log(`No profile found for user ${userId}, creating one`);
    // Create the profile if it doesn't exist
    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
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
};

export const completeUserOnboarding = async (userId: string | undefined) => {
  if (!userId) return false;
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_onboarded: true })
    .eq('id', userId);
    
  if (error) {
    console.error("Error completing onboarding:", error);
    return false;
  }
  
  return true;
};
