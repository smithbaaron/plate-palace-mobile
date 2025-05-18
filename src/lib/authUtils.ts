
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
    
  if (error || !data) {
    console.error('Error fetching user profile:', error);
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: supabaseUser.email?.split('@')[0] || '',
      userType: null,
      isOnboarded: false,
    };
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
  
  // Create a profile entry in the profiles table
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username: username,
        user_type: null,
        is_onboarded: false,
      });
      
    if (profileError) {
      console.error("Error creating profile", profileError);
    }
  }
  
  return data;
};

export const logoutUser = async () => {
  return await supabase.auth.signOut();
};
