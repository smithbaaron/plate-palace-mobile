
import React, { createContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from '@supabase/supabase-js';
import { User, formatUser, loginWithEmail, signupWithEmail, logoutUser } from "@/lib/authUtils";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<any>; // Updated return type
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
      setLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        setCurrentUser(null);
        setSession(null);
        setLoading(false);
        return false;
      }
      
      const formattedUser = await formatUser(currentSession.user);
      setCurrentUser(formattedUser);
      setSession(currentSession);
      setLoading(false);
      return !!formattedUser;
    } catch (error) {
      console.error("Error checking auth state:", error);
      setLoading(false);
      return false;
    }
  };

  // Set up the auth state listener
  useEffect(() => {
    let mounted = true;
    
    // Initial auth check on mount
    checkAndResyncAuth();
    
    // Set up the subscription for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      
      if (!mounted) return;
      
      setSession(newSession);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        try {
          const formattedUser = await formatUser(newSession.user);
          setCurrentUser(formattedUser);
        } catch (error) {
          console.error("Error formatting user after sign in:", error);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
      
      // Always set loading to false after handling auth state change
      setLoading(false);
    });
    
    // Add event listener for storage changes (if user clears localStorage in another tab)
    const handleStorageChange = () => {
      if (mounted) {
        checkAndResyncAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      // User data will be set by the auth state listener
    } catch (error) {
      console.error("Login error", error);
      setLoading(false);
      throw error;
    }
  };

  // Signup function - now explicitly returns the signup result
  const signup = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      const result = await signupWithEmail(email, password, username);
      return result; // Return the result to the caller
    } catch (error) {
      console.error("Signup error", error);
      setLoading(false);
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
