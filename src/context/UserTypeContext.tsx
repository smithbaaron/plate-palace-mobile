
import React, { createContext, useState, useEffect, useContext } from "react";
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
  const { currentUser, isAuthenticated } = useAuth();
  const [userType, setUserTypeState] = useState<UserType>(currentUser?.userType || null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(currentUser?.isOnboarded || false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Resync user type data from backend
  const resyncUserTypeData = async () => {
    try {
      if (!isAuthenticated || !currentUser) {
        setUserTypeState(null);
        setIsOnboarded(false);
        return;
      }

      // Get fresh data from the database
      const userData = await getUserTypeData(currentUser.id);
      console.log("Resynced user type data:", userData);
      
      setUserTypeState(userData.userType);
      setIsOnboarded(userData.isOnboarded);
      // Don't return the userData object since the function is supposed to return void
    } catch (error) {
      console.error("Error syncing user type data:", error);
      // Don't return anything here either
    } finally {
      setIsInitialized(true);
    }
  };

  // Update state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      console.log("Current user updated in UserTypeContext:", currentUser);
      setUserTypeState(currentUser.userType);
      setIsOnboarded(currentUser.isOnboarded || false);
      setIsInitialized(true);
    } else if (isInitialized) {
      console.log("Current user is null in UserTypeContext");
      setUserTypeState(null);
      setIsOnboarded(false);
    }
  }, [currentUser]);

  // Initial sync on mount and when auth state changes
  useEffect(() => {
    console.log("Auth state in UserTypeContext:", { isAuthenticated });
    if (isAuthenticated) {
      resyncUserTypeData();
    }
  }, [isAuthenticated]);

  const setUserType = async (type: UserType) => {
    try {
      console.log("Setting user type to:", type);
      setUserTypeState(type);
      
      // Update the user in Supabase
      if (currentUser) {
        const success = await updateUserType(currentUser.id, type);
        if (!success) {
          throw new Error("Failed to update user type");
        }
        return;
      } else {
        throw new Error("No current user");
      }
    } catch (error) {
      console.error("Error setting user type:", error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      console.log("Completing onboarding");
      setIsOnboarded(true);
      
      // Update the user in Supabase
      if (currentUser) {
        const success = await completeUserOnboarding(currentUser.id);
        if (!success) {
          throw new Error("Failed to complete onboarding");
        }
      } else {
        throw new Error("No current user");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
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
