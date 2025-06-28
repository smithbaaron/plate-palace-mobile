
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
  if (!supabaseUser) {
    console.log("❌ No supabase user provided");
    return null;
  }
  
  console.log("🔄 Formatting user:", supabaseUser.id, supabaseUser.email);
  
  // Get username from user metadata or email
  let username = supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '';
  let userType: "seller" | "customer" | null = null;
  let isOnboarded = false;
  
  try {
    // Try to get the profile
    console.log("🔍 Checking profiles table...");
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', supabaseUser.id)
      .single();
      
    if (data && !error) {
      username = data.username || username;
      console.log("✅ Profile found, username:", username);
    } else if (error && error.code === "PGRST116") {
      // Profile doesn't exist - this is normal for new users
      console.log("ℹ️ Profile doesn't exist yet for user:", supabaseUser.id);
    } else {
      console.log("⚠️ Profile check error:", error);
    }
  } catch (err) {
    console.error("💥 Error checking profile:", err);
  }
  
  // Check for seller profile to determine user type
  try {
    console.log("🔍 Checking seller_profiles table...");
    const { data: sellerProfile, error } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('user_id', supabaseUser.id)
      .single();
      
    if (sellerProfile && !error) {
      userType = 'seller';
      isOnboarded = true;
      console.log("✅ Seller profile found, user is onboarded seller");
    } else {
      console.log("ℹ️ No seller profile found:", error?.code);
    }
  } catch (err: any) {
    if (err.code !== "42P01") { // Ignore table not existing error
      console.error("💥 Error checking seller profile:", err);
    } else {
      console.log("ℹ️ seller_profiles table doesn't exist yet");
    }
  }
  
  const formattedUser = {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    username: username,
    userType: userType,
    isOnboarded: isOnboarded,
  };
  
  console.log("✅ User formatted:", formattedUser);
  return formattedUser;
};

// Authentication functions
export const loginWithEmail = async (email: string, password: string) => {
  console.log("🔐 Attempting login with email:", email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error("💥 Login error:", error);
    throw error;
  }
  console.log("✅ Login successful");
  return data;
};

export const signupWithEmail = async (email: string, password: string, username: string) => {
  try {
    console.log("📝 Starting signup process for:", email, username);
    
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
      console.error("💥 Signup error:", error);
      throw error;
    }
    
    if (!data.user) {
      console.error("❌ No user returned after signup");
      throw new Error("Failed to create user");
    }
    
    console.log("✅ User created successfully:", data.user.id);
    
    // Don't try to create profile manually here - let the database trigger handle it
    // or handle it gracefully during the auth flow
    
    return data;
  } catch (error: any) {
    console.error("💥 Error during signup process:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  console.log("👋 Logging out user");
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("💥 Logout error:", error);
    throw error;
  }
  console.log("✅ Logout successful");
};
