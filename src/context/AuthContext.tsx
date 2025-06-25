
import React, { createContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User, formatUser, loginWithEmail, signupWithEmail, logoutUser } from "@/lib/authUtils";

interface AuthContextType {
  currentUser: User | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
  checkAndResyncAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Function to check and resync auth state
  const checkAndResyncAuth = async (): Promise<boolean> => {
    try {
      console.log("Checking auth state...");
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession || !currentSession.user) {
        console.log("No session found");
        setCurrentUser(null);
        setSupabaseUser(null);
        setSession(null);
        return false;
      }
      
      console.log("Session found, formatting user");
      const formattedUser = await formatUser(currentSession.user);
      setCurrentUser(formattedUser);
      setSupabaseUser(currentSession.user);
      setSession(currentSession);
      return !!formattedUser;
    } catch (error) {
      console.error("Error checking auth state:", error);
      return false;
    }
  };

  // Set up the auth state listener
  useEffect(() => {
    let mounted = true;
    let loadingTimeout: NodeJS.Timeout;
    
    // Set a timeout to prevent infinite loading
    loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log("Auth loading timeout reached, setting loading to false");
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout
    
    // Initial auth check on mount
    const initializeAuth = async () => {
      console.log("Initializing auth...");
      try {
        await checkAndResyncAuth();
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (mounted) {
          clearTimeout(loadingTimeout);
          setLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    // Set up the subscription for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      
      if (!mounted) return;
      
      clearTimeout(loadingTimeout);
      setSession(newSession);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        try {
          console.log("User signed in, formatting user data");
          const formattedUser = await formatUser(newSession.user);
          setCurrentUser(formattedUser);
          setSupabaseUser(newSession.user);
          // Set loading to false with a small delay to ensure everything is processed
          setTimeout(() => {
            if (mounted) {
              setLoading(false);
            }
          }, 500);
        } catch (error) {
          console.error("Error formatting user after sign in:", error);
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setCurrentUser(null);
        setSupabaseUser(null);
        setLoading(false);
      }
    });
    
    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log("Starting login process...");
      setLoading(true);
      const result = await loginWithEmail(email, password);
      console.log("Login completed, user data will be set by auth listener");
      // Don't set loading to false here - let the auth state listener handle it
    } catch (error) {
      console.error("Login error", error);
      setLoading(false);
      throw error;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, username: string) => {
    try {
      console.log("Starting signup process...");
      setLoading(true);
      const result = await signupWithEmail(email, password, username);
      console.log("Signup completed, user data will be set by auth listener");
      return result;
    } catch (error) {
      console.error("Signup error", error);
      setLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      // User data will be cleared by the auth state listener
    } catch (error) {
      console.error("Logout error", error);
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    supabaseUser,
    isAuthenticated: !!currentUser,
    login,
    signup,
    logout,
    loading,
    checkAndResyncAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
