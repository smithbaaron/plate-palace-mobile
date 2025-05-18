
import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { UserType, getUserTypeData, updateUserType, completeUserOnboarding } from "@/lib/userTypeUtils";

interface UserTypeContextType {
  userType: UserType;
  setUserType: (type: UserType) => Promise<void>;
  isOnboarded: boolean;
  completeOnboarding: () => Promise<void>;
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
    try {
      const isAuthenticated = await checkAndResyncAuth();
      
      if (!isAuthenticated || !currentUser) {
        setUserTypeState(null);
        setIsOnboarded(false);
        return;
      }

      setUserTypeState(currentUser.userType);
      setIsOnboarded(currentUser.isOnboarded || false);
    } catch (error) {
      console.error("Error syncing user type data:", error);
    }
  };

  useEffect(() => {
    // Update state when currentUser changes
    if (currentUser) {
      setUserTypeState(currentUser.userType);
      setIsOnboarded(currentUser.isOnboarded || false);
    } else {
      setUserTypeState(null);
      setIsOnboarded(false);
    }
  }, [currentUser]);

  // Listen for storage events (for multi-tab/window sync)
  useEffect(() => {
    const handleStorageChange = () => {
      resyncUserTypeData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Initial sync on mount
    resyncUserTypeData();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setUserType = async (type: UserType) => {
    setUserTypeState(type);
    
    // Update the user in Supabase
    if (currentUser) {
      await updateUserType(currentUser.id, type);
    }
  };

  const completeOnboarding = async () => {
    setIsOnboarded(true);
    
    // Update the user in Supabase
    if (currentUser) {
      await completeUserOnboarding(currentUser.id);
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
