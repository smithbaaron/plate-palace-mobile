
import React, { createContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from '@supabase/supabase-js';
import { User, formatUser, loginWithEmail, signupWithEmail, logoutUser } from "@/lib/authUtils";

interface AuthContextType {
  currentUser: User | null;
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
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Function to check and resync auth state
  const checkAndResyncAuth = async (): Promise<boolean> => {
    try {
      console.log("Checking auth state...");
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log("No session found");
        setCurrentUser(null);
        setSession(null);
        return false;
      }
      
      console.log("Session found, formatting user");
      const formattedUser = await formatUser(currentSession.user);
      setCurrentUser(formattedUser);
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
    
    // Initial auth check on mount
    const initializeAuth = async () => {
      console.log("Initializing auth...");
      try {
        await checkAndResyncAuth();
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    // Set up the subscription for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      
      if (!mounted) return;
      
      setSession(newSession);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        try {
          console.log("User signed in, formatting user data");
          const formattedUser = await formatUser(newSession.user);
          setCurrentUser(formattedUser);
          setLoading(false); // Set loading to false immediately after sign in
        } catch (error) {
          console.error("Error formatting user after sign in:", error);
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setCurrentUser(null);
        setLoading(false);
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log("Starting login process...");
      const result = await loginWithEmail(email, password);
      console.log("Login completed, user data will be set by auth listener");
      // Don't set loading here - let the auth state listener handle it
    } catch (error) {
      console.error("Login error", error);
      throw error;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, username: string) => {
    try {
      console.log("Starting signup process...");
      const result = await signupWithEmail(email, password, username);
      console.log("Signup completed, user data will be set by auth listener");
      return result;
    } catch (error) {
      console.error("Signup error", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
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
