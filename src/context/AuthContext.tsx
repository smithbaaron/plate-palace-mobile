
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
      await loginWithEmail(email, password);
      // User data will be set by the auth state listener
    } catch (error) {
      console.error("Login error", error);
      throw error;
    } finally {
      setLoading(false);
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
      throw error;
    } finally {
      setLoading(false);
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
