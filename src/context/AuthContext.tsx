
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
      console.log("🔍 Checking auth state...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log("❌ No session found");
        setCurrentUser(null);
        setSupabaseUser(null);
        return false;
      }
      
      console.log("✅ Session found, formatting user...");
      const formattedUser = await formatUser(session.user);
      console.log("👤 Formatted user:", formattedUser);
      setCurrentUser(formattedUser);
      setSupabaseUser(session.user);
      return !!formattedUser;
    } catch (error) {
      console.error("💥 Error checking auth state:", error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      console.log("🚀 Initializing auth...");
      await checkAndResyncAuth();
      if (mounted) {
        console.log("✅ Auth initialization complete, setting loading to false");
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("🔄 Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const formattedUser = await formatUser(session.user);
        console.log("✅ User signed in:", formattedUser);
        setCurrentUser(formattedUser);
        setSupabaseUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log("👋 User signed out");
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
    console.log("🔐 Attempting login for:", email);
    await loginWithEmail(email, password);
  };

  const signup = async (email: string, password: string, username: string) => {
    console.log("📝 Attempting signup for:", email, username);
    return await signupWithEmail(email, password, username);
  };

  const logout = async () => {
    console.log("👋 Attempting logout");
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

  console.log("🎯 AuthProvider render - loading:", loading, "isAuthenticated:", !!currentUser);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
