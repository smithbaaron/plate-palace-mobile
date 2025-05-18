
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
  
  // Get user metadata from the profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('username, user_type, is_onboarded')
    .eq('id', supabaseUser.id)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    // Create profile if it doesn't exist
    const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '';
    
    try {
      await supabase.from('profiles').upsert({
        id: supabaseUser.id,
        username: username,
        user_type: null,
        is_onboarded: false
      });
      
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: username,
        userType: null,
        isOnboarded: false,
      };
    } catch (createError) {
      console.error('Error creating user profile:', createError);
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: username,
        userType: null,
        isOnboarded: false,
      };
    }
  }
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    username: data.username || supabaseUser.email?.split('@')[0] || '',
    userType: data.user_type as "seller" | "customer" | null,
    isOnboarded: data.is_onboarded || false,
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
    
    if (error) throw error;
    
    // Wait a moment to ensure the auth session is established
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the current user to ensure we have the most up-to-date session
    const { data: currentUserData } = await supabase.auth.getUser();
    const user = currentUserData?.user || data.user;
    
    if (!user) {
      throw new Error("Could not retrieve user data after signup");
    }
    
    console.log("Creating profile for new user:", user.id);
    
    // Create a profile entry in the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: username,
        user_type: null,
        is_onboarded: false,
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });
      
    if (profileError) {
      console.error("Error creating profile", profileError);
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }
    
    console.log("Profile created successfully for user:", user.id);
    return data;
  } catch (error) {
    console.error("Error during signup process:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  return await supabase.auth.signOut();
};
