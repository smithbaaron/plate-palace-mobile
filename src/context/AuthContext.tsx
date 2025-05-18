
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  username: string;
  userType: "seller" | "customer" | null;
  isOnboarded: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  checkAndResyncAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Function to convert Supabase user to our app user
  const formatUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
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

  // Function to check and resync auth state
  const checkAndResyncAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        setCurrentUser(null);
        setSession(null);
        return false;
      }
      
      const formattedUser = await formatUser(currentSession.user);
      setCurrentUser(formattedUser);
      setSession(currentSession);
      return !!formattedUser;
    } catch (error) {
      console.error("Error checking auth state:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Set up the auth state listener
  useEffect(() => {
    // Initial auth check on mount
    checkAndResyncAuth();
    
    // Set up the subscription for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      setSession(newSession);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        const formattedUser = await formatUser(newSession.user);
        setCurrentUser(formattedUser);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });
    
    // Add event listener for storage changes (if user clears localStorage in another tab)
    const handleStorageChange = () => {
      checkAndResyncAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // User data will be set by the auth state listener
    } catch (error) {
      console.error("Login error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, username: string) => {
    setLoading(true);
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
      
      // User data will be set by the auth state listener
    } catch (error) {
      console.error("Signup error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // User data will be cleared by the auth state listener
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    signup,
    logout,
    loading,
    checkAndResyncAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
