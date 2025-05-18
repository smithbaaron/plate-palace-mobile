
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

type UserType = "seller" | "customer" | null;

interface UserTypeContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  isOnboarded: boolean;
  completeOnboarding: () => void;
  resyncUserTypeData: () => Promise<void>;
  navigateToAuth: () => void;
}

const UserTypeContext = createContext<UserTypeContextType | undefined>(undefined);

export const useUserType = () => {
  const context = useContext(UserTypeContext);
  if (!context) {
    throw new Error("useUserType must be used within a UserTypeProvider");
  }
  return context;
};

interface UserTypeProviderProps {
  children: React.ReactNode;
  navigateToAuth?: () => void;
}

export const UserTypeProvider: React.FC<UserTypeProviderProps> = ({ 
  children, 
  navigateToAuth = () => window.location.href = '/auth'
}) => {
  const { currentUser, checkAndResyncAuth } = useAuth();
  const [userType, setUserTypeState] = useState<UserType>(currentUser?.userType || null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(currentUser?.isOnboarded || false);

  // Resync user type data from backend
  const resyncUserTypeData = async () => {
    const isAuthenticated = await checkAndResyncAuth();
    
    if (!isAuthenticated) {
      navigateToAuth();
      return;
    }

    // currentUser will be updated by checkAndResyncAuth
    if (currentUser) {
      setUserTypeState(currentUser.userType);
      setIsOnboarded(currentUser.isOnboarded);
    } else {
      setUserTypeState(null);
      setIsOnboarded(false);
    }
  };

  useEffect(() => {
    // Update state when currentUser changes
    if (currentUser) {
      setUserTypeState(currentUser.userType);
      setIsOnboarded(currentUser.isOnboarded);
    } else {
      setUserTypeState(null);
      setIsOnboarded(false);
    }

    // Resync on mount to handle LocalStorage changes outside app flow
    resyncUserTypeData();
  }, [currentUser]);

  // Listen for storage events (for multi-tab/window sync)
  useEffect(() => {
    const handleStorageChange = () => {
      resyncUserTypeData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setUserType = async (type: UserType) => {
    setUserTypeState(type);
    
    // Update the user in Supabase
    if (currentUser) {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: type })
        .eq('id', currentUser.id);
        
      if (error) {
        console.error("Error updating user type:", error);
      }
    }
  };

  const completeOnboarding = async () => {
    setIsOnboarded(true);
    
    // Update the user in Supabase
    if (currentUser) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_onboarded: true })
        .eq('id', currentUser.id);
        
      if (error) {
        console.error("Error completing onboarding:", error);
      }
    }
  };

  return (
    <UserTypeContext.Provider value={{ 
      userType, 
      setUserType, 
      isOnboarded, 
      completeOnboarding, 
      resyncUserTypeData,
      navigateToAuth 
    }}>
      {children}
    </UserTypeContext.Provider>
  );
};
