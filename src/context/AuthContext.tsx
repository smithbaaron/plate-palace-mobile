
import React, { createContext, useState, useContext, useEffect } from "react";

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
  logout: () => void;
  loading: boolean;
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

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("nextplateUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // In a real app, these functions would interact with a backend
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock login - in a real app, this would be an API call
      const mockUser: User = {
        id: "mock-id-" + Math.random().toString(36).substring(2, 9),
        email,
        username: email.split("@")[0],
        userType: null, // User will select during onboarding
        isOnboarded: false,
      };
      
      setCurrentUser(mockUser);
      localStorage.setItem("nextplateUser", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Login error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      // Mock signup - in a real app, this would be an API call
      const mockUser: User = {
        id: "mock-id-" + Math.random().toString(36).substring(2, 9),
        email,
        username,
        userType: null, // User will select during onboarding
        isOnboarded: false,
      };
      
      setCurrentUser(mockUser);
      localStorage.setItem("nextplateUser", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Signup error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("nextplateUser");
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
