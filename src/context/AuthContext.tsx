
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

  const checkAndResyncAuth = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setCurrentUser(null);
        setSupabaseUser(null);
        return false;
      }
      
      const formattedUser = await formatUser(session.user);
      setCurrentUser(formattedUser);
      setSupabaseUser(session.user);
      return !!formattedUser;
    } catch (error) {
      console.error("Error checking auth state:", error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      await checkAndResyncAuth();
      if (mounted) {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        const formattedUser = await formatUser(session.user);
        setCurrentUser(formattedUser);
        setSupabaseUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setSupabaseUser(null);
      }
      setLoading(false);
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await loginWithEmail(email, password);
  };

  const signup = async (email: string, password: string, username: string) => {
    return await signupWithEmail(email, password, username);
  };

  const logout = async () => {
    await logoutUser();
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
