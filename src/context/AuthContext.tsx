
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

  // Simplified auth check function
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

  // Simplified auth initialization
  useEffect(() => {
    let mounted = true;
    let loadingTimeout: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      console.log("Initializing auth...");
      
      // Set a maximum loading time of 5 seconds
      loadingTimeout = setTimeout(() => {
        if (mounted) {
          console.log("Auth loading timeout - setting loading to false");
          setLoading(false);
        }
      }, 5000);
      
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
    
    // Simplified auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      
      if (!mounted) return;
      
      setSession(newSession);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        try {
          console.log("User signed in, formatting user data");
          const formattedUser = await formatUser(newSession.user);
          setCurrentUser(formattedUser);
          setSupabaseUser(newSession.user);
          setLoading(false);
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

  // Simplified login function
  const login = async (email: string, password: string) => {
    try {
      console.log("Starting login process...");
      await loginWithEmail(email, password);
      console.log("Login completed");
    } catch (error) {
      console.error("Login error", error);
      throw error;
    }
  };

  // Simplified signup function
  const signup = async (email: string, password: string, username: string) => {
    try {
      console.log("Starting signup process...");
      const result = await signupWithEmail(email, password, username);
      console.log("Signup completed");
      return result;
    } catch (error) {
      console.error("Signup error", error);
      throw error;
    }
  };

  // Simplified logout function
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error", error);
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
