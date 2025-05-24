
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
  
  // Get username from user metadata or email
  let username = supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '';
  let userType: "seller" | "customer" | null = null;
  let isOnboarded = false;
  
  try {
    // Try to get the profile
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', supabaseUser.id)
      .single();
      
    if (data && !error) {
      username = data.username || username;
    } else if (error && error.code === "PGRST116") {
      // Profile doesn't exist - this is normal for new users
      console.log("Profile doesn't exist yet for user:", supabaseUser.id);
    }
  } catch (err) {
    console.error("Error checking profile:", err);
  }
  
  // Check for seller profile to determine user type
  try {
    const { data: sellerProfile, error } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('user_id', supabaseUser.id)
      .single();
      
    if (sellerProfile && !error) {
      userType = 'seller';
      isOnboarded = true;
    }
  } catch (err: any) {
    if (err.code !== "42P01") { // Ignore table not existing error
      console.error("Error checking seller profile:", err);
    }
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
      throw new Error("Failed to create user");
    }
    
    console.log("User created successfully:", data.user.id);
    
    // Don't try to create profile manually here - let the database trigger handle it
    // or handle it gracefully during the auth flow
    
    return data;
  } catch (error: any) {
    console.error("Error during signup process:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  return await supabase.auth.signOut();
};
