
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
    
    // Create the user in Supabase Auth
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
    
    // Wait a moment to ensure the auth session is established
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create profile entry with just the basic fields that exist
    try {
      console.log("Creating basic profile for user:", data.user.id);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          username,
        }, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });
      
      if (profileError) {
        console.error("Error creating profile during signup:", profileError);
        // Continue anyway since the auth user was created successfully
      } else {
        console.log("Basic profile created successfully for user:", data.user.id);
      }
    } catch (err) {
      console.error("Profile creation failed but continuing:", err);
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
