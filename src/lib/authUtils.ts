
import { supabase } from "./supabase";
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  username: string;
  userType: "seller" | "customer" | null;
  isOnboarded: boolean;
}

// Convert Supabase user to our app user format
export const formatUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
  if (!supabaseUser) return null;
  
  // First, try to get user metadata from the profiles table
  let username = supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '';
  let userType: "seller" | "customer" | null = null;
  let isOnboarded = false;
  
  try {
    // Try to get the profile, but only select columns that exist
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', supabaseUser.id)
      .single();
      
    if (data && !error) {
      username = data.username || username;
    } else if (error && error.code === "PGRST116") {
      // Profile doesn't exist, create a basic one
      console.log("Profile doesn't exist, creating basic profile for user:", supabaseUser.id);
      
      try {
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            username: username,
          });
          
        if (createError) {
          console.error("Failed to create basic profile:", createError);
        } else {
          console.log("Created basic profile for user", supabaseUser.id);
        }
      } catch (createErr) {
        console.error("Error creating basic profile:", createErr);
      }
    }
  } catch (err) {
    console.error("Error in formatUser:", err);
  }
  
  // For now, we'll determine user type and onboarding status from other sources
  // Check if they have a seller profile
  try {
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('user_id', supabaseUser.id)
      .single();
      
    if (sellerProfile) {
      userType = 'seller';
      isOnboarded = true; // If they have a seller profile, they're onboarded
    }
  } catch (err) {
    // Seller profile doesn't exist, that's fine
  }
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    username: username,
    userType: userType,
    isOnboarded: isOnboarded,
  };
};

// Authentication functions
export const loginWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signupWithEmail = async (email: string, password: string, username: string) => {
  try {
    console.log("Starting signup process for:", email, username);
    
    // Create the user in Supabase Auth - let the trigger handle profile creation
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    
    if (error) {
      console.error("Signup error:", error);
      throw error;
    }
    
    if (!data.user) {
      console.error("No user returned after signup");
      throw new Error("Failed to create user: undefined");
    }
    
    console.log("User created successfully:", data.user.id);
    
    // The database trigger should have created the profile automatically
    // Let's verify it exists and create it manually if needed
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for trigger
      
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      if (profileError && profileError.code === "PGRST116") {
        // Profile wasn't created by trigger, create it manually
        console.log("Creating profile manually for user:", data.user.id);
        
        const { error: manualCreateError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
          });
        
        if (manualCreateError) {
          console.error("Manual profile creation also failed:", manualCreateError);
          // Don't throw error - user account was created successfully
        } else {
          console.log("Manual profile creation successful");
        }
      } else if (!profileError) {
        console.log("Profile exists, signup complete");
      }
    } catch (profileErr) {
      console.error("Profile verification/creation failed but continuing:", profileErr);
    }
    
    return data;
  } catch (error: any) {
    console.error("Error during signup process:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  return await supabase.auth.signOut();
};
